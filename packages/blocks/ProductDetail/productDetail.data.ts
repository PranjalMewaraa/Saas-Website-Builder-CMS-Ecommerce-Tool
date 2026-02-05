import type { StorefrontProduct } from "../ProductList/productList.data";
import { getPublishedProductsByIds } from "../ProductList/productList.data";

export async function getPublishedProductBySlug(args: {
  tenant_id: string;
  store_id: string;
  slug: string;
}): Promise<StorefrontProduct | null> {
  const { pool } = await import("../../db-mysql");

  const [rows] = await pool.query<any[]>(
    `
    SELECT p.*
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
      AND p.slug = ?
    LIMIT 1
    `,
    [args.tenant_id, args.store_id, args.slug],
  );

  if (!rows.length) return null;

  const productIds = [rows[0].id];
  const full = await getPublishedProductsByIds(args.tenant_id, rows, productIds);
  return full[0] || null;
}

export async function listRelatedProducts(args: {
  tenant_id: string;
  store_id: string;
  product: StorefrontProduct;
  limit: number;
}): Promise<StorefrontProduct[]> {
  const { pool } = await import("../../db-mysql");
  const categoryIds = args.product.categories || [];
  const brandId = args.product.brand_id || "";

  const where: string[] = [
    "sp.tenant_id = ?",
    "sp.store_id = ?",
    "sp.is_published = 1",
    "p.status = 'active'",
    "p.id <> ?",
  ];
  const params: any[] = [args.tenant_id, args.store_id, args.product.id];

  if (categoryIds.length) {
    where.push(
      `p.id IN (
        SELECT pc.product_id
        FROM product_categories pc
        WHERE pc.tenant_id = ? AND pc.category_id IN (${categoryIds
          .map(() => "?")
          .join(",")})
      )`,
    );
    params.push(args.tenant_id, ...categoryIds);
  } else if (brandId) {
    where.push("p.brand_id = ?");
    params.push(brandId);
  }

  const [rows] = await pool.query<any[]>(
    `
    SELECT p.*
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE ${where.join(" AND ")}
    ORDER BY p.created_at DESC
    LIMIT ?
    `,
    [...params, args.limit],
  );

  if (!rows.length) return [];
  const productIds = rows.map((r) => r.id);
  const full = await getPublishedProductsByIds(args.tenant_id, rows, productIds);
  return full.slice(0, args.limit);
}
