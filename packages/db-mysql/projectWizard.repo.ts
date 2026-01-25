import { pool } from "./index";
import { newId, nowSql, slugify } from "./id";

export async function createProductWithAttributes(args: {
  tenant_id: string;
  store_id: string;
  title: string;
  description?: string;
  brand_id?: string | null;
  base_price_cents: number;
  category_ids: string[];
  attributes: Array<{ attribute_id: string; value: any }>;
  variants: Array<{
    sku: string;
    price_cents: number;
    inventory_qty: number;
    attributes: Array<{ attribute_id: string; option_id: string }>;
  }>;
}) {
  const ts = nowSql();
  const product_id = newId("prod");
  const slug = slugify(args.title);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO products (id, tenant_id, brand_id, title, slug, description, status, base_price_cents, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [
        product_id,
        args.tenant_id,
        args.brand_id ?? null,
        args.title,
        slug,
        args.description ?? null,
        args.base_price_cents,
        ts,
        ts,
      ],
    );

    for (const cat_id of args.category_ids) {
      await conn.query(
        `INSERT INTO product_categories (tenant_id, product_id, category_id, created_at)
         VALUES (?, ?, ?, ?)`,
        [args.tenant_id, product_id, cat_id, ts],
      );
    }

    for (const attr of args.attributes) {
      await conn.query(
        `INSERT INTO product_attribute_values
         (tenant_id, product_id, attribute_id, value_text, value_number, value_bool)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          args.tenant_id,
          product_id,
          attr.attribute_id,
          typeof attr.value === "string" ? attr.value : null,
          typeof attr.value === "number" ? attr.value : null,
          typeof attr.value === "boolean" ? (attr.value ? 1 : 0) : null,
        ],
      );
    }

    for (const v of args.variants) {
      const variant_id = newId("var");

      await conn.query(
        `INSERT INTO product_variants
         (id, tenant_id, product_id, sku, price_cents, inventory_qty, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          variant_id,
          args.tenant_id,
          product_id,
          v.sku,
          v.price_cents,
          v.inventory_qty,
          ts,
          ts,
        ],
      );

      for (const va of v.attributes) {
        await conn.query(
          `INSERT INTO variant_attribute_values
           (tenant_id, variant_id, attribute_id, option_id)
           VALUES (?, ?, ?, ?)`,
          [args.tenant_id, variant_id, va.attribute_id, va.option_id],
        );
      }
    }

    await conn.query(
      `INSERT INTO store_products
       (tenant_id, store_id, product_id, is_published, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [args.tenant_id, args.store_id, product_id, ts, ts],
    );

    await conn.commit();
    return product_id;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
