import { getMongoDb } from "./index";

type RateLimitDoc = {
  _id: string;
  count: number;
  reset_at: Date;
  expires_at: Date;
};

export async function rateLimitsCollection() {
  const db = await getMongoDb();
  return db.collection<RateLimitDoc>("rate_limits");
}

/**
 * Fixed window limiter (atomic-ish with findOneAndUpdate)
 * - key: unique key per window (e.g. per minute)
 * - limit: max requests per window
 * - windowMs: length of window
 * Returns { allowed, remaining, resetAt }
 */
export async function consumeRateLimit(args: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const col = await rateLimitsCollection();
  const now = new Date();
  const resetAt = new Date(now.getTime() + args.windowMs);
  const expiresAt = new Date(resetAt.getTime() + 60_000); // TTL buffer

  let doc = await col.findOne({ _id: args.key });
  if (!doc) {
    doc = {
      _id: args.key,
      count: 1,
      reset_at: resetAt,
      expires_at: expiresAt,
    } as RateLimitDoc;
    await col.insertOne(doc);
  } else {
    const shouldReset = doc.reset_at && doc.reset_at <= now;
    const update: any = {
      $set: { expires_at: expiresAt },
    };
    if (shouldReset) {
      update.$set.count = 1;
      update.$set.reset_at = resetAt;
    } else {
      update.$inc = { count: 1 };
    }
    const res = await col.findOneAndUpdate({ _id: args.key }, update, {
      returnDocument: "after",
    });
    doc =
      (res.value as RateLimitDoc) ||
      (await col.findOne({ _id: args.key })) ||
      ({
        _id: args.key,
        count: 1,
        reset_at: resetAt,
        expires_at: expiresAt,
      } as RateLimitDoc);
  }

  const allowed = doc.count <= args.limit;
  const remaining = Math.max(0, args.limit - doc.count);

  return { allowed, remaining, resetAt: doc.reset_at };
}
