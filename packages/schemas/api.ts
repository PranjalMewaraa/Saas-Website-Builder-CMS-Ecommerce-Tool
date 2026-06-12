import { z } from "zod";

export const IdSchema = z.string().min(1);

export const SignupSchema = z.object({
  email: z
    .string()
    .email()
    .transform((s) => s.trim().toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z
    .string()
    .min(1, "Name is required.")
    .transform((s) => s.trim()),
});
export type SignupInput = z.infer<typeof SignupSchema>;

export const ProductCreateWithAttributesSchema = z.object({
  site_id: z.string().optional(),
  store_id: z.string().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().nullish(),
  brand_id: z.string().nullish(),
  base_price_cents: z.coerce.number().int().min(0),
  category_ids: z.array(z.string()).optional(),
  attributes: z.any().optional(),
  variants: z.array(z.any()).optional(),
});
export type ProductCreateWithAttributesInput = z.infer<
  typeof ProductCreateWithAttributesSchema
>;

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export function parseOrThrow<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const res = schema.safeParse(input);
  if (!res.success) {
    const msg = res.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${msg}`);
  }
  return res.data;
}
