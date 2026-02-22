import { z } from "zod";
import { listArchetypes, normalizeIndustry } from "./site-taxonomy";

export const AiAtomicSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.any()).default({}),
  style: z.record(z.string(), z.any()).optional(),
});

export const AiColSchema = z.object({
  id: z.string().min(1),
  style: z.record(z.string(), z.any()).optional(),
  blocks: z.array(AiAtomicSchema).default([]),
});

export const AiRowSchema = z.object({
  id: z.string().min(1),
  preset: z.string().optional(),
  style: z.record(z.string(), z.any()).optional(),
  cols: z.array(AiColSchema).min(1),
});

export const AiSectionSchema = z.object({
  id: z.string().min(1),
  style: z.record(z.string(), z.any()).optional(),
  rows: z.array(AiRowSchema).min(1),
});

export const AiPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  sections: z.array(AiSectionSchema).min(1),
});

export const AiThemeSchema = z.object({
  palette: z.record(z.string(), z.string()).default({}),
  typography: z.record(z.string(), z.string()).default({}),
});

export const AiSiteBlueprintSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  industry: z.string().min(1),
  archetype: z.string().min(1),
  prompt: z.string().optional(),
  ecommerce: z.boolean().optional(),
  meta: z
    .object({
      generated_at: z.string().optional(),
      source: z.enum(["rules_engine"]).optional(),
      recipe: z.string().optional(),
      details_typography: z.string().optional(),
      details_layout: z.string().optional(),
      details_colorSystem: z.string().optional(),
      details_ux: z.string().optional(),
      details_designFocus: z.string().optional(),
    })
    .optional(),
  theme: AiThemeSchema.default({ palette: {}, typography: {} }),
  pages: z.array(AiPageSchema).min(1),
});

export type AiSiteBlueprint = z.infer<typeof AiSiteBlueprintSchema>;

export function validateAiBlueprint(input: unknown) {
  const parsed = AiSiteBlueprintSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }
  const value = parsed.data;
  const industry = normalizeIndustry(value.industry);
  const archetypes = listArchetypes(industry);
  const validArchetype = archetypes.some((a) => a.id === value.archetype);
  if (!validArchetype) {
    return {
      ok: false as const,
      error: { formErrors: ["Invalid archetype for selected industry"], fieldErrors: {} },
    };
  }
  const seen = new Set<string>();
  for (const p of value.pages) {
    if (seen.has(p.slug)) {
      return {
        ok: false as const,
        error: { formErrors: [`Duplicate page slug: ${p.slug}`], fieldErrors: {} },
      };
    }
    seen.add(p.slug);
  }
  return { ok: true as const, value };
}
