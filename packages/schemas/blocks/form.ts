import { z } from "zod";

export const FormV1Schema = z.object({
  formId: z.string().min(1),
  title: z.string().max(80).optional(),
  submitText: z.string().max(40).optional(),
  contentWidth: z.string().optional(),
});
