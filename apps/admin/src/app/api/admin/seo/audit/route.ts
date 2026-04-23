import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth/require-session";
import { snapshotsCollection } from "@acme/db-mongo";
import { scoreSeo } from "@acme/core/seo/score";

export async function GET(req: Request) {
  const session = await requireSession();
  const snapshot_id = new URL(req.url).searchParams.get("snapshot_id")!;

  const snap = await snapshotsCollection().then((c) =>
    c.findOne({ _id: snapshot_id }),
  );

  const report = Object.entries(snap?.pages || {}).map(([path, p]: any) => {
    const seo = p.seo || {};
    const score = scoreSeo(seo);
    return { path, ...score };
  });

  return NextResponse.json({ ok: true, report });
}
