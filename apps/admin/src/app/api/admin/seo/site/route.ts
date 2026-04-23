import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { getMongoDb } from "@acme/db-mongo";
import { SiteSeoSchema } from "@acme/schemas";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id")!;

  await requireModule({ tenant_id, site_id, module: "builder" });

  const db = await getMongoDb();
  const snap = await db.collection("snapshots").findOne({
    tenant_id,
    site_id,
    is_draft: true,
  });

  return NextResponse.json({ ok: true, site_seo: snap?.site_seo || {} });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const body = await req.json();
  const parsed = SiteSeoSchema.parse(body.site_seo);

  const site_id = body.site_id;

  await requireModule({ tenant_id, site_id, module: "builder" });

  const db = await getMongoDb();
  await db
    .collection("snapshots")
    .updateOne(
      { tenant_id, site_id, is_draft: true },
      { $set: { site_seo: parsed } },
    );

  return NextResponse.json({ ok: true });
}
