import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";
import { getStorePreset, STORE_TYPE_PRESETS, type StorePresetKey } from "./storeTypePresets";

type AttrType =
  | "text"
  | "textarea"
  | "select"
  | "multi_select"
  | "number"
  | "boolean"
  | "color"
  | "date";

type VariantInput = {
  id?: string | null;
  sku?: string | null;
  price_cents?: number;
  compare_at_price_cents?: number | null;
  inventory_qty?: number;
  options?: Record<string, any> | null;
};

function parseOptionsJson(raw: any): Record<string, string> {
  if (!raw) return {};
  let parsed: any = raw;
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

function normalizeVariantInputs(
  rawVariants: VariantInput[] | undefined,
  fallbackPriceCents: number,
  fallbackInventoryQty: number,
  fallbackSku: string | null,
) {
  const list = Array.isArray(rawVariants) ? rawVariants : [];
  const normalized = list
    .map((v) => ({
      id: v?.id ? String(v.id) : null,
      sku: v?.sku == null || String(v.sku).trim() === "" ? null : String(v.sku).trim(),
      price_cents:
        v?.price_cents == null
          ? Number(fallbackPriceCents || 0)
          : Math.max(0, Number(v.price_cents || 0)),
      compare_at_price_cents:
        v?.compare_at_price_cents == null
          ? null
          : Math.max(0, Number(v.compare_at_price_cents || 0)),
      inventory_qty:
        v?.inventory_qty == null
          ? Math.max(0, Number(fallbackInventoryQty || 0))
          : Math.max(0, Number(v.inventory_qty || 0)),
      options: parseOptionsJson(v?.options),
    }))
    .filter((v) => Number.isFinite(v.price_cents) && Number.isFinite(v.inventory_qty));

  if (!normalized.length) {
    return [
      {
        id: null,
        sku: fallbackSku,
        price_cents: Math.max(0, Number(fallbackPriceCents || 0)),
        compare_at_price_cents: null,
        inventory_qty: Math.max(0, Number(fallbackInventoryQty || 0)),
        options: { default: "default" },
      },
    ];
  }
  return normalized;
}

async function listProductImagesSafe(args: {
  tenant_id: string;
  product_id: string;
}) {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT id, variant_id, url, alt, sort_order
       FROM product_images
       WHERE tenant_id = ? AND product_id = ?
       ORDER BY sort_order ASC, created_at ASC`,
      [args.tenant_id, args.product_id],
    );
    return rows;
  } catch {
    const [rows] = await pool.query<any[]>(
      `SELECT id, url, alt, sort_order
       FROM product_images
       WHERE tenant_id = ? AND product_id = ?
       ORDER BY sort_order ASC, created_at ASC`,
      [args.tenant_id, args.product_id],
    );
    return (rows as any[]).map((r) => ({ ...r, variant_id: null }));
  }
}

export function listStoreTypePresets() {
  return STORE_TYPE_PRESETS;
}

export async function ensureStoreProfile(args: {
  tenant_id: string;
  store_id: string;
  store_preset?: string | null;
}) {
  const ts = nowSql();
  await pool.query(
    `INSERT INTO store_profiles (tenant_id, store_id, store_preset, low_stock_threshold, created_at, updated_at)
     VALUES (?, ?, ?, 5, ?, ?)
     ON DUPLICATE KEY UPDATE store_preset = COALESCE(VALUES(store_preset), store_preset), updated_at = VALUES(updated_at)`,
    [args.tenant_id, args.store_id, args.store_preset ?? null, ts, ts],
  );
}

async function ensureUniqueSlugByStore(
  tenant_id: string,
  store_id: string,
  table: "store_categories",
  base: string,
) {
  let slug = base || "item";
  let i = 2;
  while (true) {
    const [rows] = await pool.query(
      `SELECT id FROM ${table} WHERE tenant_id = ? AND store_id = ? AND slug = ? LIMIT 1`,
      [tenant_id, store_id, slug],
    );
    if (!(rows as any[]).length) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function ensureLegacyBrandForStore(args: {
  tenant_id: string;
  store_id: string;
}) {
  const [existing] = await pool.query<any[]>(
    `SELECT b.id FROM brands b
     JOIN brand_profiles bp ON bp.brand_id = b.id AND bp.tenant_id = b.tenant_id
     WHERE b.tenant_id = ? AND bp.store_id = ? AND b.name = 'Legacy Brand'
     LIMIT 1`,
    [args.tenant_id, args.store_id],
  );
  if (existing[0]?.id) return String(existing[0].id);

  const id = newId("brand").slice(0, 25);
  const ts = nowSql();
  const slug = `legacy-brand-${args.store_id}`.slice(0, 255);

  await pool.query(
    `INSERT INTO brands (id, tenant_id, name, slug, created_at, updated_at)
     VALUES (?, ?, 'Legacy Brand', ?, ?, ?)`,
    [id, args.tenant_id, slug, ts, ts],
  );
  await pool.query(
    `INSERT INTO brand_profiles (tenant_id, brand_id, store_id, type, created_at, updated_at)
     VALUES (?, ?, ?, 'brand', ?, ?)`,
    [args.tenant_id, id, args.store_id, ts, ts],
  );
  return id;
}

export async function listBrandsByStore(args: { tenant_id: string; store_id: string }) {
  const [rows] = await pool.query<any[]>(
    `SELECT b.*, bp.type, bp.logo, bp.description
     FROM brands b
     JOIN brand_profiles bp ON bp.brand_id = b.id AND bp.tenant_id = b.tenant_id
     WHERE b.tenant_id = ? AND bp.store_id = ?
     ORDER BY b.created_at DESC`,
    [args.tenant_id, args.store_id],
  );
  return rows;
}

export async function createBrandV2(args: {
  tenant_id: string;
  store_id: string;
  name: string;
  type: "brand" | "distributor";
  logo?: string | null;
  description?: string | null;
}) {
  const id = newId("brand").slice(0, 25);
  const ts = nowSql();
  const base = slugify(args.name);
  let slug = base || "brand";
  let i = 2;
  while (true) {
    const [rows] = await pool.query(
      `SELECT id FROM brands WHERE tenant_id = ? AND slug = ? LIMIT 1`,
      [args.tenant_id, slug],
    );
    if (!(rows as any[]).length) break;
    slug = `${base}-${i++}`;
  }
  await pool.query(
    `INSERT INTO brands (id, tenant_id, name, slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, args.tenant_id, args.name.trim(), slug, ts, ts],
  );
  await pool.query(
    `INSERT INTO brand_profiles (tenant_id, brand_id, store_id, type, logo, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [args.tenant_id, id, args.store_id, args.type, args.logo ?? null, args.description ?? null, ts, ts],
  );
  return { id, slug };
}

export async function listStoreCategories(args: { tenant_id: string; store_id: string }) {
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM store_categories WHERE tenant_id = ? AND store_id = ? ORDER BY created_at DESC`,
    [args.tenant_id, args.store_id],
  );
  return rows;
}

