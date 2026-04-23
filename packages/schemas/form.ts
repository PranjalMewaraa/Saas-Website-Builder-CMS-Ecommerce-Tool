import { z } from "zod";

export const FormFieldTypeSchema = z.enum([
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "checkbox",
]);

export const FormFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(64), // key in submission payload
  label: z.string().min(1).max(80),
  type: FormFieldTypeSchema,
  required: z.coerce.boolean().default(false),
  placeholder: z.string().max(120).optional(),
  helpText: z.string().max(160).optional(),

  // for select
  options: z.array(z.string().min(1).max(80)).optional(),

  // lightweight validation
  minLen: z.coerce.number().int().min(0).max(500).optional(),
  maxLen: z.coerce.number().int().min(1).max(2000).optional(),
});

export const FormSchemaSchema = z.object({
  fields: z.array(FormFieldSchema).min(1).max(40),
  successMessage: z.string().max(200).optional(),
});

export type FormSchema = z.infer<typeof FormSchemaSchema>;
