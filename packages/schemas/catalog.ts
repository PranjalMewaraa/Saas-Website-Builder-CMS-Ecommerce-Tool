import { z } from "zod";

export const BrandCreateSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(1).max(255).optional(),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(1).max(255).optional(),
  parent_id: z.string().optional().nullable(),
});

export const ProductCreateSchema = z.object({
  title: z.string().min(2).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  base_price_cents: z.coerce.number().int().min(0),
  sku: z.string().optional().nullable(),
  store_id: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
});

export const StoreProductPublishSchema = z.object({
  store_id: z.string().min(1),
  product_id: z.string().min(1),
  is_published: z.coerce.boolean(),
});
