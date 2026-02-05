import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";
import type { ProductRow, ProductVariantRow } from "./types";

export async function listProducts(tenant_id: string): Promise<ProductRow[]> {
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenant_id],
  );
  return rows as ProductRow[];
}

export async function getProduct(
  tenant_id: string,
  product_id: string,
): Promise<ProductRow | null> {
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, product_id],
  );
  const arr = rows as ProductRow[];
  return arr[0] ?? null;
}

export async function listProductCategoryIds(
  tenant_id: string,
  product_id: string,
): Promise<string[]> {
  const [rows] = await pool.query(
    `SELECT category_id FROM product_categories WHERE tenant_id = ? AND product_id = ?`,
    [tenant_id, product_id],
  );
  return (rows as any[]).map((r) => String(r.category_id));
}

export async function listProductsForStore(args: {
  tenant_id: string;
  store_id: string;
}): Promise<(ProductRow & { is_published: number })[]> {
  console.log("storeid", args.store_id);
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
    [args.store_id, args.tenant_id],
  );
  console.log("storeidprod", rows);
  return rows as any;
}

export async function listProductsForStoreFiltered(args: {
  tenant_id: string;
  store_id: string;
  status?: "draft" | "active" | "archived";
}): Promise<(ProductRow & { is_published: number })[]> {
  const whereStatus = args.status ? "AND p.status = ?" : "";
  const params = args.status
    ? [args.store_id, args.tenant_id, args.status]
    : [args.store_id, args.tenant_id];

  const [rows] = await pool.query(
    `
    SELECT p.*, COALESCE(sp.is_published, 0) as is_published
    FROM products p
    LEFT JOIN store_products sp
      ON sp.tenant_id = p.tenant_id
     AND sp.product_id = p.id
     AND sp.store_id = ?
    WHERE p.tenant_id = ?
    ${whereStatus}
    ORDER BY p.created_at DESC
    `,
    params,
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
    store_id?: string;
    category_ids?: string[];
  },
): Promise<ProductRow> {
  const id = newId("prod");
  const ts = nowSql();
  const baseSlug =
    input.slug && input.slug.trim()
      ? slugify(input.slug)
      : slugify(input.title);
  const slug = await ensureUniqueProductSlug(tenant_id, baseSlug);

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
    ],
  );

  if (input.category_ids?.length) {
    for (const cat_id of input.category_ids) {
      await pool.query(
        `INSERT INTO product_categories (tenant_id, product_id, category_id, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)`,
        [tenant_id, id, cat_id, ts],
      );
    }
  }

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
    ],
  );

  if (input.store_id) {
    await pool.query(
      `
      INSERT INTO store_products (tenant_id, store_id, product_id, is_published, overrides, created_at, updated_at)
      VALUES (?, ?, ?, ?, NULL, ?, ?)
      ON DUPLICATE KEY UPDATE is_published = VALUES(is_published), updated_at = VALUES(updated_at)
      `,
      [
        tenant_id,
        input.store_id,
        id,
        input.status === "active" ? 1 : 0,
        ts,
        ts,
      ],
    );
  }

  const [rows] = await pool.query(
    `SELECT * FROM products WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, id],
  );
  return (rows as ProductRow[])[0];
}

async function ensureUniqueProductSlug(tenant_id: string, base: string) {
  let slug = base || "product";
  let i = 2;
  while (true) {
    const [rows] = await pool.query(
      `SELECT id FROM products WHERE tenant_id = ? AND slug = ? LIMIT 1`,
      [tenant_id, slug],
    );
    if (!(rows as any[]).length) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function updateProduct(
  tenant_id: string,
  product_id: string,
  input: {
    title?: string;
    slug?: string;
    description?: string | null;
    brand_id?: string | null;
    status?: "draft" | "active" | "archived";
    base_price_cents?: number;
    sku?: string | null;
    store_id?: string;
    category_ids?: string[];
  },
) {
  const existing = await getProduct(tenant_id, product_id);
  if (!existing) return null;

  let nextSlug = existing.slug;
  if (input.slug && input.slug.trim() && input.slug !== existing.slug) {
    const base = slugify(input.slug);
    nextSlug = await ensureUniqueProductSlug(tenant_id, base);
  }

  const ts = nowSql();
  await pool.query(
    `
    UPDATE products
    SET title = ?, slug = ?, description = ?, brand_id = ?, status = ?,
        base_price_cents = ?, sku = ?, updated_at = ?
    WHERE tenant_id = ? AND id = ?
    `,
    [
      input.title ?? existing.title,
      nextSlug,
      input.description ?? existing.description,
      input.brand_id ?? existing.brand_id,
      input.status ?? existing.status,
      input.base_price_cents ?? existing.base_price_cents,
      input.sku ?? existing.sku,
      ts,
      tenant_id,
      product_id,
    ],
  );

  if (input.category_ids) {
    await pool.query(
      `DELETE FROM product_categories WHERE tenant_id = ? AND product_id = ?`,
      [tenant_id, product_id],
    );
    for (const cat_id of input.category_ids) {
      await pool.query(
        `INSERT INTO product_categories (tenant_id, product_id, category_id, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)`,
        [tenant_id, product_id, cat_id, ts],
      );
    }
  }

  if (input.store_id) {
    await pool.query(
      `
      INSERT INTO store_products (tenant_id, store_id, product_id, is_published, overrides, created_at, updated_at)
      VALUES (?, ?, ?, ?, NULL, ?, ?)
      ON DUPLICATE KEY UPDATE is_published = VALUES(is_published), updated_at = VALUES(updated_at)
      `,
      [
        tenant_id,
        input.store_id,
        product_id,
        (input.status ?? existing.status) === "active" ? 1 : 0,
        ts,
        ts,
      ],
    );
  }

  const [rows] = await pool.query(
    `SELECT * FROM products WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenant_id, product_id],
  );
  return (rows as ProductRow[])[0];
}

export async function setProductStatus(
  tenant_id: string,
  product_id: string,
  status: "draft" | "active" | "archived",
) {
  const ts = nowSql();
  await pool.query(
    `UPDATE products SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?`,
    [status, ts, tenant_id, product_id],
  );
}

export async function setProductsStatus(
  tenant_id: string,
  product_ids: string[],
  status: "draft" | "active" | "archived",
) {
  if (!product_ids.length) return;
  const ts = nowSql();
  const placeholders = product_ids.map(() => "?").join(",");
  await pool.query(
    `UPDATE products SET status = ?, updated_at = ? WHERE tenant_id = ? AND id IN (${placeholders})`,
    [status, ts, tenant_id, ...product_ids],
  );
}

export async function deleteProducts(tenant_id: string, product_ids: string[]) {
  if (!product_ids.length) return;
  const placeholders = product_ids.map(() => "?").join(",");
  await pool.query(
    `DELETE FROM products WHERE tenant_id = ? AND id IN (${placeholders})`,
    [tenant_id, ...product_ids],
  );
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
    ],
  );
}
