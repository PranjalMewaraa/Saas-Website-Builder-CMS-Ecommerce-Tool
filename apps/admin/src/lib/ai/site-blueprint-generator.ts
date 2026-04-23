import {
  getBaseInformationArchitecture,
  listArchetypes,
  normalizeIndustry,
  type IaPageTemplate,
} from "./site-taxonomy";
import type { AiSiteBlueprint } from "./blueprint-schema";
import { getStyleProfile } from "./style-profiles";
import { inferPromptIntent } from "./prompt-intent";
import { resolveRecipeConfig } from "./site-recipes";

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

type Ctx = {
  name: string;
  industry: string;
  archetypeLabel: string;
  archetypeDetails: {
    typography: string;
    layout: string;
    colorSystem: string;
    ux: string;
    designFocus: string;
  };
  prompt: string;
  ecommerce: boolean;
  colors: {
    primary: string;
    accent: string;
    surface: string;
    text: string;
  };
  styleHints: {
    headingText: Record<string, any>;
    bodyText: Record<string, any>;
    card: Record<string, any>;
    primaryButton: Record<string, any>;
    sectionSurface: string;
    mutedSurface: string;
    containerMaxWidth: string;
    rowGap: string;
    sectionPaddingY: string;
    heroPreset?: string;
  };
};

function textBlock(tag: "h1" | "h2" | "h3" | "p", text: string, style?: Record<string, any>) {
  return {
    id: uid("atom"),
    type: "Atomic/Text" as const,
    props: { tag, text },
    ...(style ? { style } : {}),
  };
}

function buttonBlock(text: string, href: string, style?: Record<string, any>) {
  return {
    id: uid("atom"),
    type: "Atomic/Button" as const,
    props: { text, href },
    ...(style ? { style } : {}),
  };
}

function imageBlock(url: string, alt = "Image", style?: Record<string, any>) {
  return {
    id: uid("atom"),
    type: "Atomic/Image" as const,
    props: { src: url, alt },
    ...(style ? { style } : {}),
  };
}

function richBlock(type: string, props?: Record<string, any>, style?: Record<string, any>) {
  return {
    id: uid("blk"),
    type,
    props: props || {},
    ...(style ? { style } : {}),
  };
}

function section(rows: any[], style?: Record<string, any>) {
  return { id: uid("section"), rows, ...(style ? { style } : {}) };
}

function row(cols: any[], style?: Record<string, any>, preset?: string) {
  return { id: uid("row"), cols, ...(style ? { style } : {}), ...(preset ? { preset } : {}) };
}

function col(blocks: any[], style?: Record<string, any>) {
  return { id: uid("col"), blocks, ...(style ? { style } : {}) };
}

function mergeStyle(...parts: Array<Record<string, any> | undefined>) {
  return Object.assign({}, ...parts.filter(Boolean));
}

function deriveStyleHints(
  details: Ctx["archetypeDetails"],
  colors: Ctx["colors"],
): Ctx["styleHints"] {
  const d = `${details.typography} ${details.layout} ${details.colorSystem} ${details.ux} ${details.designFocus}`.toLowerCase();
  const isDark = d.includes("dark") || d.includes("neon") || d.includes("black");
  const isSerif = d.includes("serif");
  const isRounded = d.includes("rounded") || d.includes("soft");
  const isPremium = d.includes("premium") || d.includes("luxury");
  const isDense = d.includes("dense") || d.includes("high-density");
  const isSingleColumn = d.includes("single-column") || d.includes("single column");
  const isSplit = d.includes("split") || d.includes("two-column") || d.includes("2-column");

  const sectionSurface = isDark ? "#0b1021" : colors.surface;
  const mutedSurface = isDark ? "#111827" : "#f8fafc";
  const containerMaxWidth = isDense ? "1320px" : isSingleColumn ? "920px" : "1208px";
  const rowGap = isDense ? "12px" : "20px";
  const sectionPaddingY = isDense ? "36px" : "56px";
  const heroPreset = isSingleColumn ? undefined : isSplit ? "2-col" : undefined;

  return {
    headingText: {
      fontFamily: isSerif ? "Georgia, serif" : "Inter, system-ui, sans-serif",
      letterSpacing: isPremium ? "0.01em" : "0",
    },
    bodyText: {
      fontFamily: isSerif ? "ui-sans-serif, system-ui, sans-serif" : "Inter, system-ui, sans-serif",
      opacity: 0.92,
    },
    card: {
      background: isDark ? "#111827" : "#ffffff",
      border: isDark ? "1px solid #1f2937" : "1px solid #e5e7eb",
      borderRadius: isRounded ? "16px" : "10px",
    },
    primaryButton: {
      background: isDark ? colors.accent : colors.primary,
      color: isDark ? "#0b1021" : "#ffffff",
      borderRadius: isRounded ? "999px" : "10px",
      fontWeight: 700,
    },
    sectionSurface,
    mutedSurface,
    containerMaxWidth,
    rowGap,
    sectionPaddingY,
    heroPreset,
  };
}

