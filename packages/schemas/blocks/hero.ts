import { z } from "zod";

export const HeroSchema = z.object({
  variant: z.enum(["basic", "image", "video"]).default("basic"),

  headline: z.string().min(1).default("Headline"),
  subhead: z.string().optional().default("Subhead"),

  ctaText: z.string().optional().default("Browse"),
  ctaHref: z.string().optional().default("/products"),
  secondaryCtaText: z.string().optional().default(""),
  secondaryCtaHref: z.string().optional().default(""),

  align: z.enum(["left", "center", "right"]).default("left"),
  contentWidth: z.enum(["sm", "md", "lg", "xl"]).default("xl"),
  minHeight: z.number().int().min(240).max(980).default(520),

  bg: z
    .object({
      type: z.enum(["none", "image", "video"]).default("none"),

      // background image
      imageAssetId: z.string().optional().default(""),
      imageUrl: z.string().optional().default(""),
      imageAlt: z.string().optional().default(""),

      // background video
      videoAssetId: z.string().optional().default(""),
      videoUrl: z.string().optional().default(""),
      posterAssetId: z.string().optional().default(""),
      posterUrl: z.string().optional().default(""),

      // overlay
      overlayColor: z.string().optional().default("#000000"),
      overlayOpacity: z.number().min(0).max(1).default(0.45),

      // video behavior
      videoAutoplay: z.boolean().default(true),
      videoMuted: z.boolean().default(true),
      videoLoop: z.boolean().default(true),
      videoControls: z.boolean().default(false),
      videoPreload: z.enum(["none", "metadata", "auto"]).default("metadata"),
    })
    .default({ type: "none" }),
});

export type HeroProps = z.infer<typeof HeroSchema>;

export const HeroDefaults: HeroProps = {
  variant: "basic",
  headline: "Headline",
  subhead: "Subhead",
  ctaText: "Browse",
  ctaHref: "/products",
  secondaryCtaText: "",
  secondaryCtaHref: "",
  align: "left",
  contentWidth: "xl",
  minHeight: 520,
  bg: {
    type: "none",
    imageAssetId: "",
    imageUrl: "",
    imageAlt: "",
    videoAssetId: "",
    videoUrl: "",
    posterAssetId: "",
    posterUrl: "",
    overlayColor: "#000000",
    overlayOpacity: 0.45,
    videoAutoplay: true,
    videoMuted: true,
    videoLoop: true,
    videoControls: false,
    videoPreload: "metadata",
  },
};
