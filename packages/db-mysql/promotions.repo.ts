import { newId } from "./id";
import { pool } from "./index";

type PromotionTargetType = "store" | "brand" | "category" | "product";
type DiscountType = "percent" | "fixed";
type DiscountScope = "order" | "items";

export type PromotionInput = {
  tenant_id: string;
  site_id: string;
  store_id: string;
  name: string;
  code?: string | null;
  is_active?: boolean;
  is_secret?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  discount_type: DiscountType;
  discount_scope: DiscountScope;
  discount_value: number;
  min_order_cents?: number;
  max_discount_cents?: number | null;
  usage_limit_total?: number | null;
  usage_limit_per_customer?: number | null;
  first_n_customers?: number | null;
  stackable?: boolean;
  priority?: number;
  targets?: Array<{ type: PromotionTargetType; id?: string | null }>;
};

export type CartLineForPromotion = {
  product_id: string;
  variant_id?: string;
  qty: number;
};

type ResolvedLine = {
  product_id: string;
  variant_id: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  brand_id: string | null;
  category_id: string | null;
};

function nowSql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function normalizeCode(code?: string | null) {
  const v = String(code || "").trim().toUpperCase();
  return v || null;
}

function toCustomerKey(customer: any) {
  const email = String(customer?.email || "")
    .trim()
    .toLowerCase();
  if (email) return `email:${email}`;
  const phone = String(customer?.phone || "").trim();
  if (phone) return `phone:${phone}`;
  return "";
}

function parseBool(v: any) {
  return Number(v || 0) === 1 || v === true;
}

function parseTargets(rows: any[]) {
  const out = {
    store: false,
    brandIds: new Set<string>(),
    categoryIds: new Set<string>(),
    productIds: new Set<string>(),
  };
  for (const r of rows || []) {
    const t = String(r.target_type || "");
    const id = r.target_id ? String(r.target_id) : "";
    if (t === "store") out.store = true;
    else if (t === "brand" && id) out.brandIds.add(id);
    else if (t === "category" && id) out.categoryIds.add(id);
    else if (t === "product" && id) out.productIds.add(id);
  }
  return out;
}

function promotionMatchesLine(targets: ReturnType<typeof parseTargets>, line: ResolvedLine) {
  if (targets.store) return true;
  const checks: boolean[] = [];
  if (targets.brandIds.size) checks.push(!!line.brand_id && targets.brandIds.has(line.brand_id));
  if (targets.categoryIds.size) {
    checks.push(!!line.category_id && targets.categoryIds.has(line.category_id));
  }
  if (targets.productIds.size) checks.push(targets.productIds.has(line.product_id));
  if (!checks.length) return true;
  return checks.some(Boolean);
}

