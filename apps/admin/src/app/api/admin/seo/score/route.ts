import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth/require-session";
import { getSnapshotById } from "@acme/db-mongo";
import { scoreSeo } from "@acme/core/seo/score";

export async function POST(req: Request) {
  const session = await requireSession();
  const { snapshot_id, path } = await req.json();

  const snap = await getSnapshotById(snapshot_id);
  const page = snap?.pages?.[path];

  if (!page) {
    return NextResponse.json({ ok: false });
  }

  const seo = page.seo || {};

  const result = scoreSeo({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    ogImage: seo.ogImage,
  });

  return NextResponse.json({ ok: true, result });
}
