import { z } from "zod";

export const HeroSchema = z
  .object({
    heroPreset: z
      .enum(["Basic", "Advanced", "Split", "Centered", "Promo"])
      .default("Basic"),
    variant: z.enum(["basic", "image", "video"]).default("basic"),

    headline: z.string().min(1).default("Headline"),
    subhead: z.string().optional().default("Subhead"),

    ctaText: z.string().optional().default("Browse"),
    ctaHref: z.string().optional().default("/products"),
    secondaryCtaText: z.string().optional().default(""),
    secondaryCtaHref: z.string().optional().default(""),
    splitPanelTitle: z.string().optional(),
    splitHighlights: z.array(z.string()).optional(),
    splitPanelCtaText: z.string().optional(),
    splitPanelCtaHref: z.string().optional(),
    centeredBadgeText: z.string().optional(),
    centeredTrustLine: z.string().optional(),
    centeredStats: z
      .array(
        z.object({
          value: z.string().optional(),
          label: z.string().optional(),
        }),
      )
      .optional(),
    promoBadgeText: z.string().optional(),
    promoCode: z.string().optional(),
    promoNote: z.string().optional(),
    promoBullets: z.array(z.string()).optional(),

    align: z.enum(["left", "center", "right"]).default("left"),
    contentWidth: z
      .enum(["auto", "sm", "md", "lg", "xl", "2xl", "full"])
      .default("xl"),
    minHeight: z.number().int().min(240).max(980).default(520),
    bg: z
      .object({
        type: z.enum(["none", "image", "video"]).optional(),
        color: z.string().optional(),

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
  heroPreset: "Basic",
  variant: "basic", // can stay basic or change to "centered"/"split" etc if your system supports

  headline: "Headline",
  subhead: "Subhead",

  ctaText: "Get Started",
  ctaHref: "/products",
  secondaryCtaText: "Learn More",
  secondaryCtaHref: "/about",

  align: "left", // "center" is usually more hero-like in 2024–2026 designs
  // Alternative popular modern choice:
  // align: "center",

  contentWidth: "xl", // good choice — alternatives: "lg" / "2xl" / "7xl"

  minHeight: 640, // 320px feels too short for modern hero sections — 80vh or 640–800px is more common

  bg: {
    type: "image", // "none" → "image" or "video" feels more premium as default
    color: "#0f172a",
    imageAssetId: "",
    imageUrl:
      "https://imgs.search.brave.com/wmNdZ-UZ8Tnxddp-fHKp-S1xfFV-wl9OA6Iagyi2EKQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL2Jsb2ct/Y292ZXItaW1hZ2Uv/YS1naXJsLWNyZWF0/aW5nLWEtZGVzaWdu/LXdpdGgtY29tcHV0/ZXIuanBn", // in real use → often a subtle gradient or high-quality hero image
    imageAlt: "Hero background",

    videoAssetId: "",
    videoUrl: "",
    posterAssetId: "",
    posterUrl: "",

    overlayColor: "#0f172a", // slate-950 — darker & more sophisticated than pure black
    overlayOpacity: 0.55, // 0.45–0.65 range usually looks best

    videoAutoplay: true,
    videoMuted: true,
    videoLoop: true,
    videoControls: false,
    videoPreload: "metadata", // "auto" is also common if video is the hero star
  },
};
