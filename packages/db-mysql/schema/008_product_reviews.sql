-- Storefront product reviews + star ratings.
-- One review per (customer_id, product_id) on a given site; status defaults to
-- "published" but can be moderated later. is_verified is set when the
-- customer has at least one prior order containing this product.

CREATE TABLE IF NOT EXISTS product_reviews (
  id              VARCHAR(64) PRIMARY KEY,
  tenant_id       VARCHAR(64) NOT NULL,
  site_id         VARCHAR(64) NOT NULL,
  product_id      VARCHAR(64) NOT NULL,
  customer_id     VARCHAR(64) NOT NULL,
  customer_name   VARCHAR(255) NULL,
  rating          TINYINT UNSIGNED NOT NULL,
  title           VARCHAR(255) NULL,
  body            TEXT NULL,
  is_verified     TINYINT(1) NOT NULL DEFAULT 0,
  status          ENUM('pending','published','rejected') NOT NULL DEFAULT 'published',
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  UNIQUE KEY uq_product_reviews_one_per_customer
    (tenant_id, site_id, product_id, customer_id),
  INDEX idx_product_reviews_product
    (tenant_id, site_id, product_id, status, created_at),
  INDEX idx_product_reviews_customer
    (tenant_id, customer_id, created_at),
  CONSTRAINT chk_product_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
