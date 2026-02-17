USE saas_builder;

-- Make INR the platform default currency for new records.
ALTER TABLE stores
  MODIFY currency CHAR(3) NOT NULL DEFAULT 'INR';

ALTER TABLE commerce_orders
  MODIFY currency CHAR(3) NOT NULL DEFAULT 'INR';

-- Normalize legacy USD rows to INR for consistent rendering across apps.
UPDATE stores
SET currency = 'INR'
WHERE currency IS NULL OR currency = '' OR currency = 'USD';

UPDATE orders
SET currency = 'INR'
WHERE currency IS NULL OR currency = '' OR currency = 'USD';

UPDATE commerce_orders
SET currency = 'INR'
WHERE currency IS NULL OR currency = '' OR currency = 'USD';