function deriveThemeFromDetails(
  details: Ctx["archetypeDetails"],
  colors: Ctx["colors"],
  profileFonts: { heading: string; body: string },
) {
  const d = `${details.typography} ${details.layout} ${details.colorSystem} ${details.ux} ${details.designFocus}`.toLowerCase();
  const isDark = d.includes("dark") || d.includes("neo") || d.includes("cinematic");
  const isEco = d.includes("earth") || d.includes("sustainable") || d.includes("organic");
  const isLuxury = d.includes("luxury") || d.includes("premium") || d.includes("heritage");

  const palette = {
    primary: colors.primary,
    accent: colors.accent,
    surface: isDark ? "#0b1021" : colors.surface,
    text: isDark ? "#f8fafc" : colors.text,
    surface_alt: isDark ? "#111827" : isEco ? "#f5f8f2" : "#f8fafc",
    card_bg: isDark ? "#111827" : "#ffffff",
    border: isDark ? "#1f2937" : "#e5e7eb",
  };

  const typography = {
    heading: profileFonts.heading,
    body: profileFonts.body,
    heading_scale: isLuxury ? "1.12" : "1.0",
    body_density: d.includes("dense") ? "compact" : "comfortable",
    archetype_typography_hint: details.typography,
  };

  return { palette, typography };
}

type ThemePalette = ReturnType<typeof deriveThemeFromDetails>["palette"];

function normalizeBlockStyle(style: Record<string, any> | undefined) {
  const out = { ...(style || {}) };
  if (out.background && !out.bgColor) out.bgColor = out.background;
  if (out.color && !out.textColor) out.textColor = out.color;
  return out;
}

function applyThemeDefaultsToGeneratedPages(
  pages: AiSiteBlueprint["pages"],
  palette: ThemePalette,
) {
  return pages.map((page) => ({
    ...page,
    sections: (page.sections || []).map((sec) => {
      const secStyle = {
        bgColor: palette.surface,
        textColor: palette.text,
        ...(sec.style || {}),
      };
      return {
        ...sec,
        style: secStyle,
        rows: (sec.rows || []).map((rw) => ({
          ...rw,
          style: {
            textColor: secStyle.textColor,
            ...(rw.style || {}),
          },
          cols: (rw.cols || []).map((cl) => ({
            ...cl,
            style: {
              textColor: secStyle.textColor,
              ...(cl.style || {}),
            },
            blocks: (cl.blocks || []).map((bk) => {
              const isAtomic = String(bk.type || "").startsWith("Atomic/");
              if (!isAtomic) {
                return {
                  ...bk,
                  style: normalizeBlockStyle(bk.style as any),
                };
              }
              const style = normalizeBlockStyle(bk.style as any);
              const themed: Record<string, any> = { ...style };
              if (!themed.textColor) themed.textColor = palette.text;
              if (!themed.borderColor) themed.borderColor = palette.border;

              if (bk.type === "Atomic/Button") {
                if (!themed.bgColor) themed.bgColor = palette.primary;
                if (!themed.textColor) themed.textColor = "#ffffff";
              }
              if (bk.type === "Atomic/Badge") {
                if (!themed.bgColor) themed.bgColor = palette.accent;
              }
              if (bk.type === "Atomic/Group") {
                if (!themed.bgColor) themed.bgColor = palette.card_bg;
              }
              if (bk.type === "Atomic/Divider") {
                if (!themed.bgColor) themed.bgColor = palette.border;
              }

              return { ...bk, style: themed };
            }),
          })),
        })),
      };
    }),
  }));
}

