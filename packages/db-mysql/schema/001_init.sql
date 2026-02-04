-- 001_init.sql
-- Database: saas_builder
-- Engine: InnoDB, Charset: utf8mb4
-- IDs are VARCHAR(26) (ULID-style) or short IDs; you can swap to CHAR(36) UUID later.

CREATE DATABASE IF NOT EXISTS saas_builder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE saas_builder;

-- Stores (brand/distributor)
CREATE TABLE IF NOT EXISTS stores (
  id          VARCHAR(26) PRIMARY KEY,
  tenant_id   VARCHAR(26) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  store_type  ENUM('brand','distributor') NOT NULL,
  currency    CHAR(3) NOT NULL DEFAULT 'USD',
  timezone    VARCHAR(64) NOT NULL DEFAULT 'UTC',
  status      ENUM('active','suspended') NOT NULL DEFAULT 'active',
  industry    VARCHAR(64) NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,

  INDEX idx_stores_tenant (tenant_id),
  INDEX idx_stores_type (tenant_id, store_type),
  INDEX idx_stores_status (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id          VARCHAR(26) PRIMARY KEY,
  tenant_id   VARCHAR(26) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,

  UNIQUE KEY uq_brand_slug (tenant_id, slug),
  INDEX idx_brands_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(26) PRIMARY KEY,
  tenant_id   VARCHAR(26) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  parent_id   VARCHAR(26) NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,

  UNIQUE KEY uq_category_slug (tenant_id, slug),
  INDEX idx_categories_tenant (tenant_id),
  INDEX idx_categories_parent (tenant_id, parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id                  VARCHAR(26) PRIMARY KEY,
  tenant_id           VARCHAR(26) NOT NULL,
  brand_id            VARCHAR(26) NULL,
  title               VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) NOT NULL,
  description         MEDIUMTEXT NULL,
  status              ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
  base_price_cents    INT NOT NULL DEFAULT 0,
  compare_at_price_cents INT NULL,
  sku                 VARCHAR(64) NULL,
  custom_data         JSON NULL, -- Option A: custom fields MVP
  created_at          DATETIME NOT NULL,
  updated_at          DATETIME NOT NULL,

  UNIQUE KEY uq_product_slug (tenant_id, slug),
  INDEX idx_products_tenant (tenant_id),
  INDEX idx_products_brand (tenant_id, brand_id),
  INDEX idx_products_status (tenant_id, status),
  INDEX idx_products_sku (tenant_id, sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id                    VARCHAR(26) PRIMARY KEY,
  tenant_id             VARCHAR(26) NOT NULL,
  product_id            VARCHAR(26) NOT NULL,
  sku                   VARCHAR(64) NULL,
  price_cents           INT NOT NULL,
  compare_at_price_cents INT NULL,
  options_json          JSON NULL, -- {"color":"Black","size":"15-inch"}
  inventory_qty         INT NOT NULL DEFAULT 0,
  created_at            DATETIME NOT NULL,
  updated_at            DATETIME NOT NULL,

  INDEX idx_variants_product (tenant_id, product_id),
  INDEX idx_variants_sku (tenant_id, sku),
  CONSTRAINT fk_variants_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product images (URL to CDN/object storage; metadata is in Mongo assets_meta)
CREATE TABLE IF NOT EXISTS product_images (
  id          VARCHAR(26) PRIMARY KEY,
  tenant_id   VARCHAR(26) NOT NULL,
  product_id  VARCHAR(26) NOT NULL,
  url         VARCHAR(2048) NOT NULL,
  alt         VARCHAR(255) NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL,

  INDEX idx_images_product (tenant_id, product_id, sort_order),
  CONSTRAINT fk_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product-category mapping
CREATE TABLE IF NOT EXISTS product_categories (
  tenant_id   VARCHAR(26) NOT NULL,
  product_id  VARCHAR(26) NOT NULL,
  category_id VARCHAR(26) NOT NULL,
  created_at  DATETIME NOT NULL,

  PRIMARY KEY (tenant_id, product_id, category_id),
  INDEX idx_pc_category (tenant_id, category_id, product_id),
  CONSTRAINT fk_pc_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pc_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Distributor store: which brands are enabled in a store
CREATE TABLE IF NOT EXISTS store_brands (
  tenant_id   VARCHAR(26) NOT NULL,
  store_id    VARCHAR(26) NOT NULL,
  brand_id    VARCHAR(26) NOT NULL,
  status      ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  created_at  DATETIME NOT NULL,

  PRIMARY KEY (tenant_id, store_id, brand_id),
  INDEX idx_store_brands_brand (tenant_id, brand_id, store_id),
  CONSTRAINT fk_store_brands_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_store_brands_brand
    FOREIGN KEY (brand_id) REFERENCES brands(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Store-specific publishing + overrides
CREATE TABLE IF NOT EXISTS store_products (
  tenant_id    VARCHAR(26) NOT NULL,
  store_id     VARCHAR(26) NOT NULL,
  product_id   VARCHAR(26) NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  overrides    JSON NULL, -- {"title":"New","price_cents":12300,"badges":["Sale"]}
  created_at   DATETIME NOT NULL,
  updated_at   DATETIME NOT NULL,

  PRIMARY KEY (tenant_id, store_id, product_id),
  INDEX idx_store_products_pub (tenant_id, store_id, is_published, product_id),
  CONSTRAINT fk_store_products_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_store_products_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product attributes
CREATE TABLE IF NOT EXISTS product_attributes (
  id            VARCHAR(26) PRIMARY KEY,
  tenant_id     VARCHAR(26) NOT NULL,
  code          VARCHAR(64) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  type          VARCHAR(32) NOT NULL, -- text|number|boolean|select|multiselect|date
  is_filterable TINYINT(1) NOT NULL DEFAULT 0,
  is_variant    TINYINT(1) NOT NULL DEFAULT 0,
  is_required   TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL,

  UNIQUE KEY uq_attr_code (tenant_id, code),
  INDEX idx_attr_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_attribute_options (
  id           VARCHAR(26) PRIMARY KEY,
  attribute_id VARCHAR(26) NOT NULL,
  value        VARCHAR(255) NOT NULL,

  INDEX idx_attr_opt (attribute_id),
  CONSTRAINT fk_attr_opt_attr
    FOREIGN KEY (attribute_id) REFERENCES product_attributes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_attribute_values (
  tenant_id     VARCHAR(26) NOT NULL,
  product_id    VARCHAR(26) NOT NULL,
  attribute_id  VARCHAR(26) NOT NULL,
  value_text    TEXT NULL,
  value_number  DECIMAL(12,2) NULL,
  value_bool    TINYINT(1) NULL,
  value_date    DATE NULL,
  option_id     VARCHAR(26) NULL,

  PRIMARY KEY (tenant_id, product_id, attribute_id),
  INDEX idx_pav_attr (tenant_id, attribute_id),
  CONSTRAINT fk_pav_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pav_attr
    FOREIGN KEY (attribute_id) REFERENCES product_attributes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pav_option
    FOREIGN KEY (option_id) REFERENCES product_attribute_options(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS variant_attribute_values (
  tenant_id     VARCHAR(26) NOT NULL,
  variant_id    VARCHAR(26) NOT NULL,
  attribute_id  VARCHAR(26) NOT NULL,
  option_id     VARCHAR(26) NOT NULL,

  PRIMARY KEY (tenant_id, variant_id, attribute_id),
  INDEX idx_vav_attr (tenant_id, attribute_id),
  CONSTRAINT fk_vav_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_vav_attr
    FOREIGN KEY (attribute_id) REFERENCES product_attributes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_vav_option
    FOREIGN KEY (option_id) REFERENCES product_attribute_options(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Future-proof (optional now): orders + adjustments for promotions later
CREATE TABLE IF NOT EXISTS orders (
  id                VARCHAR(26) PRIMARY KEY,
  tenant_id         VARCHAR(26) NOT NULL,
  store_id          VARCHAR(26) NOT NULL,
  customer_id       VARCHAR(26) NULL,
  status            ENUM('pending','paid','fulfilled','cancelled','refunded') NOT NULL DEFAULT 'pending',

  subtotal_cents      INT NOT NULL DEFAULT 0,
  shipping_cents      INT NOT NULL DEFAULT 0,
  tax_cents           INT NOT NULL DEFAULT 0,
  adjustments_cents   INT NOT NULL DEFAULT 0,
  total_cents         INT NOT NULL DEFAULT 0,
  currency            CHAR(3) NOT NULL,

  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL,

  INDEX idx_orders_store (tenant_id, store_id, created_at),
  INDEX idx_orders_status (tenant_id, store_id, status),
  CONSTRAINT fk_orders_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_adjustments (
  id           VARCHAR(26) PRIMARY KEY,
  tenant_id    VARCHAR(26) NOT NULL,
  order_id     VARCHAR(26) NOT NULL,
  type         VARCHAR(32) NOT NULL, -- promotion|manual|credit
  label        VARCHAR(255) NOT NULL,
  amount_cents INT NOT NULL,         -- negative for discounts
  meta         JSON NULL,
  created_at   DATETIME NOT NULL,

  INDEX idx_adj_order (tenant_id, order_id),
  CONSTRAINT fk_adj_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
