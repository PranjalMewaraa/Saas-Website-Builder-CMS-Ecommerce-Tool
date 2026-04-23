import { requireSession, requireModule } from "@acme/auth";
import {
  createCategoryAttribute,
  createStoreCategory,
} from "@acme/db-mysql";
import { NextResponse } from "next/server";
import { pool } from "@acme/db-mysql";

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const site_id = body.site_id || "";
  const store_id = String(body.store_id || "");

  await requireModule({ tenant_id, site_id, module: "catalog" });

  try {
    if (!store_id) {
      return NextResponse.json(
        { ok: false, error: "store_id is required" },
        { status: 400 },
      );
    }

    const [storeRows] = await pool.query<any[]>(
      `SELECT status FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
      [tenant_id, store_id],
    );
    const store = storeRows[0];
    if (!store) {
      return NextResponse.json(
        { ok: false, error: "Store not found" },
        { status: 404 },
      );
    }
    if (String(store.status) !== "active") {
      return NextResponse.json(
        { ok: false, error: "Store must be active to create category" },
        { status: 400 },
      );
    }

    const category = await createStoreCategory({
      tenant_id,
      store_id,
      name: body.name,
      slug: body.slug,
      parent_id: body.parent_id || null,
    });
    const attrs = Array.isArray(body.attributes) ? body.attributes : [];
    const seen = new Set<string>();
    let index = 0;
    for (const a of attrs) {
      const name = String(a?.name || "").trim();
      const code = String(a?.code || name)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_");
      const type = String(a?.type || "text");
      if (!name || !code || seen.has(code)) continue;
      seen.add(code);
      await createCategoryAttribute({
        tenant_id,
        store_id,
        category_id: category.id,
        code,
        name,
        type: type as any,
        is_required: Boolean(a?.is_required),
        is_filterable: a?.is_filterable !== false,
        sort_order: Number(a?.sort_order ?? index++),
        options: Array.isArray(a?.options) ? a.options.map(String) : [],
      });
    }
    return NextResponse.json({ ok: true, category });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Category creation failed" },
      { status: 400 },
    );
  }
}