function layoutRow(
  ctx: Ctx,
  cols: any[],
  style?: Record<string, any>,
  preset?: string,
) {
  return row(
    cols,
    mergeStyle(
      {
        maxWidth: ctx.styleHints.containerMaxWidth,
        margin: { left: "auto", right: "auto" },
        gap: ctx.styleHints.rowGap,
      },
      style,
    ),
    preset,
  );
}

function heroSection(
  ctx: Ctx,
  variant:
    | "editorial_split"
    | "dark_launch"
    | "clean_story"
    | "trust_split"
    | "catalog_dense"
    | "default",
  intent: ReturnType<typeof inferPromptIntent>,
) {
  const heroPreset =
    variant === "dark_launch"
      ? "Promo"
      : variant === "trust_split" || variant === "editorial_split"
        ? "Split"
        : variant === "catalog_dense"
          ? "Centered"
          : "Basic";
  const bgVariant = variant === "dark_launch" ? "video" : "image";

  return section(
    [
      layoutRow(ctx, [
        col([
          richBlock("Hero/V1", {
            heroPreset,
            variant: bgVariant,
            headline: ctx.name,
            subhead:
              ctx.prompt ||
              `${ctx.archetypeLabel} style crafted for ${ctx.industry.replace(/_/g, " ")} brands.`,
            ctaText: ctx.ecommerce ? "Shop now" : "Get started",
            ctaHref: ctx.ecommerce ? "/products" : "/contact",
            secondaryCtaText: "Learn more",
            secondaryCtaHref: "/about",
            align: variant === "catalog_dense" ? "center" : "left",
            bg: {
              type: bgVariant,
              imageUrl:
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1800&auto=format&fit=crop",
              videoUrl:
                "https://cdn.coverr.co/videos/coverr-model-walking-in-an-urban-setting-1579/1080p.mp4",
              overlayColor: variant === "dark_launch" ? "#020617" : "#0f172a",
              overlayOpacity: variant === "dark_launch" ? 0.55 : 0.28,
            },
            contentWidth: ctx.styleHints.containerMaxWidth === "1320px" ? "2xl" : "xl",
          }),
        ]),
      ]),
      ...(intent.wantsCountdown
        ? [
            layoutRow(ctx, [
              col([
                richBlock("StickyPromoBar/V1", {
                  text: "Limited drop offer active now",
                  ctaText: "Shop deals",
                  ctaHref: "/products",
                  position: "top",
                  theme: "dark",
                }),
              ]),
            ]),
          ]
        : [
            layoutRow(ctx, [
              col([
                richBlock("MarqueeStrip/V1", {
                  items: [
                    "Free shipping over ₹999",
                    "Easy returns",
                    "Secure checkout",
                    "Premium support",
                  ],
                  speedSec: 28,
                }),
              ]),
            ]),
          ]),
    ],
    { paddingTop: "0px", paddingBottom: "0px", bgColor: ctx.colors.surface },
  );
}

