import { z } from "zod";
import { BaseStyleSchema } from "./baseStyle";

export const BlockStyleSchema = z.object({
  presetId: z.string().min(1).optional(),
  overrides: BaseStyleSchema.partial().optional(), // allow partial overrides (only what user changes)
});
