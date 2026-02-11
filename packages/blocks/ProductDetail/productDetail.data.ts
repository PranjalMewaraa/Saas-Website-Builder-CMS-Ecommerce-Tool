import type { StorefrontProduct } from "../ProductList/productList.data";
import { getPublishedProductsByIds } from "../ProductList/productList.data";
import { getProductV2BySlug } from "../../db-mysql/commerceV2.repo";

export async function getPublishedProductBySlug(args: {
  tenant_id: string;
  store_id: string;
  slug: string;
}): Promise<StorefrontProduct | null> {
  const v2Product = await getProductV2BySlug({
    tenant_id: args.tenant_id,
    store_id: args.store_id,
    slug: args.slug,
  });
  if (v2Product) {
    return {
      id: String(v2Product.id),
      slug: String(v2Product.slug),
      title: String(v2Product.title),
      description: v2Product.description == null ? null : String(v2Product.description),
      base_price_cents: Number(v2Product.base_price_cents || 0),
      compare_at_price_cents:
        v2Product.compare_at_price_cents == null
          ? null
          : Number(v2Product.compare_at_price_cents),
      brand_id: v2Product.brand_id ? String(v2Product.brand_id) : null,
      categories: Array.isArray(v2Product.categories)
        ? v2Product.categories.map((c: any) => String(c))
        : [],
      images: Array.isArray(v2Product.images)
        ? v2Product.images.map((img: any) => ({
            url: String(img.url || ""),
            alt: img.alt == null ? null : String(img.alt),
            sort_order: Number(img.sort_order || 0),
            variant_id: img.variant_id ? String(img.variant_id) : null,
          }))
        : [],
      variants: Array.isArray(v2Product.variants)
        ? v2Product.variants.map((v: any) => ({
            id: String(v.id),
            sku: v.sku == null ? null : String(v.sku),
            price_cents: Number(v.price_cents || 0),
            compare_at_price_cents:
              v.compare_at_price_cents == null
                ? null
                : Number(v.compare_at_price_cents),
            inventory_qty: Number(v.inventory_qty || 0),
            options:
              v.options && typeof v.options === "object" && !Array.isArray(v.options)
                ? v.options
                : {},
          }))
        : [],
      attributes: Array.isArray(v2Product.attributes)
        ? v2Product.attributes.map((a: any) => ({
            code: String(a.code || ""),
            name: String(a.name || a.code || ""),
            type: String(a.type || "text"),
            value: a.value ?? null,
          }))
        : [],
    };
  }

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
