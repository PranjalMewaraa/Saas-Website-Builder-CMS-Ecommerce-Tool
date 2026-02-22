import { z } from "zod";

export const SpacerSchema = z.object({
  height: z.coerce.number().min(0).max(600).default(40),
});

export const DividerSchema = z.object({
  thickness: z.coerce.number().min(1).max(10).default(1),
  color: z.string().default("#e5e7eb"),
  marginY: z.coerce.number().min(0).max(200).default(24),
});

export const RichTextSchema = z.object({
  html: z
    .string()
    .default(
      "<h2>Tell your story with clarity</h2><p>Use this rich text block to explain value, build trust, and guide customers to action.</p><ul><li>Clear headline and supporting copy</li><li>Use bullets to improve scan-ability</li><li>Add links for key next steps</li></ul><blockquote>Tip: keep paragraphs short and specific for better conversion.</blockquote>",
    ),
});
