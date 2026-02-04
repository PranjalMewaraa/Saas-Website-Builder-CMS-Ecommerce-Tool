import { z } from "zod";

export const FooterV1Schema = z.object({
  menuId: z.string().min(1),
  contentWidth: z.string().optional(),
  // NEW
  logoAssetId: z.string().min(1).optional(),
  logoUrl: z.string().url().optional(),
  logoAlt: z.string().max(160).optional(),
  layout: z.enum(["simple", "multi-column"]).optional(),
  description: z.string().max(240).optional(),
  badgeText: z.string().max(80).optional(),
  showSocials: z.boolean().optional(),
  socialLinks: z.array(z.string().url()).optional(),
});
