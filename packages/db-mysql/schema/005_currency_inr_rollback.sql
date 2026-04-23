USE saas_builder;

-- Rollback default currency to USD.
ALTER TABLE stores
  MODIFY currency CHAR(3) NOT NULL DEFAULT 'USD';

ALTER TABLE commerce_orders
  MODIFY currency CHAR(3) NOT NULL DEFAULT 'USD';
