USE saas_builder;

-- Store profile for v2 commerce behavior
CREATE TABLE IF NOT EXISTS store_profiles (
  tenant_id              VARCHAR(26) NOT NULL,
  store_id               VARCHAR(26) NOT NULL,
  store_preset           VARCHAR(64) NULL, -- fashion, electronics, etc
  low_stock_threshold    INT NOT NULL DEFAULT 5,
  default_filters_json   JSON NULL,
  created_at             DATETIME NOT NULL,
  updated_at             DATETIME NOT NULL,
  PRIMARY KEY (tenant_id, store_id),
  INDEX idx_store_profiles_store (store_id),
  CONSTRAINT fk_store_profiles_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Additive extension for brands (store scoped + role)
CREATE TABLE IF NOT EXISTS brand_profiles (
  tenant_id     VARCHAR(26) NOT NULL,
  brand_id      VARCHAR(26) NOT NULL,
  store_id      VARCHAR(26) NOT NULL,
  type          ENUM('brand', 'distributor') NOT NULL DEFAULT 'brand',
  logo          VARCHAR(2048) NULL,
  description   TEXT NULL,
  created_at    DATETIME NOT NULL,
  updated_at    DATETIME NOT NULL,
  PRIMARY KEY (tenant_id, brand_id),
  INDEX idx_brand_profiles_store (tenant_id, store_id),
  INDEX idx_brand_profiles_type (tenant_id, store_id, type),
  CONSTRAINT fk_brand_profiles_brand
    FOREIGN KEY (brand_id) REFERENCES brands(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_brand_profiles_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Store-scoped categories (v2) - legacy categories remain untouched
CREATE TABLE IF NOT EXISTS store_categories (
  id            VARCHAR(26) PRIMARY KEY,
  tenant_id     VARCHAR(26) NOT NULL,
  store_id      VARCHAR(26) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL,
  parent_id     VARCHAR(26) NULL,
  created_at    DATETIME NOT NULL,
  updated_at    DATETIME NOT NULL,
  UNIQUE KEY uq_store_category_slug (tenant_id, store_id, slug),
  INDEX idx_store_categories_store (tenant_id, store_id),
  INDEX idx_store_categories_parent (tenant_id, store_id, parent_id),
  CONSTRAINT fk_store_categories_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Category attribute definitions
CREATE TABLE IF NOT EXISTS store_category_attributes (
  id              VARCHAR(26) PRIMARY KEY,
  tenant_id       VARCHAR(26) NOT NULL,
  store_id        VARCHAR(26) NOT NULL,
  category_id     VARCHAR(26) NOT NULL,
  code            VARCHAR(64) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  type            ENUM('text','textarea','select','multi_select','number','boolean','color','date') NOT NULL,
  is_required     TINYINT(1) NOT NULL DEFAULT 0,
  is_filterable   TINYINT(1) NOT NULL DEFAULT 1,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  UNIQUE KEY uq_sca_code (tenant_id, store_id, category_id, code),
  INDEX idx_sca_category (tenant_id, store_id, category_id),
  INDEX idx_sca_filterable (tenant_id, store_id, category_id, is_filterable),
  CONSTRAINT fk_sca_category
    FOREIGN KEY (category_id) REFERENCES store_categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS store_category_attribute_options (
  id             VARCHAR(26) PRIMARY KEY,
  tenant_id      VARCHAR(26) NOT NULL,
  attribute_id   VARCHAR(26) NOT NULL,
  label          VARCHAR(255) NOT NULL,
  value          VARCHAR(255) NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL,
  INDEX idx_scao_attr (tenant_id, attribute_id),
  CONSTRAINT fk_scao_attribute
    FOREIGN KEY (attribute_id) REFERENCES store_category_attributes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product linkage to store category (legacy product_categories kept intact)
ALTER TABLE products
  ADD COLUMN store_category_id VARCHAR(26) NULL,
  ADD INDEX idx_products_store_category (tenant_id, store_category_id);

-- Store category based product attribute values
CREATE TABLE IF NOT EXISTS store_product_attribute_values (
  tenant_id        VARCHAR(26) NOT NULL,
  store_id         VARCHAR(26) NOT NULL,
  product_id       VARCHAR(26) NOT NULL,
  attribute_id     VARCHAR(26) NOT NULL,
  value_text       TEXT NULL,
  value_number     DECIMAL(14,4) NULL,
  value_bool       TINYINT(1) NULL,
  value_color      VARCHAR(32) NULL,
  value_date       DATE NULL,
  value_json       JSON NULL, -- used for multi_select
  option_id        VARCHAR(26) NULL, -- single select
  created_at       DATETIME NOT NULL,
  updated_at       DATETIME NOT NULL,
  PRIMARY KEY (tenant_id, store_id, product_id, attribute_id),
  INDEX idx_spav_product (tenant_id, store_id, product_id),
  INDEX idx_spav_attribute (tenant_id, store_id, attribute_id),
  CONSTRAINT fk_spav_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_spav_attribute
    FOREIGN KEY (attribute_id) REFERENCES store_category_attributes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_spav_option
    FOREIGN KEY (option_id) REFERENCES store_category_attribute_options(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inventory event ledger
CREATE TABLE IF NOT EXISTS inventory_logs (
  id               VARCHAR(26) PRIMARY KEY,
  tenant_id        VARCHAR(26) NOT NULL,
  store_id         VARCHAR(26) NOT NULL,
  product_id       VARCHAR(26) NOT NULL,
  variant_id       VARCHAR(26) NULL,
  change_type      ENUM('restock','order','manual_adjustment') NOT NULL,
  quantity_before  INT NOT NULL,
  quantity_after   INT NOT NULL,
  delta_quantity   INT NOT NULL,
  changed_by       VARCHAR(255) NULL,
  reason           VARCHAR(255) NULL,
  order_id         VARCHAR(26) NULL,
  created_at       DATETIME NOT NULL,
  INDEX idx_inventory_logs_store (tenant_id, store_id, created_at),
  INDEX idx_inventory_logs_product (tenant_id, store_id, product_id, created_at),
  INDEX idx_inventory_logs_variant (tenant_id, variant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MySQL order source of truth for transaction-safe stock updates
CREATE TABLE IF NOT EXISTS commerce_orders (
  id                VARCHAR(26) PRIMARY KEY,
  tenant_id         VARCHAR(26) NOT NULL,
  site_id           VARCHAR(26) NOT NULL,
  store_id          VARCHAR(26) NOT NULL,
  order_number      VARCHAR(64) NOT NULL,
  status            ENUM('new','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'new',
  subtotal_cents    INT NOT NULL DEFAULT 0,
  discount_cents    INT NOT NULL DEFAULT 0,
  total_cents       INT NOT NULL DEFAULT 0,
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  customer_json     JSON NULL,
  shipping_json     JSON NULL,
  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL,
  UNIQUE KEY uq_commerce_orders_no (tenant_id, site_id, order_number),
  INDEX idx_commerce_orders_site (tenant_id, site_id, created_at),
  INDEX idx_commerce_orders_store (tenant_id, store_id, created_at),
  INDEX idx_commerce_orders_status (tenant_id, site_id, status),
  CONSTRAINT fk_commerce_orders_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commerce_order_items (
  id                VARCHAR(26) PRIMARY KEY,
  tenant_id         VARCHAR(26) NOT NULL,
  order_id          VARCHAR(26) NOT NULL,
  product_id        VARCHAR(26) NOT NULL,
  variant_id        VARCHAR(26) NULL,
  title             VARCHAR(255) NOT NULL,
  sku               VARCHAR(64) NULL,
  price_cents       INT NOT NULL,
  quantity          INT NOT NULL,
  line_total_cents  INT NOT NULL,
  created_at        DATETIME NOT NULL,
  INDEX idx_commerce_order_items_order (tenant_id, order_id),
  INDEX idx_commerce_order_items_product (tenant_id, product_id),
  CONSTRAINT fk_commerce_order_items_order
    FOREIGN KEY (order_id) REFERENCES commerce_orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_commerce_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
