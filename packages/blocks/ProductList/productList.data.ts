export type StorefrontProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  base_price_cents: number;
  compare_at_price_cents: number | null;
  brand_id: string | null;
  categories: string[];
  images: Array<{ url: string; alt: string | null; sort_order: number }>;
  variants: Array<{
    id: string;
    sku: string | null;
    price_cents: number;
    compare_at_price_cents: number | null;
    inventory_qty: number;
    options: Record<string, string>;
  }>;
  attributes: Array<{
    code: string;
    name: string;
    type: string;
    value: string | number | boolean | string[] | null;
  }>;
};

export type ProductFilterMeta = {
  store_type?: string | null;
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; parent_id?: string | null }>;
  attributes: Array<{ code: string; name: string; values: string[] }>;
  priceMin: number;
  priceMax: number;
};

export async function getStoreFilterMeta(args: {
  tenant_id: string;
  store_id: string;
}): Promise<ProductFilterMeta> {
  const { pool } = await import("../../db-mysql");

  const [[store]] = await pool.query<any[]>(
    `SELECT store_type FROM stores WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [args.tenant_id, args.store_id],
  );

  const [brandRows] = await pool.query<any[]>(
    `
    SELECT DISTINCT b.id, b.name
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    JOIN brands b ON b.id = p.brand_id AND b.tenant_id = p.tenant_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
      AND p.brand_id IS NOT NULL
    ORDER BY b.name ASC
    `,
    [args.tenant_id, args.store_id],
  );

  const [categoryRows] = await pool.query<any[]>(
    `
    SELECT DISTINCT c.id, c.name, c.parent_id
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    JOIN product_categories pc ON pc.product_id = p.id AND pc.tenant_id = p.tenant_id
    JOIN categories c ON c.id = pc.category_id AND c.tenant_id = pc.tenant_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
    ORDER BY c.name ASC
    `,
    [args.tenant_id, args.store_id],
  );

  const [[priceRow]] = await pool.query<any[]>(
    `
    SELECT MIN(p.base_price_cents) as min_price, MAX(p.base_price_cents) as max_price
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
    `,
    [args.tenant_id, args.store_id],
  );

  const [attrRows] = await pool.query<any[]>(
    `
    SELECT 
      pa.code,
      pa.name,
      pa.type,
      COALESCE(o.value, pav.value_text, pav.value_number, pav.value_bool, pav.value_date) as value
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    JOIN product_attribute_values pav ON pav.product_id = p.id AND pav.tenant_id = p.tenant_id
    JOIN product_attributes pa ON pa.id = pav.attribute_id
    LEFT JOIN product_attribute_options o ON o.id = pav.option_id
    WHERE sp.tenant_id = ?
      AND sp.store_id = ?
      AND sp.is_published = 1
      AND p.status = 'active'
    `,
    [args.tenant_id, args.store_id],
  );

  const attrMap = new Map<
    string,
    { code: string; name: string; values: Set<string> }
  >();
  for (const row of attrRows) {
    const code = String(row.code);
    const name = String(row.name || row.code);
    const value = row.value == null ? "" : String(row.value);
    if (!value) continue;
    if (!attrMap.has(code)) {
      attrMap.set(code, { code, name, values: new Set() });
    }
    attrMap.get(code)!.values.add(value);
  }

  return {
    store_type: store?.store_type ?? null,
    brands: brandRows.map((b) => ({ id: String(b.id), name: String(b.name) })),
    categories: categoryRows.map((c) => ({
      id: String(c.id),
      name: String(c.name),
      parent_id: c.parent_id ? String(c.parent_id) : null,
    })),
    attributes: Array.from(attrMap.values()).map((a) => ({
      code: a.code,
      name: a.name,
      values: Array.from(a.values).sort((x, y) => x.localeCompare(y)),
    })),
    priceMin: Number(priceRow?.min_price || 0),
    priceMax: Number(priceRow?.max_price || 0),
  };
}

export async function listPublishedProductsForStoreWithFilters(args: {
  tenant_id: string;
  store_id: string;
  limit: number;
  offset?: number;
  q?: string;
  brand_ids?: string[];
  category_ids?: string[];
  attr_filters?: Array<{ code: string; values: string[] }>;
  min_price_cents?: number;
  max_price_cents?: number;
}): Promise<StorefrontProduct[]> {
  const { pool } = await import("../../db-mysql");

  const where: string[] = [
    "sp.tenant_id = ?",
    "sp.store_id = ?",
    "sp.is_published = 1",
    "p.status = 'active'",
  ];
  const params: any[] = [args.tenant_id, args.store_id];

  if (args.q) {
    where.push("(p.title LIKE ? OR p.description LIKE ?)");
    const like = `%${args.q}%`;
    params.push(like, like);
  }

  if (args.brand_ids?.length) {
    where.push(`p.brand_id IN (${args.brand_ids.map(() => "?").join(",")})`);
    params.push(...args.brand_ids);
  }

  if (args.category_ids?.length) {
    where.push(
      `p.id IN (
        SELECT pc.product_id
        FROM product_categories pc
        WHERE pc.tenant_id = ? AND pc.category_id IN (${args.category_ids
          .map(() => "?")
          .join(",")})
      )`,
    );
    params.push(args.tenant_id, ...args.category_ids);
  }

  if (args.attr_filters?.length) {
    for (const filter of args.attr_filters) {
      if (!filter.values.length) continue;
      where.push(
        `p.id IN (
          SELECT pav.product_id
          FROM product_attribute_values pav
          JOIN product_attributes pa ON pa.id = pav.attribute_id
          LEFT JOIN product_attribute_options o ON o.id = pav.option_id
          WHERE pav.tenant_id = ?
            AND pa.code = ?
            AND COALESCE(o.value, pav.value_text, pav.value_number, pav.value_bool, pav.value_date) IN (${filter.values
              .map(() => "?")
              .join(",")})
        )`,
      );
      params.push(args.tenant_id, filter.code, ...filter.values);
    }
  }

  if (typeof args.min_price_cents === "number") {
    where.push("p.base_price_cents >= ?");
    params.push(args.min_price_cents);
  }

  if (typeof args.max_price_cents === "number") {
    where.push("p.base_price_cents <= ?");
    params.push(args.max_price_cents);
  }

  const [productRows] = await pool.query<any[]>(
    `
    SELECT p.*
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE ${where.join(" AND ")}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, args.limit, args.offset ?? 0],
  );

  if (!productRows.length) return [];

  const productIds = productRows.map((p) => p.id);
  return assembleProducts(args.tenant_id, productRows, productIds);
}

