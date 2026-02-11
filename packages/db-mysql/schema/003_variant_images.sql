USE saas_builder;

ALTER TABLE product_images
  ADD COLUMN variant_id VARCHAR(26) NULL AFTER product_id,
  ADD INDEX idx_images_variant (tenant_id, variant_id),
  ADD CONSTRAINT fk_images_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    ON DELETE SET NULL;

