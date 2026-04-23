USE saas_builder;

CREATE TABLE IF NOT EXISTS store_promotions (
  id                        VARCHAR(26) PRIMARY KEY,
  tenant_id                 VARCHAR(26) NOT NULL,
  site_id                   VARCHAR(26) NOT NULL,
  store_id                  VARCHAR(26) NOT NULL,
  name                      VARCHAR(255) NOT NULL,
  code                      VARCHAR(64) NULL,
  is_active                 TINYINT(1) NOT NULL DEFAULT 1,
  is_secret                 TINYINT(1) NOT NULL DEFAULT 0,
  starts_at                 DATETIME NULL,
  ends_at                   DATETIME NULL,
  discount_type             ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  discount_scope            ENUM('order','items') NOT NULL DEFAULT 'order',
  discount_value            DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_order_cents           INT NOT NULL DEFAULT 0,
  max_discount_cents        INT NULL,
  usage_limit_total         INT NULL,
  usage_limit_per_customer  INT NULL,
  first_n_customers         INT NULL,
  stackable                 TINYINT(1) NOT NULL DEFAULT 0,
  priority                  INT NOT NULL DEFAULT 0,
  created_at                DATETIME NOT NULL,
  updated_at                DATETIME NOT NULL,
  archived_at               DATETIME NULL,
  UNIQUE KEY uq_store_promo_code (tenant_id, store_id, code),
  INDEX idx_store_promos_lookup (tenant_id, store_id, is_active, archived_at),
  INDEX idx_store_promos_dates (tenant_id, store_id, starts_at, ends_at),
  CONSTRAINT fk_store_promotions_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS store_promotion_targets (
  id             VARCHAR(26) PRIMARY KEY,
  tenant_id      VARCHAR(26) NOT NULL,
  promotion_id   VARCHAR(26) NOT NULL,
  target_type    ENUM('store','brand','category','product') NOT NULL,
  target_id      VARCHAR(26) NULL,
  created_at     DATETIME NOT NULL,
  INDEX idx_store_promo_targets_lookup (tenant_id, promotion_id, target_type),
  INDEX idx_store_promo_targets_target (tenant_id, target_type, target_id),
  CONSTRAINT fk_store_promo_targets_promotion
    FOREIGN KEY (promotion_id) REFERENCES store_promotions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS store_promotion_usage (
  id                 VARCHAR(26) PRIMARY KEY,
  tenant_id          VARCHAR(26) NOT NULL,
  site_id            VARCHAR(26) NOT NULL,
  store_id           VARCHAR(26) NOT NULL,
  promotion_id       VARCHAR(26) NOT NULL,
  promotion_code     VARCHAR(64) NULL,
  order_id           VARCHAR(26) NULL,
  customer_key       VARCHAR(255) NULL,
  discount_cents     INT NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL,
  INDEX idx_store_promo_usage_promo (tenant_id, store_id, promotion_id, created_at),
  INDEX idx_store_promo_usage_customer (tenant_id, store_id, promotion_id, customer_key, created_at),
  CONSTRAINT fk_store_promo_usage_promotion
    FOREIGN KEY (promotion_id) REFERENCES store_promotions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE commerce_orders
  ADD COLUMN promotion_id VARCHAR(26) NULL,
  ADD COLUMN promotion_code VARCHAR(64) NULL,
  ADD COLUMN promotion_name VARCHAR(255) NULL,
  ADD INDEX idx_commerce_orders_promo (tenant_id, store_id, promotion_id);
