import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import {
  listMenus,
  getOrCreateMenu,
  updateMenuDraftTree,
  publishMenu,
  assignMenuSlot,
} from "@acme/db-mongo";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const site_id = new URL(req.url).searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const menus = await listMenus(tenant_id, site_id);
  return NextResponse.json({ ok: true, menus });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const site_id = new URL(req.url).searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();

  if (body.action === "publish") {
    await publishMenu(tenant_id, site_id, body.menu_id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "assign") {
    await assignMenuSlot(tenant_id, site_id, body.menu_id, body.slot);
    return NextResponse.json({ ok: true });
  }

  const menu = await getOrCreateMenu(
    tenant_id,
    site_id,
    body.menu_id,
    body.name || body.menu_id,
  );

  return NextResponse.json({ ok: true, menu });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const site_id = new URL(req.url).searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  await updateMenuDraftTree(tenant_id, site_id, body.menu_id, body.tree);

  return NextResponse.json({ ok: true });
}
