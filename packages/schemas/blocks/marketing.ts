import { z } from "zod";

export const BannerCTAV1Schema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  contentWidth: z.string().optional(),
  buttonHref: z.string().optional(),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export const FeaturesGridV1Schema = z.object({
  title: z.string().optional(),
  contentWidth: z.string().optional(),
  features: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
});

export const TestimonialsV1Schema = z.object({
  title: z.string().optional(),
  contentWidth: z.string().optional(),
  testimonials: z.array(
    z.object({
      name: z.string(),
      role: z.string().optional(),
      quote: z.string(),
    }),
  ),
});

export const StatsCounterV1Schema = z.object({
  contentWidth: z.string().optional(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
});

export const LogosCloudV1Schema = z.object({
  title: z.string().optional(),
  contentWidth: z.string().optional(),
  logos: z.array(z.string()),
});

export const NewsletterSignupV1Schema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
});

export const FAQAccordionV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  items: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
});

export const BentoGridV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  cardSizePreset: z.enum(["balanced", "feature-first", "compact"]).optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        badge: z.string().optional(),
        image: z.string().optional(),
        href: z.string().optional(),
        size: z.enum(["sm", "lg"]).optional(),
      }),
    )
    .optional(),
});

export const BeforeAfterSliderV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  beforeImage: z.string().optional(),
  beforeImageAssetId: z.string().optional(),
  afterImage: z.string().optional(),
  afterImageAssetId: z.string().optional(),
  beforeLabel: z.string().optional(),
  afterLabel: z.string().optional(),
  height: z.coerce.number().int().min(240).max(900).optional(),
  handleStyle: z.enum(["line", "circle", "pill"]).optional(),
});

export const StickyPromoBarV1Schema = z.object({
  text: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  position: z.enum(["top", "bottom"]).optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  offsetX: z.coerce.number().int().min(0).max(120).optional(),
  offsetY: z.coerce.number().int().min(0).max(120).optional(),
  maxWidth: z.string().optional(),
  radius: z.coerce.number().int().min(0).max(40).optional(),
  dismissible: z.coerce.boolean().optional(),
  theme: z.enum(["dark", "brand", "light", "success", "danger"]).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  ctaBgColor: z.string().optional(),
  ctaTextColor: z.string().optional(),
});

export const TestimonialCarouselV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  autoplayMs: z.coerce.number().int().min(0).max(20000).optional(),
  transition: z.enum(["fade", "slide", "none"]).optional(),
  testimonials: z
    .array(
      z.object({
        quote: z.string(),
        name: z.string(),
        role: z.string().optional(),
        rating: z.coerce.number().int().min(1).max(5).optional(),
      }),
    )
    .optional(),
});

export const ComparisonTableV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  highlightColumn: z.coerce.number().int().min(-1).max(20).optional(),
  columns: z.array(z.string()).optional(),
  rows: z
    .array(
      z.object({
        feature: z.string(),
        values: z.array(z.string()),
      }),
    )
    .optional(),
});

export const MarqueeStripV1Schema = z.object({
  contentWidth: z.string().optional(),
  speedSec: z.coerce.number().int().min(5).max(120).optional(),
  pauseOnHover: z.coerce.boolean().optional(),
  itemGap: z.coerce.number().int().min(0).max(96).optional(),
  items: z.array(z.string()).optional(),
});

export const SpotlightCardsV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  cards: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        href: z.string().optional(),
      }),
    )
    .optional(),
});

export const ProcessTimelineV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export const MediaGalleryMasonryV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  columns: z.coerce.number().int().min(2).max(6).optional(),
  items: z
    .array(
      z.object({
        image: z.string().optional(),
        alt: z.string().optional(),
        caption: z.string().optional(),
      }),
    )
    .optional(),
});

export const VideoHeroLiteV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  videoUrl: z.string().optional(),
  videoAssetId: z.string().optional(),
  posterUrl: z.string().optional(),
  posterAssetId: z.string().optional(),
  minHeight: z.coerce.number().int().min(320).max(1000).optional(),
  overlayOpacity: z.coerce.number().min(0).max(1).optional(),
  contentWidth: z.string().optional(),
});

export const KPIRibbonV1Schema = z.object({
  contentWidth: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        icon: z.string().optional(),
      }),
    )
    .optional(),
});

export const InteractiveTabsV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  tabs: z
    .array(
      z.object({
        label: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
      }),
    )
    .optional(),
});

export const FloatingCTAV1Schema = z.object({
  text: z.string().optional(),
  buttonText: z.string().optional(),
  buttonHref: z.string().optional(),
  position: z.enum(["bottom-right", "bottom-left"]).optional(),
});

export const ContentSplitShowcaseV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaAlt: z.string().optional(),
  reverse: z.coerce.boolean().optional(),
  contentWidth: z.string().optional(),
});

export const SocialProofTickerV1Schema = z.object({
  contentWidth: z.string().optional(),
  speedSec: z.coerce.number().int().min(5).max(120).optional(),
  itemGap: z.coerce.number().int().min(0).max(96).optional(),
  items: z.array(z.string()).optional(),
});
