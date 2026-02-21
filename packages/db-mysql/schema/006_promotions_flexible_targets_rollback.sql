USE saas_builder;

ALTER TABLE store_promotion_targets
  MODIFY COLUMN target_type
    ENUM('store','brand','category','product') NOT NULL;

ALTER TABLE store_promotions
  DROP COLUMN target_apply_mode,
  DROP COLUMN target_match_mode;
