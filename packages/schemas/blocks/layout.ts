import { z } from "zod";
import { PaddingSchema, MarginSchema } from "../style/baseStyle";

const SizeSchema = z.union([z.string(), z.number()]);

export const LayoutStyleSchema = z.object({
  width: SizeSchema.optional(),
  maxWidth: SizeSchema.optional(),
  minWidth: SizeSchema.optional(),
  height: SizeSchema.optional(),
  maxHeight: SizeSchema.optional(),
  minHeight: SizeSchema.optional(),

  padding: PaddingSchema.optional(),
  margin: MarginSchema.optional(),

  textAlign: z.enum(["left", "center", "right"]).optional(),
  display: z.enum(["block", "flex", "grid"]).optional(),
  flexDirection: z.enum(["row", "column"]).optional(),
  flexWrap: z.enum(["nowrap", "wrap"]).optional(),
  alignSelf: z.enum(["start", "center", "end", "stretch"]).optional(),
  justifySelf: z.enum(["start", "center", "end", "stretch"]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional(),
  gridColumns: z.coerce.number().int().min(1).max(12).optional(),
  gridRows: z.coerce.number().int().min(1).max(12).optional(),

  gap: SizeSchema.optional(),

  bgColor: z.string().optional(),
  bg: z
    .object({
      type: z.enum(["none", "solid", "gradient", "image", "video"]).optional(),
      color: z.string().optional(),
      gradient: z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
          angle: z.coerce.number().optional(),
        })
        .optional(),
      imageUrl: z.string().optional(),
      imageAssetId: z.string().optional(),
      imageSize: z.enum(["cover", "contain", "auto"]).optional(),
      imagePosition: z.string().optional(),
      imageRepeat: z.enum(["no-repeat", "repeat", "repeat-x", "repeat-y"]).optional(),
      overlayColor: z.string().optional(),
      overlayOpacity: z.coerce.number().min(0).max(1).optional(),
      videoUrl: z.string().optional(),
      videoPoster: z.string().optional(),
      videoAutoplay: z.coerce.boolean().optional(),
      videoMuted: z.coerce.boolean().optional(),
      videoLoop: z.coerce.boolean().optional(),
      videoControls: z.coerce.boolean().optional(),
    })
    .optional(),
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

const LayoutAtomicBaseSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.any()).default({}),
  style: LayoutStyleSchema.optional(),
});

export const LayoutColSchema = z.object({
  id: z.string().min(1),
  style: LayoutStyleSchema.optional(),
  blocks: z.array(LayoutAtomicBaseSchema).default([]),
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

export const LayoutGroupPropsSchema = z.object({
  style: LayoutStyleSchema.optional(),
  rows: z.array(LayoutRowSchema).default([]),
});

export const LayoutAtomicBlockSchema = LayoutAtomicBaseSchema.extend({
  props: z.record(z.string(), z.any()).default({}),
});
