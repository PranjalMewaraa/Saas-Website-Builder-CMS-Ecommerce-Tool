export type StorefrontProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  base_price_cents: number;
  compare_at_price_cents: number | null;
  brand_id: string | null;
  categories: string[];
  images: Array<{
    url: string;
    alt: string | null;
    sort_order: number;
    variant_id?: string | null;
  }>;
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

async function expandStoreCategoryIds(args: {
  tenant_id: string;
  store_id: string;
  category_ids: string[];
}) {
  if (!args.category_ids.length) return [];
  const { pool } = await import("../../db-mysql");
  const [rows] = await pool.query<any[]>(
    `SELECT id, parent_id
     FROM store_categories
     WHERE tenant_id = ? AND store_id = ?`,
    [args.tenant_id, args.store_id],
  );
  const childrenByParent = new Map<string, string[]>();
  for (const row of rows) {
    const id = String(row.id || "");
    const parentId = row.parent_id ? String(row.parent_id) : "";
    if (!id || !parentId) continue;
    const list = childrenByParent.get(parentId) || [];
    list.push(id);
    childrenByParent.set(parentId, list);
  }

  const out = new Set<string>();
  const queue = [...args.category_ids];
  while (queue.length) {
    const cur = String(queue.shift() || "");
    if (!cur || out.has(cur)) continue;
    out.add(cur);
    const children = childrenByParent.get(cur) || [];
    for (const child of children) {
      if (!out.has(child)) queue.push(child);
    }
  }
  return Array.from(out);
}

function tokenizeSearch(input?: string) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 4);
}

