export type GridProduct = {
  id: string;
  slug: string;
  title: string;
  base_price_cents: number;
};
export type ProductImage = {
  url: string;
  alt: string | null;
  sort_order: number;
  variant_id?: string | null;
};

export type ProductVariant = {
  id: string;
  sku: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  options: Record<string, string>;
  inventory_qty: number;
};

export type ProductAttribute = {
  code: string;
  name: string;
  type: string;
  value: string | number | boolean | string[] | null;
};

function parseOptionsJson(raw: any): Record<string, string> {
  if (!raw) return {};
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    const key = String(k || "").trim();
    const value = v == null ? "" : String(v).trim();
    if (!key || !value) continue;
    out[key] = value;
  }
  return out;
}

export type StorefrontProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  base_price_cents: number;
  compare_at_price_cents: number | null;

  brand_id: string | null;
  categories: string[];

  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
};

export async function listPublishedProductsForStore(args: {
  tenant_id: string;
  store_id: string;
  limit: number;
}): Promise<StorefrontProduct[]> {
  // =============================
  // CLIENT / VISUAL EDITOR MOCK
  // =============================
  if (typeof window !== "undefined") {
    return Array.from({ length: args.limit }).map((_, i) => ({
      id: `mock-${i}`,
      slug: `sample-product-${i + 1}`,
      title: `Sample Product ${i + 1}`,
      description: "Sample product description",
      base_price_cents: 1999,
      compare_at_price_cents: null,
      brand_id: null,
      categories: [],
      images: [{ url: "/placeholder.png", alt: "Sample", sort_order: 0 }],
      variants: [],
      attributes: [],
    }));
  }

  // =============================
  // SERVER IMPLEMENTATION
  // =============================
  const { pool } = await import("../../db-mysql");

  // 1️⃣ Base products
  const [products] = await pool.query<any[]>(
    `
    SELECT p.*
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT ?
  `,
    [args.tenant_id, args.store_id, args.limit],
  );

  console.log("[ProductGrid:data] base query", {
    tenant_id: args.tenant_id,
    store_id: args.store_id,
    limit: args.limit,
    matched: products.length,
    ids: products.map((p) => p.id),
    statuses: products.map((p) => p.status),
  });

  if (!products.length) return [];

  const productIds = products.map((p) => p.id);

  // 2️⃣ Images
  let images: any[] = [];
  try {
    const [rows] = await pool.query<any[]>(
      `
      SELECT product_id, variant_id, url, alt, sort_order
      FROM product_images
      WHERE tenant_id = ? AND product_id IN (?)
      ORDER BY sort_order ASC
    `,
      [args.tenant_id, productIds],
    );
    images = rows;
  } catch {
    const [rows] = await pool.query<any[]>(
      `
      SELECT product_id, url, alt, sort_order
      FROM product_images
      WHERE tenant_id = ? AND product_id IN (?)
      ORDER BY sort_order ASC
    `,
      [args.tenant_id, productIds],
    );
    images = rows.map((r) => ({ ...r, variant_id: null }));
  }

  // 3️⃣ Variants
  const [variants] = await pool.query<any[]>(
    `
    SELECT *
    FROM product_variants
    WHERE tenant_id = ? AND product_id IN (?)
  `,
    [args.tenant_id, productIds],
  );

  // 4️⃣ Categories
  const [categories] = await pool.query<any[]>(
    `
    SELECT product_id, category_id
    FROM product_categories
    WHERE tenant_id = ? AND product_id IN (?)
  `,
    [args.tenant_id, productIds],
  );

  // 5️⃣ Attributes + Values + Options
  const [attrs] = await pool.query<any[]>(
    `
    SELECT 
      pav.product_id,
      pa.code,
      pa.name,
      pa.type,
      pav.value_text,
      pav.value_number,
      pav.value_bool,
      pav.value_date,
      o.value AS option_value
    FROM product_attribute_values pav
    JOIN product_attributes pa ON pa.id = pav.attribute_id
    LEFT JOIN product_attribute_options o ON o.id = pav.option_id
    WHERE pav.tenant_id = ? AND pav.product_id IN (?)
  `,
    [args.tenant_id, productIds],
  );

  const [attrsV2] = await pool.query<any[]>(
    `
    SELECT 
      v.product_id,
      a.code,
      a.name,
      a.type,
      v.value_text,
      v.value_number,
      v.value_bool,
      v.value_color,
      v.value_date,
      v.value_json
    FROM store_product_attribute_values v
    JOIN store_category_attributes a ON a.id = v.attribute_id
    WHERE v.tenant_id = ? AND v.product_id IN (?)
    `,
    [args.tenant_id, productIds],
  );

  // =============================
  // GROUPING
  // =============================

  const imageMap = groupBy(images, "product_id");
  const variantMap = groupBy(variants, "product_id");
  const categoryMap = groupBy(categories, "product_id");
  const attributeMap = groupBy(attrs, "product_id");
  const attributeV2Map = groupBy(attrsV2, "product_id");

  // =============================
  // FINAL ASSEMBLY
  // =============================

  const mapped = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    base_price_cents: p.base_price_cents,
    compare_at_price_cents: p.compare_at_price_cents,

    brand_id: p.brand_id,

    categories: (categoryMap[p.id] || []).map(
      (c: { category_id: any }) => c.category_id,
    ),

    images: (imageMap[p.id] || []).map(
      (i: { variant_id: any; url: any; alt: any; sort_order: any }) => ({
        variant_id: i.variant_id,
        url: i.url,
        alt: i.alt,
        sort_order: i.sort_order,
      }),
    ),

    variants: (variantMap[p.id] || []).map(
      (v: {
        id: any;
        sku: any;
        price_cents: any;
        compare_at_price_cents: any;
        inventory_qty: any;
        options_json: any;
      }) => ({
        id: v.id,
        sku: v.sku,
        price_cents: v.price_cents,
        compare_at_price_cents: v.compare_at_price_cents,
        inventory_qty: v.inventory_qty,
        options: parseOptionsJson(v.options_json),
      }),
    ),

    attributes: [
      ...(attributeMap[p.id] || []).map(
        (a: {
          code: any;
          name: any;
          type: any;
          option_value: any;
          value_text: any;
          value_number: any;
          value_bool: any;
          value_date: any;
        }) => ({
          code: a.code,
          name: a.name,
          type: a.type,
          value:
            a.option_value ??
            a.value_text ??
            a.value_number ??
            a.value_bool ??
            a.value_date ??
            null,
        }),
      ),
      ...(attributeV2Map[p.id] || []).map(
        (a: {
          code: any;
          name: any;
          type: any;
          value_text: any;
          value_number: any;
          value_bool: any;
          value_color: any;
          value_date: any;
          value_json: any;
        }) => ({
          code: a.code,
          name: a.name,
          type: a.type,
          value:
            a.value_text ??
            a.value_number ??
            (a.value_bool == null ? null : Boolean(a.value_bool)) ??
            a.value_color ??
            a.value_date ??
            (a.value_json ? JSON.parse(a.value_json) : null),
        }),
      ),
    ],
  }));

  console.log("[ProductGrid:data] mapped products", {
    tenant_id: args.tenant_id,
    store_id: args.store_id,
    count: mapped.length,
    slugs: mapped.map((p) => p.slug),
  });

  return mapped;
}
function groupBy<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
): Record<string, T[]> {
  return rows.reduce(
    (acc, row) => {
      const k = String(row[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(row);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}
