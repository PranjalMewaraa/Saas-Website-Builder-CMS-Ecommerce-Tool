import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  listPages,
  getOrCreateHomePage,
  updatePageDraftLayout,
} from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  await getOrCreateHomePage(tenant_id, site_id);
  const pages = await listPages(tenant_id, site_id);

  return NextResponse.json({ ok: true, pages });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  await updatePageDraftLayout(
    tenant_id,
    site_id,
    body.page_id,
    body.draft_layout
  );

  return NextResponse.json({ ok: true });
}
