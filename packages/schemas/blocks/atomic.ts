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

export const AtomicIconSchema = z.object({
  icon: z.string().optional(),
  size: SizeSchema.optional(),
  color: z.string().optional(),
});

export const AtomicDividerSchema = z.object({
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  thickness: SizeSchema.optional(),
  color: z.string().optional(),
  length: SizeSchema.optional(),
});

export const AtomicSpacerSchema = z.object({
  axis: z.enum(["vertical", "horizontal"]).default("vertical"),
  size: SizeSchema.optional(),
});

export const AtomicBadgeSchema = z.object({
  text: z.string().default("Badge"),
});

export const AtomicListSchema = z.object({
  items: z.array(z.string()).default(["List item"]),
  ordered: z.coerce.boolean().optional(),
  icon: z.string().optional(),
});

export const AtomicCardSchema = z.object({
  title: z.string().default("Card title"),
  body: z.string().default("Card description goes here."),
  imageUrl: z.string().url().optional(),
  buttonText: z.string().optional(),
  buttonHref: z.string().optional(),
});

export const AtomicAccordionSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    )
    .default([{ title: "Question", content: "Answer" }]),
});

export const AtomicMenuSchema = z.object({
  menuId: z.string().optional(),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  showDivider: z.coerce.boolean().optional(),
  itemGap: SizeSchema.optional(),
});

export const AtomicCountdownSchema = z.object({
  targetDate: z.string().optional(),
  label: z.string().optional(),
  showSeconds: z.coerce.boolean().optional(),
});

export const AtomicEmbedSchema = z.object({
  code: z.string().optional(),
  src: z.string().optional(),
  title: z.string().optional(),
});
