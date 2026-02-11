USE saas_builder;

ALTER TABLE product_images
  DROP FOREIGN KEY fk_images_variant,
  DROP INDEX idx_images_variant,
  DROP COLUMN variant_id;