export async function countPublishedProductsForStoreWithFilters(args: {
  tenant_id: string;
  store_id: string;
  q?: string;
  brand_ids?: string[];
  category_ids?: string[];
  attr_filters?: Array<{ code: string; values: string[] }>;
  min_price_cents?: number;
  max_price_cents?: number;
}): Promise<number> {
  const { pool } = await import("../../db-mysql");

  const where: string[] = [
    "sp.tenant_id = ?",
    "sp.store_id = ?",
    "sp.is_published = 1",
    "p.status = 'active'",
  ];
  const params: any[] = [args.tenant_id, args.store_id];

  if (args.q) {
    where.push("(p.title LIKE ? OR p.description LIKE ?)");
    const like = `%${args.q}%`;
    params.push(like, like);
  }

  if (args.brand_ids?.length) {
    where.push(`p.brand_id IN (${args.brand_ids.map(() => "?").join(",")})`);
    params.push(...args.brand_ids);
  }

  if (args.category_ids?.length) {
    where.push(
      `p.id IN (
        SELECT pc.product_id
        FROM product_categories pc
        WHERE pc.tenant_id = ? AND pc.category_id IN (${args.category_ids
          .map(() => "?")
          .join(",")})
      )`,
    );
    params.push(args.tenant_id, ...args.category_ids);
  }

  if (args.attr_filters?.length) {
    for (const filter of args.attr_filters) {
      if (!filter.values.length) continue;
      where.push(
        `p.id IN (
          SELECT pav.product_id
          FROM product_attribute_values pav
          JOIN product_attributes pa ON pa.id = pav.attribute_id
          LEFT JOIN product_attribute_options o ON o.id = pav.option_id
          WHERE pav.tenant_id = ?
            AND pa.code = ?
            AND COALESCE(o.value, pav.value_text, pav.value_number, pav.value_bool, pav.value_date) IN (${filter.values
              .map(() => "?")
              .join(",")})
        )`,
      );
      params.push(args.tenant_id, filter.code, ...filter.values);
    }
  }

  if (typeof args.min_price_cents === "number") {
    where.push("p.base_price_cents >= ?");
    params.push(args.min_price_cents);
  }

  if (typeof args.max_price_cents === "number") {
    where.push("p.base_price_cents <= ?");
    params.push(args.max_price_cents);
  }

  const [[row]] = await pool.query<any[]>(
    `
    SELECT COUNT(DISTINCT p.id) as total
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE ${where.join(" AND ")}
    `,
    params,
  );

  return Number(row?.total || 0);
}

export async function getPublishedProductsByIds(
  tenant_id: string,
  productRows: any[],
  productIds: string[],
): Promise<StorefrontProduct[]> {
  if (!productRows.length) return [];
  return assembleProducts(tenant_id, productRows, productIds);
}

async function assembleProducts(
  tenant_id: string,
  productRows: any[],
  productIds: string[],
): Promise<StorefrontProduct[]> {
  const { pool } = await import("../../db-mysql");

  const [images] = await pool.query<any[]>(
    `
    SELECT product_id, url, alt, sort_order
    FROM product_images
    WHERE tenant_id = ? AND product_id IN (?)
    ORDER BY sort_order ASC
    `,
    [tenant_id, productIds],
  );

  const [variants] = await pool.query<any[]>(
    `
    SELECT *
    FROM product_variants
    WHERE tenant_id = ? AND product_id IN (?)
    `,
    [tenant_id, productIds],
  );

  const [categories] = await pool.query<any[]>(
    `
    SELECT product_id, category_id
    FROM product_categories
    WHERE tenant_id = ? AND product_id IN (?)
    `,
    [tenant_id, productIds],
  );

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
    [tenant_id, productIds],
  );

  const imageMap = groupBy(images, "product_id");
  const variantMap = groupBy(variants, "product_id");
  const categoryMap = groupBy(categories, "product_id");
  const attributeMap = groupBy(attrs, "product_id");

  return productRows.map((p) => ({
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
      (i: { url: any; alt: any; sort_order: any }) => ({
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
        options: v.options_json || {},
      }),
    ),
    attributes: (attributeMap[p.id] || []).map(
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
  }));
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
