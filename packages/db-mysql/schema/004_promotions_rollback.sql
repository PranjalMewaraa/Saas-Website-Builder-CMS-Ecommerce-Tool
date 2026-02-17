USE saas_builder;

ALTER TABLE commerce_orders
  DROP INDEX idx_commerce_orders_promo,
  DROP COLUMN promotion_name,
  DROP COLUMN promotion_code,
  DROP COLUMN promotion_id;

DROP TABLE IF EXISTS store_promotion_usage;
DROP TABLE IF EXISTS store_promotion_targets;
DROP TABLE IF EXISTS store_promotions;
