import { FormSchemaSchema } from "@acme/schemas";

export function validateAgainstSnapshotForm(
  snapshot: any,
  form_id: string,
  data: any
) {
  const form = snapshot?.forms?.[form_id];
  if (!form?.schema)
    return { ok: false as const, status: 404, error: "Form not found" };

  const parsed = FormSchemaSchema.safeParse(form.schema);
  if (!parsed.success)
    return { ok: false as const, status: 500, error: "Form schema invalid" };

  const schema = parsed.data;
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    const v = data[field.name];

    if (field.type === "checkbox") {
      const boolVal = !!v;
      if (field.required && !boolVal) errors[field.name] = "Required";
      continue;
    }

    const str = typeof v === "string" ? v.trim() : "";

    if (field.required && !str) errors[field.name] = "Required";

    if (str) {
      if (field.minLen != null && str.length < field.minLen)
        errors[field.name] = `Min ${field.minLen}`;
      if (field.maxLen != null && str.length > field.maxLen)
        errors[field.name] = `Max ${field.maxLen}`;
      if (field.type === "email" && !/^\S+@\S+\.\S+$/.test(str))
        errors[field.name] = "Invalid email";
      if (field.type === "tel" && str.length < 7)
        errors[field.name] = "Invalid phone";
      if (
        field.type === "select" &&
        field.options?.length &&
        !field.options.includes(str)
      )
        errors[field.name] = "Invalid option";
    }
  }

  if (Object.keys(errors).length)
    return { ok: false as const, status: 400, errors };

  return {
    ok: true as const,
    message: schema.successMessage || "Thanks! We’ll get back to you soon.",
  };
}
