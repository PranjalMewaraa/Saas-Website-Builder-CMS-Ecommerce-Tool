import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";
import type { CategoryRow } from "./types";

export async function listCategories(
  tenant_id: string
): Promise<CategoryRow[]> {
  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenant_id]
  );
  return rows as CategoryRow[];
}

export async function createCategory(
  tenant_id: string,
  input: { name: string; slug?: string; parent_id?: string | null }
): Promise<CategoryRow> {
  const id = newId("cat");
  const ts = nowSql();
  const slug =
    input.slug && input.slug.trim() ? slugify(input.slug) : slugify(input.name);

  await pool.query(
    `INSERT INTO categories (id, tenant_id, name, slug, parent_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, tenant_id, input.name.trim(), slug, input.parent_id ?? null, ts, ts]
  );

  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, id]
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
  category_id: string
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Remove product-category mappings first (FK safe)
    await conn.query(
      `DELETE FROM product_categories WHERE tenant_id = ? AND category_id = ?`,
      [tenant_id, category_id]
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
