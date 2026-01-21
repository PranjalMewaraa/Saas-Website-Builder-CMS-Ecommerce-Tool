import { z } from "zod";

export const HeroSchema = z
  .object({
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
        type: z.enum(["none", "image", "video"]).optional(),

        imageAssetId: z.string().optional(),
        imageUrl: z.string().optional(),
        imageAlt: z.string().optional(),

        videoAssetId: z.string().optional(),
        videoUrl: z.string().optional(),
        posterAssetId: z.string().optional(),
        posterUrl: z.string().optional(),

        overlayColor: z.string().optional(),
        overlayOpacity: z.number().min(0).max(1).optional(),

        videoAutoplay: z.boolean().optional(),
        videoMuted: z.boolean().optional(),
        videoLoop: z.boolean().optional(),
        videoControls: z.boolean().optional(),
        videoPreload: z.enum(["none", "metadata", "auto"]).optional(),
      })
      .optional(),
  })
  .passthrough();

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
  minHeight: 320,
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