export async function createPromotion(input: PromotionInput) {
  const conn = await pool.getConnection();
  const ts = nowSql();
  try {
    await conn.beginTransaction();
    const id = newId("promo").slice(0, 26);
    const code = normalizeCode(input.code);
    await conn.query(
      `INSERT INTO store_promotions
       (id, tenant_id, site_id, store_id, name, code, is_active, is_secret, starts_at, ends_at, discount_type, discount_scope, discount_value, min_order_cents, max_discount_cents, usage_limit_total, usage_limit_per_customer, first_n_customers, stackable, priority, created_at, updated_at, archived_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        id,
        input.tenant_id,
        input.site_id,
        input.store_id,
        input.name.trim(),
        code,
        input.is_active === false ? 0 : 1,
        input.is_secret ? 1 : 0,
        input.starts_at || null,
        input.ends_at || null,
        input.discount_type,
        input.discount_scope,
        Number(input.discount_value || 0),
        Math.max(0, Number(input.min_order_cents || 0)),
        input.max_discount_cents == null ? null : Math.max(0, Number(input.max_discount_cents || 0)),
        input.usage_limit_total == null ? null : Math.max(0, Number(input.usage_limit_total || 0)),
        input.usage_limit_per_customer == null
          ? null
          : Math.max(0, Number(input.usage_limit_per_customer || 0)),
        input.first_n_customers == null ? null : Math.max(0, Number(input.first_n_customers || 0)),
        input.stackable ? 1 : 0,
        Number(input.priority || 0),
        ts,
        ts,
      ],
    );

    const targets = (input.targets || []).length
      ? input.targets || []
      : [{ type: "store" as const, id: null }];
    for (const t of targets) {
      await conn.query(
        `INSERT INTO store_promotion_targets
         (id, tenant_id, promotion_id, target_type, target_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newId("pt").slice(0, 26),
          input.tenant_id,
          id,
          t.type,
          t.id || null,
          ts,
        ],
      );
    }
    await conn.commit();
    return { id };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function updatePromotion(args: {
  tenant_id: string;
  store_id: string;
  promotion_id: string;
  patch: Partial<PromotionInput>;
}) {
  const conn = await pool.getConnection();
  const ts = nowSql();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<any[]>(
      `SELECT * FROM store_promotions WHERE tenant_id = ? AND store_id = ? AND id = ? LIMIT 1`,
      [args.tenant_id, args.store_id, args.promotion_id],
    );
    const existing = rows[0];
    if (!existing) throw new Error("PROMOTION_NOT_FOUND");
    const p = args.patch;
    await conn.query(
      `UPDATE store_promotions
       SET name = ?, code = ?, is_active = ?, is_secret = ?, starts_at = ?, ends_at = ?,
           discount_type = ?, discount_scope = ?, discount_value = ?, min_order_cents = ?,
           max_discount_cents = ?, usage_limit_total = ?, usage_limit_per_customer = ?, first_n_customers = ?,
           stackable = ?, priority = ?, updated_at = ?
       WHERE tenant_id = ? AND store_id = ? AND id = ?`,
      [
        p.name?.trim() || existing.name,
        p.code === undefined ? existing.code : normalizeCode(p.code),
        p.is_active === undefined ? existing.is_active : p.is_active ? 1 : 0,
        p.is_secret === undefined ? existing.is_secret : p.is_secret ? 1 : 0,
        p.starts_at === undefined ? existing.starts_at : p.starts_at || null,
        p.ends_at === undefined ? existing.ends_at : p.ends_at || null,
        p.discount_type || existing.discount_type,
        p.discount_scope || existing.discount_scope,
        p.discount_value == null ? existing.discount_value : Number(p.discount_value || 0),
        p.min_order_cents == null ? existing.min_order_cents : Math.max(0, Number(p.min_order_cents || 0)),
        p.max_discount_cents === undefined
          ? existing.max_discount_cents
          : p.max_discount_cents == null
            ? null
            : Math.max(0, Number(p.max_discount_cents || 0)),
        p.usage_limit_total === undefined
          ? existing.usage_limit_total
          : p.usage_limit_total == null
            ? null
            : Math.max(0, Number(p.usage_limit_total || 0)),
        p.usage_limit_per_customer === undefined
          ? existing.usage_limit_per_customer
          : p.usage_limit_per_customer == null
            ? null
            : Math.max(0, Number(p.usage_limit_per_customer || 0)),
        p.first_n_customers === undefined
          ? existing.first_n_customers
          : p.first_n_customers == null
            ? null
            : Math.max(0, Number(p.first_n_customers || 0)),
        p.stackable === undefined ? existing.stackable : p.stackable ? 1 : 0,
        p.priority == null ? existing.priority : Number(p.priority || 0),
        ts,
        args.tenant_id,
        args.store_id,
        args.promotion_id,
      ],
    );

    if (p.targets) {
      await conn.query(
        `DELETE FROM store_promotion_targets WHERE tenant_id = ? AND promotion_id = ?`,
        [args.tenant_id, args.promotion_id],
      );
      const targets = p.targets.length
        ? p.targets
        : [{ type: "store" as const, id: null }];
      for (const t of targets) {
        await conn.query(
          `INSERT INTO store_promotion_targets
           (id, tenant_id, promotion_id, target_type, target_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newId("pt").slice(0, 26),
            args.tenant_id,
            args.promotion_id,
            t.type,
            t.id || null,
            ts,
          ],
        );
      }
    }
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function archivePromotion(args: {
  tenant_id: string;
  store_id: string;
  promotion_id: string;
}) {
  const ts = nowSql();
  await pool.query(
    `UPDATE store_promotions
     SET is_active = 0, archived_at = ?, updated_at = ?
     WHERE tenant_id = ? AND store_id = ? AND id = ?`,
    [ts, ts, args.tenant_id, args.store_id, args.promotion_id],
  );
}

export async function listPromotions(args: {
  tenant_id: string;
  store_id: string;
  include_archived?: boolean;
}) {
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM store_promotions
     WHERE tenant_id = ? AND store_id = ?
       ${args.include_archived ? "" : "AND archived_at IS NULL"}
     ORDER BY priority DESC, created_at DESC`,
    [args.tenant_id, args.store_id],
  );
  const ids = (rows || []).map((r) => String(r.id));
  const [targetRows] = ids.length
    ? await pool.query<any[]>(
        `SELECT promotion_id, target_type, target_id
         FROM store_promotion_targets
         WHERE tenant_id = ? AND promotion_id IN (?)`,
        [args.tenant_id, ids],
      )
    : [[] as any[]];
  const byPromo: Record<string, any[]> = {};
  for (const t of targetRows || []) {
    const k = String(t.promotion_id);
    if (!byPromo[k]) byPromo[k] = [];
    byPromo[k].push({
      type: String(t.target_type),
      id: t.target_id ? String(t.target_id) : null,
    });
  }
  return (rows || []).map((r) => ({
    ...r,
    targets: byPromo[String(r.id)] || [],
  }));
}

async function resolveCartLines(
  conn: any,
  args: { tenant_id: string; items: CartLineForPromotion[] },
): Promise<ResolvedLine[]> {
  const lines: ResolvedLine[] = [];
  for (const item of args.items || []) {
    const [rows] = await conn.query<any[]>(
      `SELECT p.id as product_id, p.brand_id, p.store_category_id, v.id as variant_id, v.price_cents
       FROM products p
       JOIN product_variants v ON v.product_id = p.id AND v.tenant_id = p.tenant_id
       WHERE p.tenant_id = ? AND p.id = ?
         ${item.variant_id ? "AND v.id = ?" : ""}
       ORDER BY v.created_at ASC
       LIMIT 1`,
      item.variant_id
        ? [args.tenant_id, item.product_id, item.variant_id]
        : [args.tenant_id, item.product_id],
    );
    const row = rows[0];
    if (!row) continue;
    const qty = Math.max(1, Number(item.qty || 1));
    const unit = Math.max(0, Number(row.price_cents || 0));
    lines.push({
      product_id: String(row.product_id),
      variant_id: String(row.variant_id),
      qty,
      unit_price_cents: unit,
      line_total_cents: unit * qty,
      brand_id: row.brand_id ? String(row.brand_id) : null,
      category_id: row.store_category_id ? String(row.store_category_id) : null,
    });
  }
  return lines;
}

export async function evaluatePromotions(args: {
  tenant_id: string;
  site_id: string;
  store_id: string;
  items: CartLineForPromotion[];
  coupon_code?: string;
  customer?: any;
  include_secret?: boolean;
  only_visible?: boolean;
  conn?: any;
}) {
  const ownConn = !args.conn;
  const conn = args.conn || (await pool.getConnection());
  try {
    const lines = await resolveCartLines(conn, args);
    const subtotal = lines.reduce((s, l) => s + l.line_total_cents, 0);
    if (!lines.length) {
      return { subtotal_cents: 0, candidates: [], applied: null };
    }

    const code = normalizeCode(args.coupon_code);
    const [promoRows] = await conn.query<any[]>(
      `SELECT *
       FROM store_promotions
       WHERE tenant_id = ? AND site_id = ? AND store_id = ?
         AND archived_at IS NULL
         AND is_active = 1
         ${code ? "AND code = ?" : ""}
         ${args.only_visible ? "AND is_secret = 0" : ""}
       ORDER BY priority DESC, created_at DESC`,
      code
        ? [args.tenant_id, args.site_id, args.store_id, code]
        : [args.tenant_id, args.site_id, args.store_id],
    );
    if (!promoRows.length) {
      return { subtotal_cents: subtotal, candidates: [], applied: null };
    }
    const promoIds = promoRows.map((p) => String(p.id));
    const [targetRows] = await conn.query<any[]>(
      `SELECT promotion_id, target_type, target_id
       FROM store_promotion_targets
       WHERE tenant_id = ? AND promotion_id IN (?)`,
      [args.tenant_id, promoIds],
    );
    const [usageRows] = await conn.query<any[]>(
      `SELECT promotion_id, customer_key
       FROM store_promotion_usage
       WHERE tenant_id = ? AND store_id = ? AND promotion_id IN (?)`,
      [args.tenant_id, args.store_id, promoIds],
    );
    const usageByPromo: Record<string, { total: number; unique: Set<string>; byCustomer: Record<string, number> }> = {};
    for (const u of usageRows || []) {
      const pid = String(u.promotion_id);
      if (!usageByPromo[pid]) usageByPromo[pid] = { total: 0, unique: new Set(), byCustomer: {} };
      usageByPromo[pid].total += 1;
      const key = String(u.customer_key || "");
      if (key) {
        usageByPromo[pid].unique.add(key);
        usageByPromo[pid].byCustomer[key] = (usageByPromo[pid].byCustomer[key] || 0) + 1;
      }
    }
    const targetsByPromo: Record<string, any[]> = {};
    for (const t of targetRows || []) {
      const pid = String(t.promotion_id);
      if (!targetsByPromo[pid]) targetsByPromo[pid] = [];
      targetsByPromo[pid].push(t);
    }

    const now = new Date();
    const customerKey = toCustomerKey(args.customer);

    const candidates: any[] = [];
    for (const p of promoRows) {
      if (!args.include_secret && parseBool(p.is_secret) && !code) continue;
      if (p.starts_at && new Date(p.starts_at) > now) continue;
      if (p.ends_at && new Date(p.ends_at) < now) continue;

      const usage = usageByPromo[String(p.id)] || {
        total: 0,
        unique: new Set<string>(),
        byCustomer: {},
      };
      if (p.usage_limit_total != null && usage.total >= Number(p.usage_limit_total)) continue;
      if (
        p.first_n_customers != null &&
        Number(p.first_n_customers) > 0 &&
        usage.unique.size >= Number(p.first_n_customers) &&
        (!customerKey || !usage.unique.has(customerKey))
      ) {
        continue;
      }
      if (
        p.usage_limit_per_customer != null &&
        customerKey &&
        (usage.byCustomer[customerKey] || 0) >= Number(p.usage_limit_per_customer)
      ) {
        continue;
      }

      const targets = parseTargets(targetsByPromo[String(p.id)] || []);
      const eligibleLines = lines.filter((l) => promotionMatchesLine(targets, l));
      if (!eligibleLines.length) continue;

      if (Number(p.min_order_cents || 0) > subtotal) continue;

      const baseForDiscount =
        String(p.discount_scope) === "items"
          ? eligibleLines.reduce((s, l) => s + l.line_total_cents, 0)
          : subtotal;
      if (baseForDiscount <= 0) continue;

      let discount = 0;
      if (String(p.discount_type) === "percent") {
        let pct = Number(p.discount_value || 0);
        // Support both 20 and 0.2 style inputs for 20%.
        if (pct > 0 && pct <= 1) pct = pct * 100;
        pct = Math.max(0, Math.min(100, pct));
        discount = Math.round((baseForDiscount * pct) / 100);
      } else {
        discount = Math.round(Number(p.discount_value || 0));
      }
      if (p.max_discount_cents != null) {
        discount = Math.min(discount, Number(p.max_discount_cents || 0));
      }
      discount = Math.max(0, Math.min(discount, subtotal));
      if (!discount) continue;

      candidates.push({
        id: String(p.id),
        code: p.code ? String(p.code) : "",
        name: String(p.name || "Promotion"),
        is_secret: parseBool(p.is_secret),
        discount_cents: discount,
        discount_scope: String(p.discount_scope || "order"),
        discount_type: String(p.discount_type || "percent"),
        discount_value: Number(p.discount_value || 0),
        priority: Number(p.priority || 0),
      });
    }

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.discount_cents - a.discount_cents;
    });
    const applied = code ? candidates[0] || null : candidates[0] || null;
    return { subtotal_cents: subtotal, candidates, applied };
  } finally {
    if (ownConn) conn.release();
  }
}

export async function recordPromotionUsage(args: {
  tenant_id: string;
  site_id: string;
  store_id: string;
  promotion_id: string;
  promotion_code?: string | null;
  order_id?: string | null;
  customer?: any;
  discount_cents: number;
  conn?: any;
}) {
  const ts = nowSql();
  const customerKey = toCustomerKey(args.customer);
  const db = args.conn || pool;
  await db.query(
    `INSERT INTO store_promotion_usage
     (id, tenant_id, site_id, store_id, promotion_id, promotion_code, order_id, customer_key, discount_cents, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newId("puse").slice(0, 26),
      args.tenant_id,
      args.site_id,
      args.store_id,
      args.promotion_id,
      normalizeCode(args.promotion_code),
      args.order_id || null,
      customerKey || null,
      Math.max(0, Number(args.discount_cents || 0)),
      ts,
    ],
  );
}