function featureSection(
  ctx: Ctx,
  variant: "cards_3" | "kpi_ribbon" | "comparison",
  intent: ReturnType<typeof inferPromptIntent>,
) {
  if (variant === "kpi_ribbon") {
    return section(
      [
        layoutRow(ctx, [col([richBlock("KPIRibbon/V1", {})])]),
        layoutRow(ctx, [col([richBlock("SpotlightCards/V1", {
          title: "Why customers stay",
          subtitle: ctx.archetypeDetails.ux,
        })])]),
        ...(intent.wantsTestimonials
          ? [layoutRow(ctx, [col([richBlock("TestimonialCarousel/V1", {})])])]
          : []),
      ],
      { paddingTop: "18px", paddingBottom: "28px", bgColor: "#ffffff", textColor: ctx.colors.text },
    );
  }
  if (variant === "comparison") {
    return section(
      [
        layoutRow(ctx, [col([richBlock("ComparisonTable/V1", {
          title: "Why choose us",
          columns: ["Feature", "Others", "Our Store"],
        })])]),
        layoutRow(ctx, [col([richBlock("ContentSplitShowcase/V1", {
          title: "Built for faster decisions",
          subtitle: ctx.archetypeDetails.designFocus,
          ctaText: ctx.ecommerce ? "Explore products" : "Contact us",
          ctaHref: ctx.ecommerce ? "/products" : "/contact",
        })])]),
      ],
      { paddingTop: "22px", paddingBottom: "34px", bgColor: "#f8fafc", textColor: ctx.colors.text },
    );
  }
  return section(
    [
      layoutRow(ctx, [col([richBlock("BentoGrid/V1", {
        title: "Why customers choose us",
        subtitle: ctx.archetypeDetails.ux,
      })])]),
      layoutRow(ctx, [col([richBlock("FeaturesGrid/V1", {
        title: "Built to scale with your brand",
      })])]),
    ],
    {
      paddingTop: "18px",
      paddingBottom: "24px",
      bgColor: ctx.styleHints.mutedSurface,
      textColor: ctx.colors.text,
    },
  );
}

function ctaSection(
  ctx: Ctx,
  variant: "dark_panel" | "accent_panel" | "minimal",
  intent: ReturnType<typeof inferPromptIntent>,
) {
  const title =
    variant === "accent_panel"
      ? intent.wantsDiscountFocus
        ? "Deals are live now"
        : "Ready to convert visitors?"
      : ctx.ecommerce
        ? "Ready to place your first order?"
        : "Ready to launch?";
  return section(
    [
      layoutRow(ctx, [col([richBlock("BannerCTA/V1", {
        title,
        subtitle: intent.wantsPremiumTone
          ? "Fine-tune every detail with premium visual control."
          : "All content and styles are editable in your builder.",
        buttonText: ctx.ecommerce ? "Shop now" : "Contact us",
        buttonHref: ctx.ecommerce ? "/products" : "/contact",
      })])]),
      layoutRow(ctx, [col([richBlock("NewsletterSignup/V1", {
        title: "Get launch updates and offers",
        subtitle: "Collect leads and keep buyers engaged post-launch.",
      })])]),
    ],
    { paddingTop: "14px", paddingBottom: "30px", bgColor: ctx.colors.surface },
  );
}

