USE saas_builder;

-- Rollback for 002_commerce_v2.sql
-- Keep order: drop dependent tables first.

DROP TABLE IF EXISTS commerce_order_items;
DROP TABLE IF EXISTS commerce_orders;
DROP TABLE IF EXISTS inventory_logs;
DROP TABLE IF EXISTS store_product_attribute_values;
DROP TABLE IF EXISTS store_category_attribute_options;
DROP TABLE IF EXISTS store_category_attributes;
DROP TABLE IF EXISTS store_categories;
DROP TABLE IF EXISTS brand_profiles;
DROP TABLE IF EXISTS store_profiles;

-- Revert additive column in products
ALTER TABLE products
  DROP INDEX idx_products_store_category,
  DROP COLUMN store_category_id;
