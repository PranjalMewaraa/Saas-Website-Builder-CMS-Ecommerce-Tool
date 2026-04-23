import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import {
  createCategoryAttribute,
  listCategoryAttributes,
  listCategoryAttributesResolved,
} from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";
  const category_id = searchParams.get("category_id") || "";
  const includeInherited = searchParams.get("include_inherited") === "1";
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id || !category_id) {
    return NextResponse.json(
      { ok: false, error: "store_id and category_id are required" },
      { status: 400 },
    );
  }
  const attributes = includeInherited
    ? await listCategoryAttributesResolved({
        tenant_id,
        store_id,
        category_id,
      })
    : await listCategoryAttributes({
        tenant_id,
        store_id,
        category_id,
      });
  return NextResponse.json({ ok: true, attributes });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!body.store_id || !body.category_id || !body.code || !body.name || !body.type) {
    return NextResponse.json(
      { ok: false, error: "store_id, category_id, code, name, type are required" },
      { status: 400 },
    );
  }

  const attr = await createCategoryAttribute({
    tenant_id,
    store_id: body.store_id,
    category_id: body.category_id,
    code: body.code,
    name: body.name,
    type: body.type,
    is_required: Boolean(body.is_required),
    is_filterable: body.is_filterable !== false,
    sort_order: Number(body.sort_order || 0),
    options: Array.isArray(body.options) ? body.options.map(String) : [],
  });
  return NextResponse.json({ ok: true, attribute: attr });
}
