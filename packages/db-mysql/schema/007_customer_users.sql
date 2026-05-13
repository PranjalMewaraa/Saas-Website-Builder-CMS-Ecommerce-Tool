-- Storefront customer accounts (separate from admin users, which live in MongoDB)
-- Scoped per (tenant_id, site_id) so the same email can be a different account on a different site.

CREATE TABLE IF NOT EXISTS customer_users (
  id                VARCHAR(64) PRIMARY KEY,
  tenant_id         VARCHAR(64) NOT NULL,
  site_id           VARCHAR(64) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  name              VARCHAR(255) NULL,
  phone             VARCHAR(64) NULL,
  email_verified_at DATETIME NULL,
  last_login_at     DATETIME NULL,
  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL,
  UNIQUE KEY uq_customer_users_site_email (tenant_id, site_id, email),
  INDEX idx_customer_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tie commerce_orders to a customer when the buyer is signed in.
-- NULL means guest checkout, which remains supported.
ALTER TABLE commerce_orders
  ADD COLUMN customer_id VARCHAR(64) NULL AFTER store_id,
  ADD INDEX idx_commerce_orders_customer (tenant_id, customer_id, created_at);
