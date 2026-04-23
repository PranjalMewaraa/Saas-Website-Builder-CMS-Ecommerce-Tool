USE saas_builder;

-- Add targeting behavior controls (backward-compatible defaults).
ALTER TABLE store_promotions
  ADD COLUMN target_match_mode ENUM('any','all') NOT NULL DEFAULT 'any' AFTER priority,
  ADD COLUMN target_apply_mode ENUM('eligible','order') NOT NULL DEFAULT 'eligible' AFTER target_match_mode;

-- Extend promotion target types to support exclusion rules.
ALTER TABLE store_promotion_targets
  MODIFY COLUMN target_type
    ENUM(
      'store',
      'brand',
      'category',
      'product',
      'exclude_brand',
      'exclude_category',
      'exclude_product'
    ) NOT NULL;