function aboutPageSections(ctx: Ctx) {
  return [
    section(
      [
        layoutRow(ctx, [col([richBlock("ContentSplitShowcase/V1", {
          title: "About us",
          subtitle: `We operate in ${ctx.industry.replace(/_/g, " ")} with a ${ctx.archetypeLabel} direction and practical, customer-first UX.`,
          ctaText: "Explore products",
          ctaHref: "/products",
        })])]),
        layoutRow(ctx, [col([richBlock("Testimonials/V1", { title: "What customers say" })])], { marginTop: "12px" }),
      ],
      { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
    ),
    supportCardsSection(ctx, [
      { title: "Our mission", body: "Explain the purpose and value you bring to customers." },
      { title: "Why trust us", body: "Highlight quality, service, and proof points." },
      { title: "What to expect", body: "Set clear delivery, support, and product expectations." },
    ]),
    finalCtaSection(ctx, "Let’s help you choose the right product", "Move users from brand story into shopping.", "/products"),
  ];
}

function contactPageSections(ctx: Ctx) {
  return [
    section(
      [
        layoutRow(ctx, [col([richBlock("BannerCTA/V1", {
          title: "Contact us",
          subtitle: "Talk to our team for pre-sales, orders, and support.",
          buttonText: "Send message",
          buttonHref: "/contact",
        })])]),
        layoutRow(ctx, [col([richBlock("FAQAccordion/V1", { title: "Common support questions" })])], { marginTop: "12px" }),
      ],
      { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
    ),
    supportCardsSection(ctx, [
      { title: "Sales support", body: "Pre-purchase questions, recommendations, and custom requests." },
      { title: "Order support", body: "Delivery, return, and exchange-related assistance." },
      { title: "Business inquiries", body: "Partnership and wholesale discussions." },
    ]),
    finalCtaSection(ctx, "Prefer self-service first?", "Guide users to FAQ and policies before contacting.", "/faq"),
  ];
}

function policySections(title: string) {
  return [
    section(
      [
        row([
          col([
            textBlock("h1", title, { fontSize: "34px", fontWeight: 700 }),
            textBlock(
              "p",
              "Replace this template text with your policy content in the visual editor.",
              { marginTop: "10px" },
            ),
          ]),
        ]),
      ],
      { paddingTop: "44px", paddingBottom: "44px", bgColor: "#ffffff" },
    ),
    section(
      [
        row([
          col([
            textBlock("h3", "Need clarification?", { fontSize: "24px", fontWeight: 700 }),
            textBlock("p", "Provide a support channel for policy-specific questions.", { marginTop: "8px" }),
            buttonBlock("Contact support", "/contact", { marginTop: "12px" }),
          ]),
        ]),
      ],
      { paddingTop: "8px", paddingBottom: "36px", bgColor: "#f8fafc" },
    ),
  ];
}

function productsPageSections(ctx: Ctx) {
  return [
    section(
      [
        layoutRow(ctx, [col([richBlock("ProductGrid/V1", { title: "All products", limit: 12 })])]),
        layoutRow(ctx, [col([richBlock("BestSellers/V1", { title: "Bestsellers" })])], { marginTop: "12px" }),
      ],
      { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
    ),
    section(
      [
        layoutRow(ctx, [
          col([textBlock("h3", "Browse by collection", { fontWeight: 700 }), textBlock("p", "Men, women, new arrivals, and sale collections.")], ctx.styleHints.card),
          col([textBlock("h3", "Filter with confidence", { fontWeight: 700 }), textBlock("p", "Use attributes, price range, and category filters.")], ctx.styleHints.card),
          col([textBlock("h3", "Fast checkout", { fontWeight: 700 }), textBlock("p", "Add to cart or buy now directly from product detail.")], ctx.styleHints.card),
        ], {}, "3-col"),
      ],
      { paddingTop: "12px", paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.styleHints.mutedSurface },
    ),
    section(
      [
        layoutRow(ctx, [
          col([
            textBlock("h3", "Need help choosing?", { fontSize: "26px", fontWeight: 700 }),
            textBlock("p", "Use compare pages and guides to make faster decisions.", { marginTop: "8px" }),
            buttonBlock("View FAQ", "/faq", { marginTop: "14px", ...ctx.styleHints.primaryButton }),
          ], ctx.styleHints.card),
        ]),
      ],
      { paddingTop: "10px", paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
    ),
  ];
}

function supportCardsSection(ctx: Ctx, items: Array<{ title: string; body: string }>) {
  return section(
    [
      layoutRow(ctx, [col([richBlock("SpotlightCards/V1", {
        title: "Quick highlights",
        subtitle: ctx.archetypeDetails.ux,
        cards: items.slice(0, 3).map((it) => ({ title: it.title, description: it.body, href: "#" })),
      })])]),
    ],
    { paddingTop: "8px", paddingBottom: "24px", bgColor: ctx.styleHints.mutedSurface },
  );
}

function finalCtaSection(ctx: Ctx, title: string, body: string, href = "/contact") {
  return section(
    [
      layoutRow(ctx, [col([richBlock("BannerCTA/V1", {
        title,
        subtitle: body,
        buttonText: "Get started",
        buttonHref: href,
      })])]),
    ],
    { paddingTop: "8px", paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
  );
}

function iaTemplateSections(ctx: Ctx, template: IaPageTemplate, title: string) {
  const subtitle = `${ctx.archetypeDetails.ux} ${ctx.archetypeDetails.designFocus}`;
  if (template === "collections") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("CategoryGrid/V1", { title, subtitle })])]),
          layoutRow(ctx, [col([richBlock("BestSellers/V1", { title: "Collection bestsellers" })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
      ),
      supportCardsSection(ctx, [
        { title: "Shop by category", body: "Group collections by product type and usage." },
        { title: "Shop by trend", body: "Highlight seasonal and best-performing categories." },
        { title: "Shop by budget", body: "Make discovery fast with price-banded collections." },
      ]),
      finalCtaSection(ctx, "Need personalized picks?", "Guide users to curated collections or assistance."),
    ];
  }
  if (template === "catalog") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("ProductGrid/V1", { title, limit: 8 })])]),
          layoutRow(ctx, [col([richBlock("BrandGrid/V1", { title: "Featured brands" })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
      ),
      supportCardsSection(ctx, [
        { title: "Advanced filters", body: "Category, attributes, price, and availability filters." },
        { title: "Sort options", body: "Newest, popular, and price-based sorting for fast selection." },
        { title: "Search-first flow", body: "Efficient discovery for users with clear product intent." },
      ]),
      finalCtaSection(ctx, "Ready to explore products?", "Take users directly into shoppable listings.", "/products"),
    ];
  }
  if (template === "comparison") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("ComparisonTable/V1", { title })])]),
          layoutRow(ctx, [col([richBlock("ContentSplitShowcase/V1", {
            title: "Compare quickly, choose confidently",
            subtitle: subtitle,
            ctaText: "View products",
            ctaHref: "/products",
          })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.styleHints.mutedSurface },
      ),
      supportCardsSection(ctx, [
        { title: "Feature comparison", body: "Clarify differences by specs and use-cases." },
        { title: "Price comparison", body: "Show value differences across variants or plans." },
        { title: "Decision shortcuts", body: "Add quick recommendations for common buyer profiles." },
      ]),
      finalCtaSection(ctx, "Need help deciding?", "Route visitors to support or guided recommendations."),
    ];
  }
  if (template === "lookbook") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("MediaGalleryMasonry/V1", { title, subtitle })])]),
          layoutRow(ctx, [col([richBlock("SpotlightCards/V1", { title: "Shop the look", subtitle: "Connect inspiration to products." })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
      ),
      supportCardsSection(ctx, [
        { title: "Shop the look", body: "Connect each visual story to a curated product set." },
        { title: "Style notes", body: "Add quick advice to improve outfit or room decisions." },
        { title: "Seasonal edits", body: "Rotate themes based on campaign and inventory." },
      ]),
      finalCtaSection(ctx, "Want full collection access?", "Move users from inspiration to checkout.", "/products"),
    ];
  }
  if (template === "size_guide") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("ProcessTimeline/V1", { title, subtitle: "A clear measurement flow that reduces returns." })])]),
          layoutRow(ctx, [col([richBlock("FAQAccordion/V1", { title: "Fit & sizing FAQ" })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.styleHints.mutedSurface },
      ),
      supportCardsSection(ctx, [
        { title: "Measure correctly", body: "Step-by-step measurement flow with examples." },
        { title: "Fit by body type", body: "Guide users for slim, regular, and relaxed fits." },
        { title: "Material behavior", body: "Explain stretch, shrinkage, and fit expectations." },
      ]),
      finalCtaSection(ctx, "Still unsure about fit?", "Direct shoppers to support before purchase."),
    ];
  }
  if (template === "support") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("FAQAccordion/V1", {
            title,
            subtitle: "Support hub for policies, setup help, and contact paths.",
          })])]),
          layoutRow(ctx, [col([richBlock("BannerCTA/V1", {
            title: "Need direct support?",
            subtitle: "Connect with our team for order and product help.",
            buttonText: "Contact support",
            buttonHref: "/contact",
          })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
      ),
      supportCardsSection(ctx, [
        { title: "Order support", body: "Track order, return flow, and refund policy guidance." },
        { title: "Product support", body: "Warranty, setup, and compatibility help." },
        { title: "Account support", body: "Profile, address, and payment management FAQs." },
      ]),
      finalCtaSection(ctx, "Need direct assistance?", "Offer quick escalation to support team."),
    ];
  }
  if (template === "blog") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("ContentSplitShowcase/V1", {
            title,
            subtitle: "Content hub for guides, stories, and SEO-ready editorial pages.",
            ctaText: "Explore articles",
            ctaHref: "/blog",
          })])]),
          layoutRow(ctx, [col([richBlock("InteractiveTabs/V1", {
            tabs: [
              { label: "Guides", content: "Step-by-step buying guides." },
              { label: "Trends", content: "Latest launches and market insights." },
              { label: "Stories", content: "Brand and customer stories." },
            ],
          })])], { marginTop: "12px" }),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
      ),
      supportCardsSection(ctx, [
        { title: "Buying guides", body: "Decision-focused content tied to top products." },
        { title: "How-to content", body: "Tutorials that help users get value quickly." },
        { title: "Trend updates", body: "New launches, bestsellers, and market shifts." },
      ]),
      finalCtaSection(ctx, "Ready to shop after reading?", "Bridge editorial content into product discovery.", "/products"),
    ];
  }
  if (template === "faq") {
    return [
      section(
        [
          layoutRow(ctx, [col([richBlock("FAQAccordion/V1", {
            title,
            subtitle: "Common questions and decision-friction reducers.",
          })])]),
        ],
        { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.styleHints.mutedSurface },
      ),
      supportCardsSection(ctx, [
        { title: "Shipping questions", body: "Delivery timelines, charges, and coverage." },
        { title: "Returns & refunds", body: "Eligibility rules and expected timelines." },
        { title: "Payments & promos", body: "Payment methods and coupon usage guidance." },
      ]),
      finalCtaSection(ctx, "Need more help?", "Move unresolved queries to support.", "/contact"),
    ];
  }
  return [
    section(
      [
        layoutRow(ctx, [col([richBlock("ContentSplitShowcase/V1", {
          title,
          subtitle: "Story-driven page scaffold ready for customization.",
          ctaText: "Explore",
          ctaHref: "/products",
        })])]),
      ],
      { paddingTop: ctx.styleHints.sectionPaddingY, paddingBottom: ctx.styleHints.sectionPaddingY, bgColor: ctx.colors.surface },
    ),
    supportCardsSection(ctx, [
      { title: "Clear structure", body: "Information grouped into actionable sections." },
      { title: "Conversion path", body: "Every page leads toward product discovery or contact." },
      { title: "Editable content", body: "All generated content can be customized in builder." },
    ]),
    finalCtaSection(ctx, "Want to customize this page?", "Use visual builder controls to refine every section."),
  ];
}

