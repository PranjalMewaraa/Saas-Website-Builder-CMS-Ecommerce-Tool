import { z } from "zod";

export const PageSeoSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(160).optional(),

  robots: z
    .object({
      index: z.boolean().default(true),
      follow: z.boolean().default(true),
    })
    .default({ index: true, follow: true }),

  canonical: z.string().url().optional(),

  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageAssetId: z.string().optional(),

  twitterCard: z
    .enum(["summary", "summary_large_image"])
    .default("summary_large_image"),
  twitterImageAssetId: z.string().optional(),
});

export const SiteSeoSchema = z.object({
  siteName: z.string().optional(),

  titleTemplate: z.string().default("{page} | {site}"),
  defaultDescription: z.string().optional(),

  faviconAssetId: z.string().optional(),
  globalOgImageAssetId: z.string().optional(),

  googleVerification: z.string().optional(),

  sitemapEnabled: z.boolean().default(true),
});

export type PageSeo = z.infer<typeof PageSeoSchema>;
export type SiteSeo = z.infer<typeof SiteSeoSchema>;
