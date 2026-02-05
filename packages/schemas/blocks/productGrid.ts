import { z } from "zod";

export const ProductGridV1Schema = z.object({
  title: z.string().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(24).default(8),
  contentWidth: z.string().optional(),
  detailPathPrefix: z.string().optional(),
});
