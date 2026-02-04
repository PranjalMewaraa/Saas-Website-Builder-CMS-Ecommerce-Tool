import { z } from "zod";
import { PaddingSchema, MarginSchema } from "../style/baseStyle";

const SizeSchema = z.union([z.string(), z.number()]);

export const LayoutStyleSchema = z.object({
  width: SizeSchema.optional(),
  maxWidth: SizeSchema.optional(),
  height: SizeSchema.optional(),
  maxHeight: SizeSchema.optional(),

  padding: PaddingSchema.optional(),
  margin: MarginSchema.optional(),

  textAlign: z.enum(["left", "center", "right"]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional(),

  gap: SizeSchema.optional(),

  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: SizeSchema.optional(),
  radius: SizeSchema.optional(),
  shadow: z.enum(["none", "sm", "md", "lg"]).optional(),

  fontSize: SizeSchema.optional(),
  fontWeight: SizeSchema.optional(),
  lineHeight: SizeSchema.optional(),
  letterSpacing: SizeSchema.optional(),
  textTransform: z
    .enum(["none", "uppercase", "lowercase", "capitalize"])
    .optional(),
});

export const LayoutAtomicBlockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.any()).default({}),
  style: LayoutStyleSchema.optional(),
});

export const LayoutColSchema = z.object({
  id: z.string().min(1),
  style: LayoutStyleSchema.optional(),
  blocks: z.array(LayoutAtomicBlockSchema).default([]),
});

export const LayoutRowSchema = z.object({
  id: z.string().min(1),
  style: LayoutStyleSchema.optional(),
  layout: z
    .object({
      mode: z.enum(["preset", "manual"]).default("preset"),
      presetId: z.string().optional(),
      display: z.enum(["grid", "flex"]).optional(),
      columns: z.coerce.number().int().min(1).max(6).optional(),
      gap: SizeSchema.optional(),
      align: z.enum(["start", "center", "end", "stretch"]).optional(),
      justify: z
        .enum(["start", "center", "end", "between", "around", "evenly"])
        .optional(),
      wrap: z.coerce.boolean().optional(),
    })
    .optional(),
  cols: z.array(LayoutColSchema).default([]),
});

export const LayoutSectionPropsSchema = z.object({
  style: LayoutStyleSchema.optional(),
  rows: z.array(LayoutRowSchema).default([]),
});
