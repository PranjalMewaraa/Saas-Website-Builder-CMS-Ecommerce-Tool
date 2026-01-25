import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";
import type { BrandRow } from "./types";

export async function listBrands(tenant_id: string): Promise<BrandRow[]> {
  const [rows] = await pool.query(
    `SELECT * FROM brands WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenant_id],
  );
  return rows as BrandRow[];
}

export async function createBrand(
  tenant_id: string,
  input: { name: string; slug?: string },
): Promise<BrandRow> {
  const id = newId("brand");
  const ts = nowSql();
  const slug =
    input.slug && input.slug.trim() ? slugify(input.slug) : slugify(input.name);
  const final_id = id.slice(0, 25);
  await pool.query(
    `INSERT INTO brands (id, tenant_id, name, slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [final_id, tenant_id, input.name.trim(), slug, ts, ts],
  );

  const [rows] = await pool.query(
    `SELECT * FROM brands WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, final_id],
  );
  return (rows as BrandRow[])[0];
}

export async function deleteBrand(tenant_id: string, brand_id: string) {
  // MVP: hard delete (ensure no products reference it first)
  await pool.query(`DELETE FROM brands WHERE tenant_id = ? AND id = ?`, [
    tenant_id,
    brand_id,
  ]);
}
export async function safeDeleteBrand(tenant_id: string, brand_id: string) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Remove store_brands mappings first
    await conn.query(
      `DELETE FROM store_brands WHERE tenant_id = ? AND brand_id = ?`,
      [tenant_id, brand_id],
    );

    // 2) Unlink products from this brand (so product rows remain)
    //    Alternative: delete products too (not recommended for MVP).
    await conn.query(
      `UPDATE products SET brand_id = NULL WHERE tenant_id = ? AND brand_id = ?`,
      [tenant_id, brand_id],
    );

    // 3) Now delete the brand
    await conn.query(`DELETE FROM brands WHERE tenant_id = ? AND id = ?`, [
      tenant_id,
      brand_id,
    ]);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