export function generatePhaseOneBlueprint(input: {
  name: string;
  handle?: string;
  industry?: string;
  archetype?: string;
  prompt?: string;
  ecommerce?: boolean;
}): AiSiteBlueprint {
  const name = String(input.name || "").trim() || "My Site";
  const industry = normalizeIndustry(input.industry);
  const archetypes = listArchetypes(industry);
  const archetype =
    archetypes.find((a) => a.id === input.archetype)?.id ||
    archetypes[0]?.id ||
    "bento_grid";
  const handle = slugify(input.handle || name) || "site";
  const prompt = String(input.prompt || "").trim();
  const ecommerce = Boolean(input.ecommerce);
  const profile = getStyleProfile(industry);
  const archetypeObj = archetypes.find((a) => a.id === archetype) || archetypes[0];
  const archetypeLabel = archetypeObj?.name || "Bento Grid";
  const archetypeDetails = archetypeObj?.details || {
    typography: "Balanced heading + readable body text for strong clarity.",
    layout: "Clean modular sections with clear hierarchy and spacing.",
    colorSystem: "Brand-led neutral base with one strong accent color.",
    ux: "Simple navigation, fast scanning, and clear calls to action.",
    designFocus: "Conversion-first presentation with easy customization.",
  };
  const recipe = resolveRecipeConfig(archetype);
  const intent = inferPromptIntent(prompt);

  const ctx: Ctx = {
    name,
    industry,
    archetypeLabel,
    archetypeDetails,
    prompt,
    ecommerce,
    colors: profile.palette,
    styleHints: deriveStyleHints(archetypeDetails, profile.palette),
  };
  const themeFromDetails = deriveThemeFromDetails(archetypeDetails, profile.palette, {
    heading: profile.heading,
    body: profile.body,
  });

  const basePages = [
    {
      title: "Home",
      slug: "/",
      sections: [
        heroSection(ctx, recipe.heroVariant, intent),
        featureSection(ctx, recipe.featureVariant, intent),
        ctaSection(ctx, recipe.ctaVariant, intent),
      ],
    },
    {
      title: "About",
      slug: "/about",
      sections: aboutPageSections(ctx),
    },
    {
      title: "Contact",
      slug: "/contact",
      sections: contactPageSections(ctx),
    },
    {
      title: "Privacy Policy",
      slug: "/privacy-policy",
      sections: policySections("Privacy Policy"),
    },
    {
      title: "Terms and Conditions",
      slug: "/terms-and-conditions",
      sections: policySections("Terms and Conditions"),
    },
  ];

  const iaPages = getBaseInformationArchitecture(industry, archetype).map((entry) => ({
    title: entry.title,
    slug: entry.slug,
    sections: iaTemplateSections(ctx, entry.template, entry.title),
  }));

  const commercePages = ecommerce
    ? [
        {
          title: "Products",
          slug: "/products",
          sections: productsPageSections(ctx),
        },
        {
          title: "Product Detail",
          slug: "/products/[slug]",
          sections: [
            section(
              [
                row([
                  col([
                    textBlock("h1", "Product detail", { fontSize: "38px", fontWeight: 700 }),
                    textBlock(
                      "p",
                      "Dynamic product detail route. Use PDP block variants for final visual design.",
                      { marginTop: "10px" },
                    ),
                  ]),
                ]),
              ],
              { paddingTop: "46px", paddingBottom: "46px", bgColor: ctx.colors.surface },
            ),
          ],
        },
        {
          title: "Cart",
          slug: "/cart",
          sections: [
            section(
              [
                row([
                  col([
                    textBlock("h1", "Cart", { fontSize: "38px", fontWeight: 700 }),
                    textBlock(
                      "p",
                      "Review items, apply coupons, and complete checkout.",
                      { marginTop: "10px" },
                    ),
                  ]),
                ]),
              ],
              { paddingTop: "46px", paddingBottom: "46px", bgColor: ctx.colors.surface },
            ),
          ],
        },
      ]
    : [];

  const allPages = [...basePages, ...iaPages, ...commercePages].filter(
    (page, idx, arr) => arr.findIndex((p) => p.slug === page.slug) === idx,
  );

  const themedPages = applyThemeDefaultsToGeneratedPages(allPages as any, themeFromDetails.palette);

  return {
    version: 1,
    name,
    handle,
    industry,
    archetype,
    prompt,
    ecommerce,
    theme: {
      palette: themeFromDetails.palette,
      typography: themeFromDetails.typography,
    },
    meta: {
      generated_at: new Date().toISOString(),
      source: "rules_engine",
      recipe: `${recipe.heroVariant}:${recipe.featureVariant}:${recipe.ctaVariant}`,
      details_typography: archetypeDetails.typography,
      details_layout: archetypeDetails.layout,
      details_colorSystem: archetypeDetails.colorSystem,
      details_ux: archetypeDetails.ux,
      details_designFocus: archetypeDetails.designFocus,
    },
    pages: themedPages as any,
  };
}
