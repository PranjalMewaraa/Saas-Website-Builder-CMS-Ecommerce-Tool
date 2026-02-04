import { z } from "zod";

const Px = z.coerce.number().int().min(0).max(240);

export const PaddingSchema = z
  .object({
    top: Px.optional(),
    right: Px.optional(),
    bottom: Px.optional(),
    left: Px.optional(),
  })
  .partial();

export const MarginSchema = z
  .object({
    top: Px.optional(),
    right: Px.optional(),
    bottom: Px.optional(),
    left: Px.optional(),
  })
  .partial();

export const BgSchema = z
  .object({
    type: z.enum(["none", "solid", "gradient", "image"]).optional(),
    color: z.string().optional(),
    gradient: z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
        direction: z.enum(["to-r", "to-l", "to-b", "to-t"]).optional(),
      })
      .optional(),
    imageAssetId: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
    overlayColor: z.string().optional(),
    overlayOpacity: z.coerce.number().min(0).max(1).optional(),
  })
  .partial();

export const BorderSchema = z
  .object({
    enabled: z.coerce.boolean().optional(),
    color: z.string().optional(),
    width: z.coerce.number().int().min(0).max(12).optional(),
  })
  .partial();

export const AlignSchema = z
  .object({
    text: z.enum(["left", "center", "right"]).optional(),
    items: z.enum(["start", "center", "end", "stretch"]).optional(),
    justify: z.enum(["start", "center", "end", "between"]).optional(),
  })
  .partial();

export const BaseStyleSchema = z.object({
  id: z.string().optional(),
  display: z.enum(["block", "flex", "grid"]).optional(),
  container: z.enum(["full", "boxed"]).optional(),
  maxWidth: z.enum(["sm", "md", "lg", "xl", "2xl"]).optional(),
  gap: z.coerce.number().int().min(0).max(120).optional(),
  padding: PaddingSchema.optional(),
  margin: MarginSchema.optional(),
  bg: BgSchema.optional(),
  textColor: z.string().optional(),
  fontSize: z.coerce.number().int().min(8).max(120).optional(),
  fontWeight: z.coerce.number().int().min(100).max(900).optional(),
  lineHeight: z.coerce.number().int().min(8).max(200).optional(),
  letterSpacing: z.coerce.number().int().min(-10).max(40).optional(),
  textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
  radius: z.coerce.number().int().min(0).max(40).optional(),
  shadow: z.enum(["none", "sm", "md", "lg"]).optional(),
  border: BorderSchema.optional(),
  align: AlignSchema.optional(),
});
