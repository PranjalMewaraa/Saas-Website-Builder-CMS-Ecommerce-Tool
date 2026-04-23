import { z } from "zod";

export const IdSchema = z.string().min(1);

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
