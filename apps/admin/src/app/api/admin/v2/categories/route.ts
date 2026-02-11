import { NextResponse } from "next/server";
import { requireModule, requireSession } from "@acme/auth";
import { createStoreCategory, listStoreCategories, pool } from "@acme/db-mysql";

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const store_id = searchParams.get("store_id") || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!store_id) {
    return NextResponse.json(
      { ok: false, error: "store_id is required" },
      { status: 400 },
    );
  }
  const categories = await listStoreCategories({ tenant_id, store_id });
  return NextResponse.json({ ok: true, categories });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });
  if (!body.store_id || !body.name) {
    return NextResponse.json(
      { ok: false, error: "store_id and name are required" },
      { status: 400 },
    );
  }
  const [storeRows] = await pool.query<any[]>(
    `SELECT status FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, body.store_id],
  );
  if (!storeRows[0]) {
    return NextResponse.json(
      { ok: false, error: "Store not found" },
      { status: 404 },
    );
  }
  if (String(storeRows[0].status) !== "active") {
    return NextResponse.json(
      { ok: false, error: "Store must be active to create category" },
      { status: 400 },
    );
  }
  const category = await createStoreCategory({
    tenant_id,
    store_id: body.store_id,
    name: body.name,
    slug: body.slug,
    parent_id: body.parent_id || null,
  });
  return NextResponse.json({ ok: true, category });
}
