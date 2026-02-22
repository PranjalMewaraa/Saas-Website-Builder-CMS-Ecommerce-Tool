import { z } from "zod";

export const ProductHighlightV1Schema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  price: z.number().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  contentWidth: z.string().optional(),
});

export const PricingTableV1Schema = z.object({
  title: z.string().optional(),
  plans: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      ctaText: z.string().optional(),
      ctaHref: z.string().optional(),
    }),
  ),
  contentWidth: z.string().optional(),
});

export const ProductListV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  contentWidth: z.string().optional(),
  showFilters: z.coerce.boolean().optional(),
  showSearch: z.coerce.boolean().optional(),
  detailPathPrefix: z.string().optional(),
  titleAlign: z.enum(["left", "center"]).optional(),
  sectionPadding: z.enum(["compact", "normal", "spacious"]).optional(),
  sectionBg: z.string().optional(),
  gridCols: z.enum(["2", "3", "4", "5"]).optional(),
  gridGap: z.enum(["tight", "normal", "relaxed"]).optional(),
  sidebarPosition: z.enum(["left", "right"]).optional(),
  filterStyle: z.enum(["card", "soft"]).optional(),
  filterSticky: z.coerce.boolean().optional(),
  cardVariant: z
    .enum([
      "default",
      "minimal",
      "compact",
      "bordered",
      "horizontal",
      "editorial",
      "elevated",
      "glass",
      "dark",
    ])
    .optional(),
});

export const ProductDetailV1Schema = z.object({
  contentWidth: z.string().optional(),
  showRelated: z.coerce.boolean().optional(),
  relatedLimit: z.coerce.number().int().min(0).max(12).default(4),
  detailPathPrefix: z.string().optional(),
  relatedCardVariant: z
    .enum([
      "default",
      "minimal",
      "compact",
      "bordered",
      "horizontal",
      "editorial",
      "elevated",
      "glass",
      "dark",
    ])
    .optional(),
});

export const CartPageV1Schema = z.object({
  title: z.string().optional(),
  emptyTitle: z.string().optional(),
  emptyCtaText: z.string().optional(),
  emptyCtaHref: z.string().optional(),
  checkoutText: z.string().optional(),
  checkoutMode: z.enum(["link", "create-order"]).optional(),
  checkoutHref: z.string().optional(),
});

export const CartSummaryV1Schema = z.object({
  title: z.string().optional(),
  checkoutText: z.string().optional(),
  checkoutHref: z.string().optional(),
});

export const AddToCartV1Schema = z.object({
  productId: z.string().optional(),
  title: z.string().optional(),
  priceCents: z.coerce.number().int().optional(),
  image: z.string().optional(),
  buttonText: z.string().optional(),
  variant: z
    .enum(["default", "outline", "minimal", "split", "card", "sticky"])
    .optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
  badgeText: z.string().optional(),
  noteText: z.string().optional(),
  showTitle: z.coerce.boolean().optional(),
  showPrice: z.coerce.boolean().optional(),
  showImage: z.coerce.boolean().optional(),
  accentColor: z.string().optional(),
  textColor: z.string().optional(),
  surfaceColor: z.string().optional(),
  radius: z.coerce.number().int().min(0).max(32).optional(),
  fullWidth: z.coerce.boolean().optional(),
  quantity: z.coerce.number().int().min(1).optional(),
});

export const CategoryGridV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  categories: z
    .array(
      z.object({
        title: z.string(),
        href: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .optional(),
});

export const BrandGridV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  gap: z.coerce.number().int().min(0).max(48).optional(),
  brands: z
    .array(
      z.object({
        name: z.string(),
        href: z.string().optional(),
        logo: z.string().optional(),
      }),
    )
    .optional(),
});

export const BestSellersV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  contentWidth: z.string().optional(),
  products: z
    .array(
      z.object({
        title: z.string(),
        price: z.string(),
        href: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .optional(),
});

export const MegaMenuV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  columns: z.coerce.number().int().min(1).max(6).optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  showSearch: z.coerce.boolean().optional(),
  searchPlaceholder: z.string().optional(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        links: z.array(
          z.object({
            label: z.string(),
            href: z.string().optional(),
            badge: z.string().optional(),
          }),
        ),
      }),
    )
    .optional(),
  promo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      ctaText: z.string().optional(),
      ctaHref: z.string().optional(),
    })
    .optional(),
});

export const StoreLocatorV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  showMap: z.coerce.boolean().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  stores: z
    .array(
      z.object({
        name: z.string(),
        badge: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        mapUrl: z.string().optional(),
      }),
    )
    .optional(),
});

export const BundleOfferV1Schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  currency: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        image: z.string().optional(),
        qty: z.coerce.number().int().min(1).optional(),
        price: z.coerce.number().min(0).optional(),
      }),
    )
    .optional(),
});
