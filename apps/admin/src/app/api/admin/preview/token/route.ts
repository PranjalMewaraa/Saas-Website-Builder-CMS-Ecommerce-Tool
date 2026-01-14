import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { regenerateSitePreviewToken } from "@acme/db-mongo";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const token = await regenerateSitePreviewToken(tenant_id, site_id);
  return NextResponse.json({ ok: true, token });
}
