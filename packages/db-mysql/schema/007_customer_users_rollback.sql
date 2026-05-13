ALTER TABLE commerce_orders
  DROP INDEX idx_commerce_orders_customer,
  DROP COLUMN customer_id;

DROP TABLE IF EXISTS customer_users;