export async function createStoreCategory(args: {
  tenant_id: string;
  store_id: string;
  name: string;
  slug?: string;
  parent_id?: string | null;
}) {
  const id = newId("scat").slice(0, 26);
  const ts = nowSql();
  const base = args.slug?.trim() ? slugify(args.slug) : slugify(args.name);
  const slug = await ensureUniqueSlugByStore(args.tenant_id, args.store_id, "store_categories", base);
  await pool.query(
    `INSERT INTO store_categories (id, tenant_id, store_id, name, slug, parent_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, args.tenant_id, args.store_id, args.name.trim(), slug, args.parent_id ?? null, ts, ts],
  );
  return { id, slug };
}

export async function listCategoryAttributes(args: {
  tenant_id: string;
  store_id: string;
  category_id: string;
}) {
  const [attrs] = await pool.query<any[]>(
    `SELECT * FROM store_category_attributes
     WHERE tenant_id = ? AND store_id = ? AND category_id = ?
     ORDER BY sort_order ASC, created_at ASC`,
    [args.tenant_id, args.store_id, args.category_id],
  );
  if (!attrs.length) return [];
  const attrIds = attrs.map((a) => a.id);
  const [opts] = await pool.query<any[]>(
    `SELECT * FROM store_category_attribute_options
     WHERE tenant_id = ? AND attribute_id IN (?)
     ORDER BY sort_order ASC, value ASC`,
    [args.tenant_id, attrIds],
  );
  const map = new Map<string, any[]>();
  for (const o of opts) {
    const list = map.get(o.attribute_id) || [];
    list.push(o);
    map.set(o.attribute_id, list);
  }
  return attrs.map((a) => ({ ...a, options: map.get(a.id) || [] }));
}

export async function listCategoryAttributesResolved(args: {
  tenant_id: string;
  store_id: string;
  category_id: string;
}) {
  const [cats] = await pool.query<any[]>(
    `SELECT id, parent_id
     FROM store_categories
     WHERE tenant_id = ? AND store_id = ?`,
    [args.tenant_id, args.store_id],
  );
  const parentById = new Map<string, string | null>();
  for (const c of cats) parentById.set(String(c.id), c.parent_id ? String(c.parent_id) : null);

  const chainLeafToRoot: string[] = [];
  let cur: string | null = args.category_id;
  let guard = 0;
  while (cur && guard < 20) {
    chainLeafToRoot.push(cur);
    cur = parentById.get(cur) ?? null;
    guard += 1;
  }
  const chainRootToLeaf = [...chainLeafToRoot].reverse();
  if (!chainRootToLeaf.length) return [];

  const [attrs] = await pool.query<any[]>(
    `SELECT *
     FROM store_category_attributes
     WHERE tenant_id = ? AND store_id = ? AND category_id IN (?)
     ORDER BY sort_order ASC, created_at ASC`,
    [args.tenant_id, args.store_id, chainRootToLeaf],
  );
  if (!attrs.length) return [];

  const attrIds = attrs.map((a) => a.id);
  const [opts] = await pool.query<any[]>(
    `SELECT *
     FROM store_category_attribute_options
     WHERE tenant_id = ? AND attribute_id IN (?)
     ORDER BY sort_order ASC, value ASC`,
    [args.tenant_id, attrIds],
  );
  const optionsByAttr = new Map<string, any[]>();
  for (const o of opts) {
    const key = String(o.attribute_id);
    const list = optionsByAttr.get(key) || [];
    list.push(o);
    optionsByAttr.set(key, list);
  }

  const attrsByCategory = new Map<string, any[]>();
  for (const a of attrs) {
    const key = String(a.category_id);
    const list = attrsByCategory.get(key) || [];
    list.push(a);
    attrsByCategory.set(key, list);
  }

  const mergedByCode = new Map<string, any>();
  for (const categoryId of chainRootToLeaf) {
    const rows = attrsByCategory.get(categoryId) || [];
    for (const a of rows) {
      const code = String(a.code || "").trim();
      if (!code) continue;
      mergedByCode.set(code, {
        ...a,
        options: optionsByAttr.get(String(a.id)) || [],
        source_category_id: categoryId,
        inherited: categoryId !== args.category_id,
      });
    }
  }

  return Array.from(mergedByCode.values());
}

export async function createCategoryAttribute(args: {
  tenant_id: string;
  store_id: string;
  category_id: string;
  code: string;
  name: string;
  type: AttrType;
  is_required?: boolean;
  is_filterable?: boolean;
  sort_order?: number;
  options?: string[];
}) {
  const id = newId("sca").slice(0, 26);
  const ts = nowSql();
  await pool.query(
    `INSERT INTO store_category_attributes
     (id, tenant_id, store_id, category_id, code, name, type, is_required, is_filterable, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      args.tenant_id,
      args.store_id,
      args.category_id,
      slugify(args.code).replace(/-/g, "_"),
      args.name.trim(),
      args.type,
      args.is_required ? 1 : 0,
      args.is_filterable === false ? 0 : 1,
      args.sort_order ?? 0,
      ts,
      ts,
    ],
  );
  if (args.options?.length) {
    let index = 0;
    for (const value of args.options) {
      await pool.query(
        `INSERT INTO store_category_attribute_options
         (id, tenant_id, attribute_id, label, value, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newId("scao").slice(0, 26), args.tenant_id, id, value, value, index++, ts],
      );
    }
  }
  return { id };
}

export async function seedStorePreset(args: {
  tenant_id: string;
  store_id: string;
  preset: StorePresetKey;
}) {
  const preset = getStorePreset(args.preset);
  if (!preset) return { ok: false };
  await ensureStoreProfile({
    tenant_id: args.tenant_id,
    store_id: args.store_id,
    store_preset: preset.key,
  });
  for (const cat of preset.categories) {
    const created = await createStoreCategory({
      tenant_id: args.tenant_id,
      store_id: args.store_id,
      name: cat.name,
      slug: cat.slug,
    });
    let index = 0;
    for (const attr of cat.attributes) {
      await createCategoryAttribute({
        tenant_id: args.tenant_id,
        store_id: args.store_id,
        category_id: created.id,
        code: attr.code,
        name: attr.name,
        type: attr.type,
        is_required: attr.required,
        is_filterable: attr.filterable !== false,
        sort_order: index++,
        options: attr.options,
      });
    }
  }
  return { ok: true };
}

function parseAndValidateAttributeValue(
  attr: any,
  raw: any,
  optionMap: Record<string, Set<string>>,
) {
  const type = String(attr.type);
  if ((raw == null || raw === "") && Number(attr.is_required) === 1) {
    throw new Error(`Missing required attribute: ${attr.name}`);
  }
  if (raw == null || raw === "") return { type, value: null };

  switch (type) {
    case "text":
    case "textarea":
      return { type, value: String(raw) };
    case "number": {
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`Invalid number for ${attr.name}`);
      return { type, value: n };
    }
    case "boolean":
      return { type, value: raw === true || raw === "true" || raw === 1 || raw === "1" };
    case "color": {
      const v = String(raw);
      if (!/^#[0-9a-fA-F]{3,8}$/.test(v)) throw new Error(`Invalid color for ${attr.name}`);
      return { type, value: v };
    }
    case "date": {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) throw new Error(`Invalid date for ${attr.name}`);
      return { type, value: d.toISOString().slice(0, 10) };
    }
    case "select":
      {
        const v = String(raw);
        const allowed = optionMap[attr.id];
        if (allowed && allowed.size && !allowed.has(v)) {
          throw new Error(`Invalid option for ${attr.name}`);
        }
        return { type, value: v };
      }
    case "multi_select": {
      const arr = Array.isArray(raw) ? raw.map(String) : [String(raw)];
      const allowed = optionMap[attr.id];
      if (allowed && allowed.size) {
        for (const v of arr) {
          if (!allowed.has(v)) throw new Error(`Invalid option for ${attr.name}`);
        }
      }
      return { type, value: arr };
    }
    default:
      throw new Error(`Unsupported attribute type: ${type}`);
  }
}

export async function createProductV2(args: {
  tenant_id: string;
  site_id: string;
  store_id: string;
  title: string;
  description?: string | null;
  base_price_cents: number;
  sku?: string | null;
  inventory_quantity: number;
  status?: "draft" | "active" | "archived";
  brand_id?: string | null;
  store_category_id: string;
  attributes: Record<string, any>;
  image_urls?: string[];
  variants?: VariantInput[];
}) {
  const conn = await pool.getConnection();
  const ts = nowSql();
  try {
    await conn.beginTransaction();

    let brand_id = args.brand_id || null;
    if (!brand_id) {
      brand_id = await ensureLegacyBrandForStore({
        tenant_id: args.tenant_id,
        store_id: args.store_id,
      });
    }

    const [attrRows] = await conn.query<any[]>(
      `SELECT * FROM store_category_attributes
       WHERE tenant_id = ? AND store_id = ? AND category_id = ?`,
      [args.tenant_id, args.store_id, args.store_category_id],
    );

    const optionRows = attrRows.length
      ? (
          await conn.query<any[]>(
            `SELECT attribute_id, value FROM store_category_attribute_options
             WHERE tenant_id = ? AND attribute_id IN (?)`,
            [args.tenant_id, attrRows.map((a) => a.id)],
          )
        )[0]
      : [];
    const optionMap: Record<string, Set<string>> = {};
    for (const r of optionRows) {
      if (!optionMap[r.attribute_id]) optionMap[r.attribute_id] = new Set();
      optionMap[r.attribute_id].add(String(r.value));
    }

    const parsed: Array<{ attr: any; parsed: { type: string; value: any } }> = [];
    for (const attr of attrRows) {
      const raw = args.attributes?.[attr.code];
      const validated = parseAndValidateAttributeValue(attr, raw, optionMap);
      parsed.push({ attr, parsed: validated });
    }

    const product_id = newId("prod").slice(0, 21);
    const baseSlug = slugify(args.title);
    let slug = baseSlug || "product";
    let i = 2;
    while (true) {
      const [rows] = await conn.query(
        `SELECT id FROM products WHERE tenant_id = ? AND slug = ? LIMIT 1`,
        [args.tenant_id, slug],
      );
      if (!(rows as any[]).length) break;
      slug = `${baseSlug}-${i++}`;
    }

    await conn.query(
      `INSERT INTO products
       (id, tenant_id, brand_id, title, slug, description, status, base_price_cents, sku, custom_data, store_category_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
      [
        product_id,
        args.tenant_id,
        brand_id,
        args.title.trim(),
        slug,
        args.description ?? null,
        args.status || "draft",
        args.base_price_cents,
        args.sku ?? null,
        args.store_category_id,
        ts,
        ts,
      ],
    );

    const variants = normalizeVariantInputs(
      args.variants,
      Number(args.base_price_cents || 0),
      Number(args.inventory_quantity || 0),
      args.sku ?? null,
    );
    const createdVariantIds: string[] = [];
    for (const variant of variants) {
      const variant_id = variant.id || newId("var").slice(0, 26);
      await conn.query(
        `INSERT INTO product_variants
         (id, tenant_id, product_id, sku, price_cents, compare_at_price_cents, options_json, inventory_qty, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?)`,
        [
          variant_id,
          args.tenant_id,
          product_id,
          variant.sku,
          variant.price_cents,
          variant.compare_at_price_cents,
          JSON.stringify(variant.options || {}),
          variant.inventory_qty,
          ts,
          ts,
        ],
      );
      createdVariantIds.push(variant_id);
    }

    await conn.query(
      `INSERT INTO store_products
       (tenant_id, store_id, product_id, is_published, overrides, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?)
       ON DUPLICATE KEY UPDATE is_published = VALUES(is_published), updated_at = VALUES(updated_at)`,
      [args.tenant_id, args.store_id, product_id, args.status === "active" ? 1 : 0, ts, ts],
    );

    for (const row of parsed) {
      const p = row.parsed;
      await conn.query(
        `INSERT INTO store_product_attribute_values
         (tenant_id, store_id, product_id, attribute_id, value_text, value_number, value_bool, value_color, value_date, value_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           value_text = VALUES(value_text),
           value_number = VALUES(value_number),
           value_bool = VALUES(value_bool),
           value_color = VALUES(value_color),
           value_date = VALUES(value_date),
           value_json = VALUES(value_json),
           updated_at = VALUES(updated_at)`,
        [
          args.tenant_id,
          args.store_id,
          product_id,
          row.attr.id,
          p.type === "text" || p.type === "textarea" || p.type === "select"
            ? String(p.value)
            : null,
          p.type === "number" ? p.value : null,
          p.type === "boolean" ? (p.value ? 1 : 0) : null,
          p.type === "color" ? p.value : null,
          p.type === "date" ? p.value : null,
          p.type === "multi_select" ? JSON.stringify(p.value) : null,
          ts,
          ts,
        ],
      );
    }

    if (args.image_urls?.length) {
      let order = 0;
      for (const url of args.image_urls) {
        await conn.query(
          `INSERT INTO product_images (id, tenant_id, product_id, url, alt, sort_order, created_at)
           VALUES (?, ?, ?, ?, NULL, ?, ?)`,
          [newId("pimg").slice(0, 26), args.tenant_id, product_id, url, order++, ts],
        );
      }
    }

    for (const variant_id of createdVariantIds) {
      const variant = variants.find((v) => (v.id || variant_id) === variant_id);
      const qty = Math.max(0, Number(variant?.inventory_qty || 0));
      await conn.query(
        `INSERT INTO inventory_logs
         (id, tenant_id, store_id, product_id, variant_id, change_type, quantity_before, quantity_after, delta_quantity, changed_by, reason, created_at)
         VALUES (?, ?, ?, ?, ?, 'restock', 0, ?, ?, ?, 'Initial stock', ?)`,
        [
          newId("ilog").slice(0, 26),
          args.tenant_id,
          args.store_id,
          product_id,
          variant_id,
          qty,
          qty,
          "system",
          ts,
        ],
      );
    }

    await conn.commit();
    return { product_id, slug };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function listProductsV2(args: {
  tenant_id: string;
  store_id: string;
}) {
  const [rows] = await pool.query<any[]>(
    `SELECT
      p.*,
      sp.is_published,
      sc.name as category_name,
      b.name as brand_name,
      COALESCE(vstats.inventory_qty, 0) as inventory_qty,
      COALESCE(vstats.variant_count, 0) as variant_count,
      COALESCE(vstats.min_price_cents, p.base_price_cents) as min_variant_price_cents
     FROM products p
     JOIN store_products sp ON sp.product_id = p.id AND sp.tenant_id = p.tenant_id AND sp.store_id = ?
     LEFT JOIN store_categories sc ON sc.id = p.store_category_id AND sc.tenant_id = p.tenant_id
     LEFT JOIN brands b ON b.id = p.brand_id AND b.tenant_id = p.tenant_id
     LEFT JOIN (
       SELECT tenant_id, product_id, SUM(inventory_qty) as inventory_qty, COUNT(*) as variant_count, MIN(price_cents) as min_price_cents
       FROM product_variants
       GROUP BY tenant_id, product_id
     ) vstats ON vstats.product_id = p.id AND vstats.tenant_id = p.tenant_id
     WHERE p.tenant_id = ?
     ORDER BY p.created_at DESC`,
    [args.store_id, args.tenant_id],
  );
  return rows;
}

export async function getProductV2(args: {
  tenant_id: string;
  store_id: string;
  product_id: string;
}) {
  const [rows] = await pool.query<any[]>(
    `SELECT p.*, sp.is_published, sc.name as category_name, b.name as brand_name
     FROM products p
     JOIN store_products sp ON sp.product_id = p.id AND sp.tenant_id = p.tenant_id AND sp.store_id = ?
     LEFT JOIN store_categories sc ON sc.id = p.store_category_id AND sc.tenant_id = p.tenant_id
     LEFT JOIN brands b ON b.id = p.brand_id AND b.tenant_id = p.tenant_id
     WHERE p.tenant_id = ? AND p.id = ?
     LIMIT 1`,
    [args.store_id, args.tenant_id, args.product_id],
  );
  const product = rows[0] || null;
  if (!product) return null;

  const [variantRows] = await pool.query<any[]>(
    `SELECT id, sku, price_cents, compare_at_price_cents, options_json, inventory_qty
     FROM product_variants
     WHERE tenant_id = ? AND product_id = ?
     ORDER BY created_at ASC`,
    [args.tenant_id, args.product_id],
  );
  const variants = variantRows.map((v) => ({
    id: v.id,
    sku: v.sku,
    price_cents: Number(v.price_cents || 0),
    compare_at_price_cents:
      v.compare_at_price_cents == null ? null : Number(v.compare_at_price_cents),
    inventory_qty: Number(v.inventory_qty || 0),
    options: parseOptionsJson(v.options_json),
  }));
  const inventory_qty = variants.reduce(
    (sum, v) => sum + Math.max(0, Number(v.inventory_qty || 0)),
    0,
  );

  const [attrRows] = await pool.query<any[]>(
    `SELECT a.code, a.name, a.type,
      v.value_text, v.value_number, v.value_bool, v.value_color, v.value_date, v.value_json
     FROM store_product_attribute_values v
     JOIN store_category_attributes a ON a.id = v.attribute_id
     WHERE v.tenant_id = ? AND v.store_id = ? AND v.product_id = ?
     ORDER BY a.sort_order ASC`,
    [args.tenant_id, args.store_id, args.product_id],
  );
  const attributes: Record<string, any> = {};
  for (const r of attrRows) {
    attributes[r.code] =
      r.value_text ??
      r.value_number ??
      (r.value_bool == null ? null : Boolean(r.value_bool)) ??
      r.value_color ??
      r.value_date ??
      (r.value_json ? JSON.parse(r.value_json) : null);
  }
  const images = await listProductImagesSafe({
    tenant_id: args.tenant_id,
    product_id: args.product_id,
  });
  return { ...product, attributes, variants, inventory_qty, images };
}

function parseAttributeValueOptional(
  attr: any,
  raw: any,
  optionMap: Record<string, Set<string>>,
) {
  const type = String(attr.type);
  if (raw == null || raw === "") return { type, value: null };

  switch (type) {
    case "text":
    case "textarea":
      return { type, value: String(raw) };
    case "number": {
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`Invalid number for ${attr.name}`);
      return { type, value: n };
    }
    case "boolean":
      return { type, value: raw === true || raw === "true" || raw === 1 || raw === "1" };
    case "color": {
      const v = String(raw);
      if (!/^#[0-9a-fA-F]{3,8}$/.test(v)) throw new Error(`Invalid color for ${attr.name}`);
      return { type, value: v };
    }
    case "date": {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) throw new Error(`Invalid date for ${attr.name}`);
      return { type, value: d.toISOString().slice(0, 10) };
    }
    case "select": {
      const v = String(raw);
      const allowed = optionMap[attr.id];
      if (allowed && allowed.size && !allowed.has(v)) {
        throw new Error(`Invalid option for ${attr.name}`);
      }
      return { type, value: v };
    }
    case "multi_select": {
      const arr = Array.isArray(raw) ? raw.map(String) : [String(raw)];
      const allowed = optionMap[attr.id];
      if (allowed && allowed.size) {
        for (const v of arr) {
          if (!allowed.has(v)) throw new Error(`Invalid option for ${attr.name}`);
        }
      }
      return { type, value: arr };
    }
    default:
      throw new Error(`Unsupported attribute type: ${type}`);
  }
}

export async function updateProductV2(args: {
  tenant_id: string;
  store_id: string;
  product_id: string;
  title?: string;
  description?: string | null;
  base_price_cents?: number;
  sku?: string | null;
  inventory_quantity?: number;
  status?: "draft" | "active" | "archived";
  brand_id?: string | null;
  store_category_id?: string | null;
  attributes?: Record<string, any>;
  variants?: VariantInput[];
}) {
  const conn = await pool.getConnection();
  const ts = nowSql();
  try {
    await conn.beginTransaction();

    const [pRows] = await conn.query<any[]>(
      `SELECT p.* FROM products p
       JOIN store_products sp ON sp.product_id = p.id AND sp.tenant_id = p.tenant_id
       WHERE p.tenant_id = ? AND sp.store_id = ? AND p.id = ?
       LIMIT 1 FOR UPDATE`,
      [args.tenant_id, args.store_id, args.product_id],
    );
    const product = pRows[0];
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const [vRows] = await conn.query<any[]>(
      `SELECT id, sku, price_cents, compare_at_price_cents, inventory_qty FROM product_variants
       WHERE tenant_id = ? AND product_id = ?
       ORDER BY created_at ASC FOR UPDATE`,
      [args.tenant_id, args.product_id],
    );
    const firstVariant = vRows[0] || null;

    let brand_id = args.brand_id === undefined ? product.brand_id : args.brand_id;
    if (!brand_id) {
      brand_id = await ensureLegacyBrandForStore({
        tenant_id: args.tenant_id,
        store_id: args.store_id,
      });
    }

    const nextTitle = (args.title ?? product.title ?? "").trim();
    const nextSlugBase = slugify(nextTitle) || "product";
    let nextSlug = product.slug;
    if (args.title && nextTitle && nextTitle !== product.title) {
      nextSlug = nextSlugBase;
      let i = 2;
      while (true) {
        const [slugRows] = await conn.query<any[]>(
          `SELECT id FROM products WHERE tenant_id = ? AND slug = ? AND id <> ? LIMIT 1`,
          [args.tenant_id, nextSlug, args.product_id],
        );
        if (!slugRows.length) break;
        nextSlug = `${nextSlugBase}-${i++}`;
      }
    }

    const nextCategoryId =
      args.store_category_id === undefined ? product.store_category_id : args.store_category_id;

    await conn.query(
      `UPDATE products
       SET brand_id = ?, title = ?, slug = ?, description = ?, status = ?, base_price_cents = ?, sku = ?, store_category_id = ?, updated_at = ?
       WHERE tenant_id = ? AND id = ?`,
      [
        brand_id,
        nextTitle || product.title,
        nextSlug || product.slug,
        args.description === undefined ? product.description : args.description,
        args.status || product.status,
        args.base_price_cents == null ? Number(product.base_price_cents || 0) : Number(args.base_price_cents),
        args.sku === undefined ? product.sku : args.sku,
        nextCategoryId || null,
        ts,
        args.tenant_id,
        args.product_id,
      ],
    );

    if (args.variants !== undefined) {
      const variants = normalizeVariantInputs(
        args.variants,
        args.base_price_cents == null
          ? Number(firstVariant?.price_cents || product.base_price_cents || 0)
          : Number(args.base_price_cents || 0),
        args.inventory_quantity == null
          ? Number(firstVariant?.inventory_qty || 0)
          : Number(args.inventory_quantity || 0),
        args.sku === undefined ? (firstVariant?.sku ?? product.sku ?? null) : args.sku,
      );
      await conn.query(
        `DELETE FROM product_variants WHERE tenant_id = ? AND product_id = ?`,
        [args.tenant_id, args.product_id],
      );
      for (const variant of variants) {
        const id = variant.id || newId("var").slice(0, 26);
        await conn.query(
          `INSERT INTO product_variants
           (id, tenant_id, product_id, sku, price_cents, compare_at_price_cents, options_json, inventory_qty, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?)`,
          [
            id,
            args.tenant_id,
            args.product_id,
            variant.sku,
            variant.price_cents,
            variant.compare_at_price_cents,
            JSON.stringify(variant.options || {}),
            variant.inventory_qty,
            ts,
            ts,
          ],
        );
      }
    } else if (firstVariant) {
      await conn.query(
        `UPDATE product_variants
         SET sku = ?, price_cents = ?, inventory_qty = ?, updated_at = ?
         WHERE tenant_id = ? AND id = ?`,
        [
          args.sku === undefined ? firstVariant.sku : args.sku,
          args.base_price_cents == null ? Number(product.base_price_cents || 0) : Number(args.base_price_cents),
          args.inventory_quantity == null ? Number(firstVariant.inventory_qty || 0) : Math.max(0, Number(args.inventory_quantity)),
          ts,
          args.tenant_id,
          firstVariant.id,
        ],
      );
    }

    await conn.query(
      `INSERT INTO store_products
       (tenant_id, store_id, product_id, is_published, overrides, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?)
       ON DUPLICATE KEY UPDATE is_published = VALUES(is_published), updated_at = VALUES(updated_at)`,
      [args.tenant_id, args.store_id, args.product_id, (args.status || product.status) === "active" ? 1 : 0, ts, ts],
    );

    if (args.attributes && nextCategoryId) {
      const [attrRows] = await conn.query<any[]>(
        `SELECT * FROM store_category_attributes
         WHERE tenant_id = ? AND store_id = ? AND category_id = ?`,
        [args.tenant_id, args.store_id, nextCategoryId],
      );
      const optionRows = attrRows.length
        ? (
            await conn.query<any[]>(
              `SELECT attribute_id, value FROM store_category_attribute_options
               WHERE tenant_id = ? AND attribute_id IN (?)`,
              [args.tenant_id, attrRows.map((a) => a.id)],
            )
          )[0]
        : [];
      const optionMap: Record<string, Set<string>> = {};
      for (const r of optionRows) {
        if (!optionMap[r.attribute_id]) optionMap[r.attribute_id] = new Set();
        optionMap[r.attribute_id].add(String(r.value));
      }

      for (const attr of attrRows) {
        if (!Object.prototype.hasOwnProperty.call(args.attributes, attr.code)) continue;
        const parsed = parseAttributeValueOptional(attr, args.attributes[attr.code], optionMap);
        await conn.query(
          `INSERT INTO store_product_attribute_values
           (tenant_id, store_id, product_id, attribute_id, value_text, value_number, value_bool, value_color, value_date, value_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             value_text = VALUES(value_text),
             value_number = VALUES(value_number),
             value_bool = VALUES(value_bool),
             value_color = VALUES(value_color),
             value_date = VALUES(value_date),
             value_json = VALUES(value_json),
             updated_at = VALUES(updated_at)`,
          [
            args.tenant_id,
            args.store_id,
            args.product_id,
            attr.id,
            parsed.type === "text" || parsed.type === "textarea" || parsed.type === "select"
              ? String(parsed.value)
              : null,
            parsed.type === "number" ? parsed.value : null,
            parsed.type === "boolean" ? (parsed.value ? 1 : 0) : null,
            parsed.type === "color" ? parsed.value : null,
            parsed.type === "date" ? parsed.value : null,
            parsed.type === "multi_select" ? JSON.stringify(parsed.value) : null,
            ts,
            ts,
          ],
        );
      }
    }

    await conn.commit();
    return { product_id: args.product_id };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getProductAttributesForCard(args: {
  tenant_id: string;
  store_id: string;
  product_id: string;
}) {
  const [rows] = await pool.query<any[]>(
    `SELECT a.code, a.name, a.type,
      v.value_text, v.value_number, v.value_bool, v.value_color, v.value_date, v.value_json
     FROM store_product_attribute_values v
     JOIN store_category_attributes a ON a.id = v.attribute_id
     WHERE v.tenant_id = ? AND v.store_id = ? AND v.product_id = ?
     ORDER BY a.sort_order ASC`,
    [args.tenant_id, args.store_id, args.product_id],
  );
  return rows.map((r) => ({
    code: r.code,
    name: r.name,
    type: r.type,
    value:
      r.value_text ??
      r.value_number ??
      (r.value_bool == null ? null : Boolean(r.value_bool)) ??
      r.value_color ??
      r.value_date ??
      (r.value_json ? JSON.parse(r.value_json) : null),
  }));
}

export async function getInventorySnapshot(args: {
  tenant_id: string;
  store_id: string;
  q?: string;
}) {
  const where = ["p.tenant_id = ?", "sp.store_id = ?"];
  const params: any[] = [args.tenant_id, args.store_id];
  if (args.q) {
    where.push(
      "(p.title LIKE ? OR p.sku LIKE ? OR v.sku LIKE ? OR JSON_EXTRACT(v.options_json, '$') LIKE ?)",
    );
    const like = `%${args.q}%`;
    params.push(like, like, like, like);
  }
  const [rows] = await pool.query<any[]>(
    `SELECT
       p.id as product_id,
       p.title,
       p.sku as product_sku,
       COALESCE(v.sku, p.sku) as sku,
       v.sku as variant_sku,
       v.options_json as variant_options_json,
       v.id as variant_id,
       v.inventory_qty
     FROM products p
     JOIN store_products sp ON sp.product_id = p.id AND sp.tenant_id = p.tenant_id
     JOIN product_variants v ON v.product_id = p.id AND v.tenant_id = p.tenant_id
     WHERE ${where.join(" AND ")}
     ORDER BY p.created_at DESC`,
    params,
  );
  return rows;
}

export async function adjustInventory(args: {
  tenant_id: string;
  store_id: string;
  product_id: string;
  variant_id?: string;
  change_type: "restock" | "manual_adjustment";
  delta_quantity: number;
  changed_by?: string;
  reason?: string;
}) {
  const conn = await pool.getConnection();
  const ts = nowSql();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<any[]>(
      `SELECT id, inventory_qty FROM product_variants
       WHERE tenant_id = ? AND product_id = ?
       ${args.variant_id ? "AND id = ?" : ""}
       ORDER BY created_at ASC LIMIT 1
       FOR UPDATE`,
      args.variant_id
        ? [args.tenant_id, args.product_id, args.variant_id]
        : [args.tenant_id, args.product_id],
    );
    const variant = rows[0];
    if (!variant) throw new Error("VARIANT_NOT_FOUND");

    const before = Number(variant.inventory_qty || 0);
    const after = Math.max(0, before + Number(args.delta_quantity || 0));
    await conn.query(
      `UPDATE product_variants SET inventory_qty = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`,
      [after, ts, variant.id, args.tenant_id],
    );
    await conn.query(
      `INSERT INTO inventory_logs
       (id, tenant_id, store_id, product_id, variant_id, change_type, quantity_before, quantity_after, delta_quantity, changed_by, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId("ilog").slice(0, 26),
        args.tenant_id,
        args.store_id,
        args.product_id,
        variant.id,
        args.change_type,
        before,
        after,
        after - before,
        args.changed_by || "admin",
        args.reason || null,
        ts,
      ],
    );
    await conn.commit();
    return { before, after, variant_id: variant.id };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function placeOrderV2(args: {
  tenant_id: string;
  site_id: string;
  store_id: string;
  currency?: string;
  customer?: any;
  shipping?: any;
  items: Array<{ product_id: string; variant_id?: string; qty: number }>;
}) {
  const conn = await pool.getConnection();
  const ts = nowSql();
  try {
    await conn.beginTransaction();

    const resolved: Array<{
      product_id: string;
      variant_id: string;
      qty: number;
      title: string;
      sku: string | null;
      price_cents: number;
      before: number;
      after: number;
    }> = [];

    for (const item of args.items) {
      const [rows] = await conn.query<any[]>(
        `SELECT p.title, v.id as variant_id, v.sku, v.price_cents, v.inventory_qty
         FROM products p
         JOIN product_variants v ON v.product_id = p.id AND v.tenant_id = p.tenant_id
         WHERE p.tenant_id = ? AND p.id = ?
           ${item.variant_id ? "AND v.id = ?" : ""}
         ORDER BY v.created_at ASC
         LIMIT 1
         FOR UPDATE`,
        item.variant_id
          ? [args.tenant_id, item.product_id, item.variant_id]
          : [args.tenant_id, item.product_id],
      );
      const row = rows[0];
      if (!row) throw new Error(`PRODUCT_NOT_FOUND:${item.product_id}`);
      const qty = Math.max(1, Number(item.qty || 1));
      const before = Number(row.inventory_qty || 0);
      if (before < qty) {
        throw new Error(`INSUFFICIENT_INVENTORY:${item.product_id}`);
      }
      const after = before - qty;
      await conn.query(
        `UPDATE product_variants SET inventory_qty = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`,
        [after, ts, row.variant_id, args.tenant_id],
      );
      resolved.push({
        product_id: item.product_id,
        variant_id: row.variant_id,
        qty,
        title: row.title,
        sku: row.sku,
        price_cents: Number(row.price_cents || 0),
        before,
        after,
      });
    }

    const subtotal = resolved.reduce((sum, i) => sum + i.price_cents * i.qty, 0);
    const total = subtotal;
    const order_id = newId("corder").slice(0, 26);
    const order_number = `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`.toUpperCase();

    await conn.query(
      `INSERT INTO commerce_orders
       (id, tenant_id, site_id, store_id, order_number, status, subtotal_cents, discount_cents, total_cents, currency, customer_json, shipping_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'new', ?, 0, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        args.tenant_id,
        args.site_id,
        args.store_id,
        order_number,
        subtotal,
        total,
        args.currency || "USD",
        JSON.stringify(args.customer || {}),
        JSON.stringify(args.shipping || {}),
        ts,
        ts,
      ],
    );

    for (const line of resolved) {
      const line_id = newId("coi").slice(0, 26);
      await conn.query(
        `INSERT INTO commerce_order_items
         (id, tenant_id, order_id, product_id, variant_id, title, sku, price_cents, quantity, line_total_cents, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          line_id,
          args.tenant_id,
          order_id,
          line.product_id,
          line.variant_id,
          line.title,
          line.sku,
          line.price_cents,
          line.qty,
          line.price_cents * line.qty,
          ts,
        ],
      );
      await conn.query(
        `INSERT INTO inventory_logs
         (id, tenant_id, store_id, product_id, variant_id, change_type, quantity_before, quantity_after, delta_quantity, changed_by, reason, order_id, created_at)
         VALUES (?, ?, ?, ?, ?, 'order', ?, ?, ?, 'system', 'Order placed', ?, ?)`,
        [
          newId("ilog").slice(0, 26),
          args.tenant_id,
          args.store_id,
          line.product_id,
          line.variant_id,
          line.before,
          line.after,
          line.after - line.before,
          order_id,
          ts,
        ],
      );
    }

    await conn.commit();
    return { order_id, order_number, subtotal_cents: subtotal, total_cents: total };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getProductV2BySlug(args: {
  tenant_id: string;
  store_id: string;
  slug: string;
}) {
  const [rows] = await pool.query<any[]>(
    `SELECT p.*, sp.is_published, v.id as variant_id, v.inventory_qty, v.price_cents as variant_price, v.options_json
     FROM products p
     JOIN store_products sp ON sp.product_id = p.id AND sp.tenant_id = p.tenant_id AND sp.store_id = ?
     LEFT JOIN product_variants v ON v.product_id = p.id AND v.tenant_id = p.tenant_id
     WHERE p.tenant_id = ? AND p.slug = ? AND p.status = 'active' AND sp.is_published = 1
     ORDER BY v.created_at ASC`,
    [args.store_id, args.tenant_id, args.slug],
  );
  if (!rows.length) return null;
  const product = rows[0];
  const images = await listProductImagesSafe({
    tenant_id: args.tenant_id,
    product_id: product.id,
  });
  const attrs = await getProductAttributesForCard({
    tenant_id: args.tenant_id,
    store_id: args.store_id,
    product_id: product.id,
  });
  const variants = rows
    .filter((r) => !!r.variant_id)
    .map((r) => ({
      id: r.variant_id,
      inventory_qty: Number(r.inventory_qty || 0),
      price_cents: Number(r.variant_price || product.base_price_cents || 0),
      options: parseOptionsJson(r.options_json),
    }));
  return {
    ...product,
    images,
    attributes: attrs,
    variants,
  };
}
