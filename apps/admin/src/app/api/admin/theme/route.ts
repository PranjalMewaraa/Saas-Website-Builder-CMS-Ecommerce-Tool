import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { getOrCreateTheme, updateThemeDraftTokens } from "@acme/db-mongo";
import { updateThemeBrand } from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const theme = await getOrCreateTheme(tenant_id, site_id);
  return NextResponse.json({ ok: true, theme });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  const tokens = body.tokens || {};
  const brand = body.brand;
  await updateThemeDraftTokens(tenant_id, site_id, tokens);
  if (brand) await updateThemeBrand(tenant_id, site_id, brand);

  return NextResponse.json({ ok: true });
}
