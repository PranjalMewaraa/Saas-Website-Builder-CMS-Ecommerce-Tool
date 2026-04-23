import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";
import type { CategoryRow } from "./types";

export async function listCategories(
  tenant_id: string,
): Promise<CategoryRow[]> {
  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenant_id],
  );
  return rows as CategoryRow[];
}

export async function createCategory(
  tenant_id: string,
  input: { name: string; slug?: string; parent_id?: string | null },
): Promise<CategoryRow> {
  const id = newId("cat");
  const ts = nowSql();
  const baseSlug =
    input.slug && input.slug.trim() ? slugify(input.slug) : slugify(input.name);
  const slug = await ensureUniqueCategorySlug(tenant_id, baseSlug);
  const final_id = id.slice(0, 20);
  await pool.query(
    `INSERT INTO categories (id, tenant_id, name, slug, parent_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      final_id,
      tenant_id,
      input.name.trim(),
      slug,
      input.parent_id ?? null,
      ts,
      ts,
    ],
  );

  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, final_id],
  );
  return (rows as CategoryRow[])[0];
}

export async function deleteCategory(tenant_id: string, category_id: string) {
  await pool.query(`DELETE FROM categories WHERE tenant_id = ? AND id = ?`, [
    tenant_id,
    category_id,
  ]);
}
export async function safeDeleteCategory(
  tenant_id: string,
  category_id: string,
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT parent_id FROM categories WHERE tenant_id = ? AND id = ? LIMIT 1`,
      [tenant_id, category_id],
    );
    const parent_id = (rows as any[])[0]?.parent_id ?? null;

    // Re-parent child categories to this category's parent (or null)
    await conn.query(
      `UPDATE categories SET parent_id = ? WHERE tenant_id = ? AND parent_id = ?`,
      [parent_id, tenant_id, category_id],
    );

    // Remove product-category mappings first (FK safe)
    await conn.query(
      `DELETE FROM product_categories WHERE tenant_id = ? AND category_id = ?`,
      [tenant_id, category_id],
    );

    // If you later add category-specific rules, delete those here too.

    // Now delete the category
    await conn.query(`DELETE FROM categories WHERE tenant_id = ? AND id = ?`, [
      tenant_id,
      category_id,
    ]);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function ensureUniqueCategorySlug(tenant_id: string, base: string) {
  let slug = base || "category";
  let i = 2;
  while (true) {
    const [rows] = await pool.query(
      `SELECT id FROM categories WHERE tenant_id = ? AND slug = ? LIMIT 1`,
      [tenant_id, slug],
    );
    if (!(rows as any[]).length) return slug;
    slug = `${base}-${i++}`;
  }
}
