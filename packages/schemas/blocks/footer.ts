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
  badgeStyle: z
    .enum(["pill", "outline", "soft", "glass", "text", "tag"])
    .optional(),
  showSocials: z.boolean().optional(),
  socialLinks: z.array(z.string().url()).optional(),
  panelBg: z
    .object({
      type: z.enum(["none", "solid", "gradient"]).optional(),
      color: z.string().optional(),
      gradient: z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
          angle: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  panelBorderColor: z.string().optional(),
  panelBorderWidth: z.number().optional(),
  panelRadius: z.number().optional(),
  panelTextColor: z.string().optional(),
});
