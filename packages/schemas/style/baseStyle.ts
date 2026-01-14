import { z } from "zod";

const Px = z.coerce.number().int().min(0).max(240);

export const PaddingSchema = z.object({
  top: Px.default(0),
  right: Px.default(0),
  bottom: Px.default(0),
  left: Px.default(0),
});

export const MarginSchema = z.object({
  top: Px.default(0),
  right: Px.default(0),
  bottom: Px.default(0),
  left: Px.default(0),
});

export const BgSchema = z.object({
  type: z.enum(["none", "solid", "gradient", "image"]).default("none"),
  color: z.string().optional(), // hex/rgb
  gradient: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
      direction: z.enum(["to-r", "to-l", "to-b", "to-t"]).optional(),
    })
    .optional(),
  imageUrl: z.string().url().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.coerce.number().min(0).max(1).optional(),
});

export const BorderSchema = z.object({
  enabled: z.coerce.boolean().default(false),
  color: z.string().optional(),
  width: z.coerce.number().int().min(0).max(12).optional(),
});

export const AlignSchema = z.object({
  text: z.enum(["left", "center", "right"]).default("left"),
  items: z.enum(["start", "center", "end", "stretch"]).default("stretch"),
  justify: z.enum(["start", "center", "end", "between"]).default("start"),
});

export const BaseStyleSchema = z.object({
  id: z.string().optional(), // optional style preset id later
  container: z.enum(["full", "boxed"]).default("boxed"),
  maxWidth: z.enum(["sm", "md", "lg", "xl", "2xl"]).default("xl"),
  padding: PaddingSchema.default({ top: 0, right: 0, bottom: 0, left: 0 }),
  margin: MarginSchema.default({ top: 0, right: 0, bottom: 0, left: 0 }),
  bg: BgSchema.default({ type: "none" }),
  textColor: z.string().optional(),
  radius: z.coerce.number().int().min(0).max(40).default(0),
  shadow: z.enum(["none", "sm", "md", "lg"]).default("none"),
  border: BorderSchema.default({ enabled: false }),
  align: AlignSchema.default({
    text: "left",
    items: "stretch",
    justify: "start",
  }),
});
