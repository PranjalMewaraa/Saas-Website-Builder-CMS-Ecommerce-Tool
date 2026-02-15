import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { listStoreTypePresets } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });
  return NextResponse.json({ ok: true, presets: listStoreTypePresets() });
}
