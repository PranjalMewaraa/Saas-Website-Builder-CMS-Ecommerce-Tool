import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";
import type { ProductRow, ProductVariantRow } from "./types";

export async function listProducts(tenant_id: string): Promise<ProductRow[]> {
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenant_id]
  );
  return rows as ProductRow[];
}

export async function listProductsForStore(args: {
  tenant_id: string;
  store_id: string;
}): Promise<(ProductRow & { is_published: number })[]> {
  const [rows] = await pool.query(
    `
    SELECT p.*, COALESCE(sp.is_published, 0) as is_published
    FROM products p
    LEFT JOIN store_products sp
      ON sp.tenant_id = p.tenant_id
     AND sp.product_id = p.id
     AND sp.store_id = ?
    WHERE p.tenant_id = ?
    ORDER BY p.created_at DESC
    `,
    [args.store_id, args.tenant_id]
  );
  return rows as any;
}

export async function createProduct(
  tenant_id: string,
  input: {
    title: string;
    slug?: string;
    description?: string | null;
    brand_id?: string | null;
    status?: "draft" | "active" | "archived";
    base_price_cents: number;
    sku?: string | null;
  }
): Promise<ProductRow> {
  const id = newId("prod");
  const ts = nowSql();
  const slug =
    input.slug && input.slug.trim()
      ? slugify(input.slug)
      : slugify(input.title);

  await pool.query(
    `
    INSERT INTO products
      (id, tenant_id, brand_id, title, slug, description, status, base_price_cents, sku, custom_data, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `,
    [
      id,
      tenant_id,
      input.brand_id ?? null,
      input.title.trim(),
      slug,
      input.description ?? null,
      input.status ?? "draft",
      input.base_price_cents,
      input.sku ?? null,
      ts,
      ts,
    ]
  );

  // MVP: create one default variant with same price
  const variant_id = newId("var");
  await pool.query(
    `
    INSERT INTO product_variants
      (id, tenant_id, product_id, sku, price_cents, compare_at_price_cents, options_json, inventory_qty, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, NULL, JSON_OBJECT('default', true), 0, ?, ?)
    `,
    [
      variant_id,
      tenant_id,
      id,
      input.sku ?? null,
      input.base_price_cents,
      ts,
      ts,
    ]
  );

  const [rows] = await pool.query(
    `SELECT * FROM products WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, id]
  );
  return (rows as ProductRow[])[0];
}

export async function deleteProduct(tenant_id: string, product_id: string) {
  await pool.query(`DELETE FROM products WHERE tenant_id = ? AND id = ?`, [
    tenant_id,
    product_id,
  ]);
}

export async function setStoreProductPublished(args: {
  tenant_id: string;
  store_id: string;
  product_id: string;
  is_published: boolean;
}) {
  const ts = nowSql();
  await pool.query(
    `
    INSERT INTO store_products (tenant_id, store_id, product_id, is_published, overrides, created_at, updated_at)
    VALUES (?, ?, ?, ?, NULL, ?, ?)
    ON DUPLICATE KEY UPDATE is_published = VALUES(is_published), updated_at = VALUES(updated_at)
    `,
    [
      args.tenant_id,
      args.store_id,
      args.product_id,
      args.is_published ? 1 : 0,
      ts,
      ts,
    ]
  );
}
