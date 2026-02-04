import { z } from "zod";

const SizeSchema = z.union([z.string(), z.number()]);

export const AtomicTextSchema = z.object({
  tag: z.enum(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"]).default("p"),
  text: z.string().default("Text"),
});

export const AtomicImageSchema = z.object({
  assetId: z.string().optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  width: SizeSchema.optional(),
  height: SizeSchema.optional(),
  objectFit: z
    .enum(["cover", "contain", "fill", "none", "scale-down"])
    .optional(),
});

export const AtomicVideoSchema = z.object({
  assetId: z.string().optional(),
  src: z.string().optional(),
  poster: z.string().optional(),
  autoplay: z.coerce.boolean().optional(),
  muted: z.coerce.boolean().optional(),
  loop: z.coerce.boolean().optional(),
  controls: z.coerce.boolean().optional(),
});

export const AtomicButtonSchema = z.object({
  label: z.string().default("Button"),
  href: z.string().default("#"),
  target: z.enum(["_self", "_blank"]).optional(),
});

