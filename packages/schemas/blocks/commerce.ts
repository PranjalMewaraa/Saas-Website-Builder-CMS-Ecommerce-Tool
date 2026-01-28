import { z } from "zod";

export const ProductHighlightV1Schema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  price: z.number().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  contentWidth: z.string().optional(),
});

export const PricingTableV1Schema = z.object({
  title: z.string().optional(),
  plans: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      ctaText: z.string().optional(),
      ctaHref: z.string().optional(),
    }),
  ),
  contentWidth: z.string().optional(),
});
