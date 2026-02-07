import { z } from "zod";

export const HeaderV1Schema = z.object({
  menuId: z.string().min(1),
  layout: z
    .enum(["three-col", "two-col", "two-col-nav-cta"])
    .optional()
    .default("three-col"),
  ctaText: z.string().min(1).max(50).optional(),
  ctaHref: z.string().min(1).optional(),
  ctaSecondaryText: z.string().min(1).max(50).optional(),
  ctaSecondaryHref: z.string().min(1).optional(),
  logoAssetId: z.string().min(1).optional(),
  logoUrl: z.string().url().optional(),
  logoAlt: z.string().max(160).optional(),
  contentWidth: z.string().min(1).max(50).optional(),
});
