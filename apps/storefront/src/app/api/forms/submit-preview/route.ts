import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getSiteByHandle,
  getSnapshotById,
  createFormSubmission,
} from "@acme/db-mongo";
import { validateAgainstSnapshotForm } from "../../../../lib/forms-validate";
import { consumeRateLimit } from "@acme/db-mongo";
function newId() {
  return `sub_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getClientIp(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}
function dayKey(d = new Date()) {
  // YYYY-MM-DD
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function countUrls(text: string) {
  const matches = text.match(/https?:\/\/|www\./gi);
  return matches ? matches.length : 0;
}

function spamHeuristics(data: Record<string, any>) {
  // look for a likely "message" field, otherwise concatenate all strings
  const all = Object.values(data)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();

  const urls = countUrls(all);
  if (urls >= 2) return { blocked: true, reason: "Too many links" };

  // common spam terms (keep it small & safe)
  const bad = [
    "crypto",
    "bitcoin",
    "forex",
    "seo service",
    "backlinks",
    "casino",
    "loan",
  ];
  const hit = bad.find((w) => all.includes(w));
  if (hit) return { blocked: true, reason: "Spam keywords" };

  return { blocked: false as const };
}

export async function POST(req: Request) {
  const h = await headers();
  const body = await req.json();

  const handle = String(body.handle || "");
  const token = String(body.token || "");
  const form_id = String(body.form_id || "");
  const data = body.data || {};
  const honeypot = String(body.hp || "");

  if (honeypot) return NextResponse.json({ ok: true });

  const site = await getSiteByHandle(handle);
  if (!site)
    return NextResponse.json(
      { ok: false, error: "Site not found" },
      { status: 404 }
    );

  if (!site.preview_token || token !== site.preview_token) {
    return NextResponse.json(
      { ok: false, error: "Invalid preview token" },
      { status: 401 }
    );
  }

  if (!site.draft_snapshot_id) {
    return NextResponse.json(
      { ok: false, error: "No draft snapshot" },
      { status: 404 }
    );
  }
  // rate limit keys
  const ip = getClientIp(h) || "unknown";
  const minuteKey = `form:${site._id}:${form_id}:ip:${ip}:minute:${Math.floor(Date.now() / 60000)}`;
  const day = dayKey();
  const dayKeyId = `site:${site._id}:ip:${ip}:day:${day}`;

  // 5 per minute per form
  const rl1 = await consumeRateLimit({
    key: minuteKey,
    limit: 5,
    windowMs: 60_000,
  });
  if (!rl1.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again soon." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // 50 per day per site
  const rl2 = await consumeRateLimit({
    key: dayKeyId,
    limit: 50,
    windowMs: 24 * 60 * 60_000,
  });
  if (!rl2.allowed) {
    return NextResponse.json(
      { ok: false, error: "Daily limit reached. Try again tomorrow." },
      { status: 429, headers: { "Retry-After": "86400" } }
    );
  }

  // time-to-submit anti-bot
  const clientTs = Number(body.ts || 0);
  if (clientTs && Date.now() - clientTs < 2000) {
    return NextResponse.json(
      { ok: false, error: "Please try again." },
      { status: 400 }
    );
  }

  // heuristics
  const spam = spamHeuristics(data);
  if (spam.blocked) {
    // pretend ok to bots, but do NOT store
    return NextResponse.json({ ok: true });
  }

  const snapshot: any = await getSnapshotById(site.draft_snapshot_id);
  const result = validateAgainstSnapshotForm(snapshot, form_id, data);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, errors: (result as any).errors },
      { status: result.status }
    );
  }

  await createFormSubmission({
    _id: newId(),
    tenant_id: site.tenant_id,
    site_id: site._id,
    form_id,
    data,
    meta: {
      ip: getClientIp(h),
      user_agent: h.get("user-agent") || undefined,
      referer: h.get("referer") || undefined,
    },
    created_at: new Date(),
  });

  return NextResponse.json({ ok: true, message: result.message });
}
