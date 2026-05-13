import { z } from "zod";

export const StarsAtomicSchema = z.object({
  rating: z.number().min(0).max(5).default(0),
  size: z.enum(["xs", "sm", "md", "lg"]).optional().default("md"),
  showCount: z.boolean().optional().default(false),
  count: z.number().optional(),
});

export const ProductReviewsListV1Schema = z.object({
  title: z.string().optional().default("Customer reviews"),
  emptyText: z
    .string()
    .optional()
    .default("No reviews yet. Be the first to leave one."),
  showDistribution: z.boolean().optional().default(true),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  detailPathPrefix: z.string().optional().default("/products"),
  contentWidth: z.string().optional(),
});

export const ProductReviewSubmitV1Schema = z.object({
  title: z.string().optional().default("Write a review"),
  submitText: z.string().optional().default("Submit review"),
  signInHref: z.string().optional().default("/account/login"),
  signInText: z
    .string()
    .optional()
    .default("Sign in to leave a review."),
  detailPathPrefix: z.string().optional().default("/products"),
  contentWidth: z.string().optional(),
});
