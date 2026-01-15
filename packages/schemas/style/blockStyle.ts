import { z } from "zod";
import { BaseStyleSchema } from "./baseStyle";

const PartialBase = BaseStyleSchema.partial();

export const BlockStyleSchema = z.object({
  presetId: z.string().min(1).optional(),
  overrides: PartialBase.optional(),

  responsive: z
    .object({
      tablet: PartialBase.optional(),
      mobile: PartialBase.optional(),
    })
    .optional(),
});
