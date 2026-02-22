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
  limit: z.coerce.number().int().min(1).max(48).default(12),
  contentWidth: z.string().optional(),
  showFilters: z.coerce.boolean().optional(),
  showSearch: z.coerce.boolean().optional(),
  detailPathPrefix: z.string().optional(),
});

export const ProductDetailV1Schema = z.object({
  contentWidth: z.string().optional(),
  showRelated: z.coerce.boolean().optional(),
  relatedLimit: z.coerce.number().int().min(0).max(12).default(4),
  detailPathPrefix: z.string().optional(),
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
