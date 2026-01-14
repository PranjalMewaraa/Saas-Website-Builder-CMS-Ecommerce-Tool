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

  const res = await col.findOneAndUpdate(
    { _id: args.key },
    {
      $setOnInsert: { count: 0, reset_at: resetAt, expires_at: expiresAt },
      $inc: { count: 1 },
      $set: { expires_at: expiresAt },
    },
    { upsert: true, returnDocument: "after" }
  );

  const doc = res.value;
  const allowed = doc.count <= args.limit;
  const remaining = Math.max(0, args.limit - doc.count);

  return { allowed, remaining, resetAt: doc.reset_at };
}
