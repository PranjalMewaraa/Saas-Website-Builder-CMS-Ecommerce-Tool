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

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json().catch(() => ({}));
  const site_id = body.site_id || "";
  await requireModule({ tenant_id, site_id, module: "catalog" });

  const store_id = String(body.store_id || "");
  const category_id = String(body.category_id || "");
  const name = String(body.name || "").trim();
  const attributes = Array.isArray(body.attributes) ? body.attributes : [];

  if (!store_id || !category_id || !name) {
    return NextResponse.json(
      { ok: false, error: "store_id, category_id and name are required" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [catRows] = await conn.query<any[]>(
      `SELECT id FROM store_categories
       WHERE tenant_id = ? AND store_id = ? AND id = ? LIMIT 1`,
      [tenant_id, store_id, category_id],
    );
    if (!catRows[0]) {
      await conn.rollback();
      return NextResponse.json(
        { ok: false, error: "Category not found for this store" },
        { status: 404 },
      );
    }

    await conn.query(
      `UPDATE store_categories
       SET name = ?, updated_at = NOW()
       WHERE tenant_id = ? AND store_id = ? AND id = ?`,
      [name, tenant_id, store_id, category_id],
    );

    const [existingAttrs] = await conn.query<any[]>(
      `SELECT id FROM store_category_attributes
       WHERE tenant_id = ? AND store_id = ? AND category_id = ?`,
      [tenant_id, store_id, category_id],
    );
    const existingAttrIds = existingAttrs.map((a) => a.id);
    if (existingAttrIds.length) {
      await conn.query(
        `DELETE FROM store_category_attribute_options
         WHERE tenant_id = ? AND attribute_id IN (?)`,
        [tenant_id, existingAttrIds],
      );
    }
    await conn.query(
      `DELETE FROM store_category_attributes
       WHERE tenant_id = ? AND store_id = ? AND category_id = ?`,
      [tenant_id, store_id, category_id],
    );

    for (let i = 0; i < attributes.length; i++) {
      const a = attributes[i] || {};
      const code = String(a.code || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      const attrName = String(a.name || "").trim();
      const type = String(a.type || "text");
      if (!code || !attrName) continue;

      const attrId = `sca_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`.slice(
        0,
        26,
      );
      await conn.query(
        `INSERT INTO store_category_attributes
         (id, tenant_id, store_id, category_id, code, name, type, is_required, is_filterable, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          attrId,
          tenant_id,
          store_id,
          category_id,
          code,
          attrName,
          type,
          a.is_required ? 1 : 0,
          a.is_filterable === false ? 0 : 1,
          Number(a.sort_order ?? i),
        ],
      );

      const options = Array.isArray(a.options)
        ? a.options.map((x: any) => String(x).trim()).filter(Boolean)
        : [];
      for (let j = 0; j < options.length; j++) {
        const value = options[j]!;
        const optId = `scao_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`.slice(
          0,
          26,
        );
        await conn.query(
          `INSERT INTO store_category_attribute_options
           (id, tenant_id, attribute_id, label, value, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [optId, tenant_id, attrId, value, value, j],
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update category" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}
