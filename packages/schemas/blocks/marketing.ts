import { z } from "zod";

export const BannerCTAV1Schema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonHref: z.string().optional(),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export const FeaturesGridV1Schema = z.object({
  title: z.string().optional(),
  features: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
});

export const TestimonialsV1Schema = z.object({
  title: z.string().optional(),
  testimonials: z.array(
    z.object({
      name: z.string(),
      role: z.string().optional(),
      quote: z.string(),
    }),
  ),
});

export const StatsCounterV1Schema = z.object({
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
});

export const LogosCloudV1Schema = z.object({
  title: z.string().optional(),
  logos: z.array(z.string()),
});

export const NewsletterSignupV1Schema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
});