function pushDeepSearchWhere(
  where: string[],
  params: any[],
  q: string | undefined,
  tenantId: string,
) {
  const terms = tokenizeSearch(q);
  if (!terms.length) return;

  for (const term of terms) {
    const like = `%${term}%`;
    where.push(
      `(
        p.title LIKE ?
        OR p.description LIKE ?
        OR p.sku LIKE ?
        OR EXISTS (
          SELECT 1
          FROM brands b
          WHERE b.tenant_id = p.tenant_id
            AND b.id = p.brand_id
            AND b.name LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM store_categories sc
          WHERE sc.tenant_id = p.tenant_id
            AND sc.id = p.store_category_id
            AND sc.name LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM product_categories pc
          JOIN categories c ON c.id = pc.category_id AND c.tenant_id = pc.tenant_id
          WHERE pc.tenant_id = ?
            AND pc.product_id = p.id
            AND c.name LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM store_product_attribute_values v
          JOIN store_category_attributes a ON a.id = v.attribute_id
          WHERE v.tenant_id = ?
            AND v.product_id = p.id
            AND (
              a.name LIKE ?
              OR a.code LIKE ?
              OR v.value_text LIKE ?
              OR CONCAT('', v.value_number) LIKE ?
              OR CONCAT('', v.value_bool) LIKE ?
              OR v.value_color LIKE ?
              OR v.value_date LIKE ?
              OR v.value_json LIKE ?
            )
        )
      )`,
    );
    params.push(
      like, // p.title
      like, // p.description
      like, // p.sku
      like, // brand name
      like, // store category name
      tenantId, // legacy categories tenant
      like, // legacy category name
      tenantId, // attributes tenant
      like, // attribute name
      like, // attribute code
      like, // value_text
      like, // value_number as string
      like, // value_bool as string
      like, // value_color
      like, // value_date
      like, // value_json
    );
  }
}

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

  const [storeCategoryRows] = await pool.query<any[]>(
    `
    SELECT sc.id, sc.name, sc.parent_id
    FROM store_categories sc
    WHERE sc.tenant_id = ?
      AND sc.store_id = ?
    ORDER BY sc.name ASC
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

  const [attrRowsV2] = await pool.query<any[]>(
    `
    SELECT 
      a.code,
      a.name,
      a.type,
      COALESCE(v.value_text, v.value_number, v.value_bool, v.value_color, v.value_date) as value,
      v.value_json
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    JOIN store_product_attribute_values v ON v.product_id = p.id AND v.tenant_id = p.tenant_id AND v.store_id = sp.store_id
    JOIN store_category_attributes a ON a.id = v.attribute_id
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
  for (const row of attrRowsV2) {
    const code = String(row.code);
    const name = String(row.name || row.code);
    const value = row.value_json
      ? JSON.stringify(JSON.parse(String(row.value_json)))
      : row.value == null
        ? ""
        : String(row.value);
    if (!value) continue;
    if (!attrMap.has(code)) {
      attrMap.set(code, { code, name, values: new Set() });
    }
    attrMap.get(code)!.values.add(value);
  }

  const combinedCategoriesRaw =
    storeCategoryRows.length > 0 ? storeCategoryRows : categoryRows;
  const categoryById = new Map<string, { id: string; name: string; parent_id?: string | null }>();
  for (const c of combinedCategoriesRaw) {
    const id = String(c.id || "");
    if (!id) continue;
    if (!categoryById.has(id)) {
      categoryById.set(id, {
        id,
        name: String(c.name || ""),
        parent_id: c.parent_id ? String(c.parent_id) : null,
      });
    }
  }

  return {
    store_type: store?.store_type ?? null,
    brands: brandRows.map((b) => ({ id: String(b.id), name: String(b.name) })),
    categories: Array.from(categoryById.values()),
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
  sort?: "newest" | "price_asc" | "price_desc" | "title_asc";
}): Promise<StorefrontProduct[]> {
  const { pool } = await import("../../db-mysql");

  const where: string[] = [
    "sp.tenant_id = ?",
    "sp.store_id = ?",
    "sp.is_published = 1",
    "p.status = 'active'",
  ];
  const params: any[] = [args.tenant_id, args.store_id];

  pushDeepSearchWhere(where, params, args.q, args.tenant_id);

  if (args.brand_ids?.length) {
    where.push(`p.brand_id IN (${args.brand_ids.map(() => "?").join(",")})`);
    params.push(...args.brand_ids);
  }

  if (args.category_ids?.length) {
    const expandedStoreCategoryIds = await expandStoreCategoryIds({
      tenant_id: args.tenant_id,
      store_id: args.store_id,
      category_ids: args.category_ids,
    });
    where.push(
      `(
        p.store_category_id IN (${expandedStoreCategoryIds.map(() => "?").join(",")})
        OR p.id IN (
          SELECT pc.product_id
          FROM product_categories pc
          WHERE pc.tenant_id = ? AND pc.category_id IN (${args.category_ids
            .map(() => "?")
            .join(",")})
        )
      )`,
    );
    params.push(...expandedStoreCategoryIds, args.tenant_id, ...args.category_ids);
  }

  if (args.attr_filters?.length) {
    for (const filter of args.attr_filters) {
      if (!filter.values.length) continue;
      const placeholders = filter.values.map(() => "?").join(",");
      const jsonLike = filter.values.map(() => "v.value_json LIKE ?").join(" OR ");
      where.push(
        `(
          p.id IN (
            SELECT pav.product_id
            FROM product_attribute_values pav
            JOIN product_attributes pa ON pa.id = pav.attribute_id
            LEFT JOIN product_attribute_options o ON o.id = pav.option_id
            WHERE pav.tenant_id = ?
              AND pa.code = ?
              AND COALESCE(o.value, pav.value_text, pav.value_number, pav.value_bool, pav.value_date) IN (${placeholders})
          )
          OR p.id IN (
            SELECT v.product_id
            FROM store_product_attribute_values v
            JOIN store_category_attributes a ON a.id = v.attribute_id
            WHERE v.tenant_id = ?
              AND v.store_id = ?
              AND a.code = ?
              AND (
                v.value_text IN (${placeholders})
                OR CAST(v.value_number AS CHAR) IN (${placeholders})
                OR CAST(v.value_bool AS CHAR) IN (${placeholders})
                OR v.value_color IN (${placeholders})
                OR v.value_date IN (${placeholders})
                ${jsonLike ? `OR ${jsonLike}` : ""}
              )
          )
        )`,
      );
      params.push(
        args.tenant_id,
        filter.code,
        ...filter.values,
        args.tenant_id,
        args.store_id,
        filter.code,
        ...filter.values,
        ...filter.values,
        ...filter.values,
        ...filter.values,
        ...filter.values,
        ...filter.values.map((v) => `%\"${String(v)}\"%`),
      );
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

  const sortSql =
    args.sort === "price_asc"
      ? "p.base_price_cents ASC"
      : args.sort === "price_desc"
        ? "p.base_price_cents DESC"
        : args.sort === "title_asc"
          ? "p.title ASC"
          : "p.created_at DESC";

  const [productRows] = await pool.query<any[]>(
    `
    SELECT p.*
    FROM store_products sp
    JOIN products p ON p.id = sp.product_id AND p.tenant_id = sp.tenant_id
    WHERE ${where.join(" AND ")}
    ORDER BY ${sortSql}
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
  sort?: "newest" | "price_asc" | "price_desc" | "title_asc";
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

  pushDeepSearchWhere(where, params, args.q, args.tenant_id);

  if (args.brand_ids?.length) {
    where.push(`p.brand_id IN (${args.brand_ids.map(() => "?").join(",")})`);
    params.push(...args.brand_ids);
  }

  if (args.category_ids?.length) {
    const expandedStoreCategoryIds = await expandStoreCategoryIds({
      tenant_id: args.tenant_id,
      store_id: args.store_id,
      category_ids: args.category_ids,
    });
    where.push(
      `(
        p.store_category_id IN (${expandedStoreCategoryIds.map(() => "?").join(",")})
        OR p.id IN (
          SELECT pc.product_id
          FROM product_categories pc
          WHERE pc.tenant_id = ? AND pc.category_id IN (${args.category_ids
            .map(() => "?")
            .join(",")})
        )
      )`,
    );
    params.push(...expandedStoreCategoryIds, args.tenant_id, ...args.category_ids);
  }

  if (args.attr_filters?.length) {
    for (const filter of args.attr_filters) {
      if (!filter.values.length) continue;
      const placeholders = filter.values.map(() => "?").join(",");
      const jsonLike = filter.values.map(() => "v.value_json LIKE ?").join(" OR ");
      where.push(
        `(
          p.id IN (
            SELECT pav.product_id
            FROM product_attribute_values pav
            JOIN product_attributes pa ON pa.id = pav.attribute_id
            LEFT JOIN product_attribute_options o ON o.id = pav.option_id
            WHERE pav.tenant_id = ?
              AND pa.code = ?
              AND COALESCE(o.value, pav.value_text, pav.value_number, pav.value_bool, pav.value_date) IN (${placeholders})
          )
          OR p.id IN (
            SELECT v.product_id
            FROM store_product_attribute_values v
            JOIN store_category_attributes a ON a.id = v.attribute_id
            WHERE v.tenant_id = ?
              AND v.store_id = ?
              AND a.code = ?
              AND (
                v.value_text IN (${placeholders})
                OR CAST(v.value_number AS CHAR) IN (${placeholders})
                OR CAST(v.value_bool AS CHAR) IN (${placeholders})
                OR v.value_color IN (${placeholders})
                OR v.value_date IN (${placeholders})
                ${jsonLike ? `OR ${jsonLike}` : ""}
              )
          )
        )`,
      );
      params.push(
        args.tenant_id,
        filter.code,
        ...filter.values,
        args.tenant_id,
        args.store_id,
        filter.code,
        ...filter.values,
        ...filter.values,
        ...filter.values,
        ...filter.values,
        ...filter.values,
        ...filter.values.map((v) => `%\"${String(v)}\"%`),
      );
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

  let images: any[] = [];
  try {
    const [rows] = await pool.query<any[]>(
      `
      SELECT product_id, variant_id, url, alt, sort_order
      FROM product_images
      WHERE tenant_id = ? AND product_id IN (?)
      ORDER BY sort_order ASC
      `,
      [tenant_id, productIds],
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
      [tenant_id, productIds],
    );
    images = rows.map((r) => ({ ...r, variant_id: null }));
  }

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
    [tenant_id, productIds],
  );

  const imageMap = groupBy(images, "product_id");
  const variantMap = groupBy(variants, "product_id");
  const categoryMap = groupBy(categories, "product_id");
  const attributeMap = groupBy(attrs, "product_id");
  const attributeV2Map = groupBy(attrsV2, "product_id");

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
