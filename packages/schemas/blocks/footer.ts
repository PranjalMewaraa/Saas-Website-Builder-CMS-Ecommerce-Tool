import { z } from "zod";

export const FooterV1Schema = z.object({
  menuId: z.string().min(1),

  // NEW
  logoAssetId: z.string().min(1).optional(),
  logoUrl: z.string().url().optional(),
  logoAlt: z.string().max(160).optional(),
});
