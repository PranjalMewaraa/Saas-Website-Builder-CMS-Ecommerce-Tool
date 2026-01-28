import { z } from "zod";
import { BaseStyleSchema } from "../style/baseStyle";
import { BlockStyleSchema } from "../style/blockStyle";

export const BlockInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.any()).default({}),
  contentWidth: z.string().optional(),
  style: z
    .object({
      presetId: z.string().optional(),
      overrides: BaseStyleSchema.optional(),
    })
    .optional(),
});

export const PageLayoutSchema = z.object({
  version: z.number().int().min(1),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().max(60).optional(),
      style: BlockStyleSchema.optional(),
      blocks: z.array(BlockInstanceSchema),
    }),
  ),
});

export type BlockInstance = z.infer<typeof BlockInstanceSchema>;
export type PageLayout = z.infer<typeof PageLayoutSchema>;
