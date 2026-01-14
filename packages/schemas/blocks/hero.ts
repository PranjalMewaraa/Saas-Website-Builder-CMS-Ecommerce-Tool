import { z } from "zod";

export const HeroV1Schema = z.object({
  headline: z.string().min(1).max(120),
  subhead: z.string().max(240).optional(),
  ctaText: z.string().max(40).optional(),
  ctaHref: z.string().min(1).optional(),
});
