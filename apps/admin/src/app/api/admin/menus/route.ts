import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  listMenus,
  getOrCreateMenu,
  updateMenuDraftTree,
} from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const menus = await listMenus(tenant_id, site_id);
  return NextResponse.json({ ok: true, menus });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  const menu_id = body.menu_id;
  const name = body.name || "Menu";

  const menu = await getOrCreateMenu(tenant_id, site_id, menu_id, name);
  return NextResponse.json({ ok: true, menu });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  await updateMenuDraftTree(tenant_id, site_id, body.menu_id, body.tree);

  return NextResponse.json({ ok: true });
}
