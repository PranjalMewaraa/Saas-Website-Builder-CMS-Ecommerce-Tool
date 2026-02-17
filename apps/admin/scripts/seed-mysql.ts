import { pool } from "../../../packages/db-mysql/index.js";

function nowSql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function run() {
  const tenant_id = "t_demo";
  const store_id = "s_demo";

  const brand1 = { id: "b_demo_acme", name: "Acme", slug: "acme" };
  const brand2 = { id: "b_demo_zen", name: "ZenTech", slug: "zentech" };

  const cat1 = {
    id: "cat_demo_laptops",
    name: "Laptops",
    slug: "laptops",
    parent_id: null as string | null,
  };
  const cat2 = {
    id: "cat_demo_access",
    name: "Accessories",
    slug: "accessories",
    parent_id: null as string | null,
  };

  const product1 = {
    id: "p_demo_laptop1",
    brand_id: brand1.id,
    title: "Acme ProBook 15",
    slug: "acme-probook-15",
    desc: "A fast laptop for work and play.",
    price: 99900,
  };

  const product2 = {
    id: "p_demo_mouse1",
    brand_id: brand2.id,
    title: "ZenTech Wireless Mouse",
    slug: "zentech-wireless-mouse",
    desc: "Smooth tracking, long battery life.",
    price: 2900,
  };

  const ts = nowSql();

  // Store (distributor for demo)
  await pool.query(
    `INSERT INTO stores (id, tenant_id, name, store_type, currency, timezone, status, created_at, updated_at)
     VALUES (?, ?, ?, 'distributor', 'INR', 'UTC', 'active', ?, ?)
     ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=VALUES(updated_at)`,
    [store_id, tenant_id, "Demo Store", ts, ts]
  );

  // Brands
  for (const b of [brand1, brand2]) {
    await pool.query(
      `INSERT INTO brands (id, tenant_id, name, slug, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), updated_at=VALUES(updated_at)`,
      [b.id, tenant_id, b.name, b.slug, ts, ts]
    );
  }

  // Categories
  for (const c of [cat1, cat2]) {
    await pool.query(
      `INSERT INTO categories (id, tenant_id, name, slug, parent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), parent_id=VALUES(parent_id), updated_at=VALUES(updated_at)`,
      [c.id, tenant_id, c.name, c.slug, c.parent_id, ts, ts]
    );
  }

  // Products
  for (const p of [product1, product2]) {
    await pool.query(
      `INSERT INTO products
        (id, tenant_id, brand_id, title, slug, description, status, base_price_cents, custom_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, JSON_OBJECT('seed', true), ?, ?)
       ON DUPLICATE KEY UPDATE
        title=VALUES(title), description=VALUES(description), base_price_cents=VALUES(base_price_cents), updated_at=VALUES(updated_at)`,
      [p.id, tenant_id, p.brand_id, p.title, p.slug, p.desc, p.price, ts, ts]
    );
  }

  // Product variants (one default variant each)
  await pool.query(
    `INSERT INTO product_variants
      (id, tenant_id, product_id, sku, price_cents, options_json, inventory_qty, created_at, updated_at)
     VALUES
      ('v_demo_laptop1', ?, ?, 'ACME-PB15', ?, JSON_OBJECT('default', true), 25, ?, ?)
     ON DUPLICATE KEY UPDATE price_cents=VALUES(price_cents), inventory_qty=VALUES(inventory_qty), updated_at=VALUES(updated_at)`,
    [tenant_id, product1.id, product1.price, ts, ts]
  );

  await pool.query(
    `INSERT INTO product_variants
      (id, tenant_id, product_id, sku, price_cents, options_json, inventory_qty, created_at, updated_at)
     VALUES
      ('v_demo_mouse1', ?, ?, 'ZEN-MOUSE', ?, JSON_OBJECT('default', true), 100, ?, ?)
     ON DUPLICATE KEY UPDATE price_cents=VALUES(price_cents), inventory_qty=VALUES(inventory_qty), updated_at=VALUES(updated_at)`,
    [tenant_id, product2.id, product2.price, ts, ts]
  );

  // Product-category mapping
  await pool.query(
    `INSERT IGNORE INTO product_categories (tenant_id, product_id, category_id, created_at)
     VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
    [tenant_id, product1.id, cat1.id, ts, tenant_id, product2.id, cat2.id, ts]
  );

  // Enable brands in store (distributor)
  await pool.query(
    `INSERT INTO store_brands (tenant_id, store_id, brand_id, status, created_at)
     VALUES (?, ?, ?, 'enabled', ?), (?, ?, ?, 'enabled', ?)
     ON DUPLICATE KEY UPDATE status=VALUES(status)`,
    [tenant_id, store_id, brand1.id, ts, tenant_id, store_id, brand2.id, ts]
  );

  // Publish products to store
  await pool.query(
    `INSERT INTO store_products (tenant_id, store_id, product_id, is_published, overrides, created_at, updated_at)
     VALUES
      (?, ?, ?, 1, NULL, ?, ?),
      (?, ?, ?, 1, NULL, ?, ?)
     ON DUPLICATE KEY UPDATE is_published=VALUES(is_published), updated_at=VALUES(updated_at)`,
    [
      tenant_id,
      store_id,
      product1.id,
      ts,
      ts,
      tenant_id,
      store_id,
      product2.id,
      ts,
      ts,
    ]
  );

  console.log("Seeded MySQL demo data ✅");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
