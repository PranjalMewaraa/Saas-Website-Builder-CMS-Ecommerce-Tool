import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { softDeleteAsset } from "@acme/db-mongo";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "assets" });

  const body = await req.json();
  await softDeleteAsset(tenant_id, site_id, body.asset_id);

  return NextResponse.json({ ok: true });
}
