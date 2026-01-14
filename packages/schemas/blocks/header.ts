import { z } from "zod";

export const HeaderV1Schema = z.object({
  menuId: z.string().min(1),
  ctaText: z.string().min(1).max(50).optional(),
  ctaHref: z.string().min(1).optional(),
});
