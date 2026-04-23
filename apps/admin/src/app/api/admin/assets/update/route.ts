import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { assetsCollection } from "@acme/db-mongo";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "assets" });

  const body = await req.json();
  const asset_id = String(body.asset_id || "");
  if (!asset_id)
    return NextResponse.json(
      { ok: false, error: "Missing asset_id" },
      { status: 400 }
    );

  const update: any = { updated_at: new Date() };
  if (Array.isArray(body.tags)) update.tags = body.tags;
  if (typeof body.folder === "string") update.folder = body.folder;

  const col = await assetsCollection();
  await col.updateOne({ _id: asset_id, tenant_id, site_id }, { $set: update });

  return NextResponse.json({ ok: true });
}
