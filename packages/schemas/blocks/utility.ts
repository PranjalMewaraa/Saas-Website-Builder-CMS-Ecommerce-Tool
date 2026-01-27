import { z } from "zod";

export const SpacerSchema = z.object({
  height: z.coerce.number().min(0).max(600).default(40),
});

export const DividerSchema = z.object({
  thickness: z.coerce.number().min(1).max(10).default(1),
  color: z.string().default("#e5e7eb"),
  marginY: z.coerce.number().min(0).max(200).default(24),
});

export const RichTextSchema = z.object({
  html: z
    .string()
    .default("<h2>Your heading</h2><p>Your paragraph text here.</p>"),
});
