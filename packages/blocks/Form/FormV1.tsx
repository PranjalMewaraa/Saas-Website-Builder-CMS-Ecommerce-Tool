"use client";

import { useMemo, useState } from "react";

export default function FormV1(props: {
  handle: string;
  previewToken?: string; // only for preview mode
  formId: string;
  title?: string;
  submitText?: string;
  contentWidth?: string;
  schema: any;
  mode?: "published" | "preview" | "builder";
}) {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = useMemo(() => props.schema?.fields ?? [], [props.schema]);
  const endpoint =
    props.mode === "preview"
      ? "/api/forms/submit-preview"
      : "/api/forms/submit";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setOk("");
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const data: Record<string, any> = {};

    for (const f of fields) {
      if (f.type === "checkbox") data[f.name] = fd.get(f.name) === "on";
      else data[f.name] = String(fd.get(f.name) || "");
    }

    const hp = String(fd.get("_hp") || "");
    const ts = Number(fd.get("_ts") || 0) || Date.now();

    const payload: any = {
      handle: props.handle,
      form_id: props.formId,
      data,
      hp,
    };
    payload.ts = ts;

    if (props.mode === "preview") payload.token = props.previewToken;
    if (props.mode === "builder") {
      setOk("Builder preview: submission is disabled.");
      setSubmitting(false);
      return;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!json.ok) {
      setErrors(json.errors || { _global: json.error || "Submit failed" });
      setSubmitting(false);
      return;
    }

    setOk(json.message || "Submitted.");
    (e.currentTarget as HTMLFormElement).reset();
    setSubmitting(false);
  }
  const maxWidth =
    props.contentWidth === "sm"
      ? "640px"
      : props.contentWidth === "md"
        ? "768px"
        : props.contentWidth === "lg"
          ? "1024px"
          : props.contentWidth === "xl"
            ? "1280px"
            : props.contentWidth === "2xl"
              ? "1536px"
              : "1280px";

  return (
    <section>
      <div
        className="mx-auto px-4 py-8 border rounded-xl"
        style={{ maxWidth: maxWidth }}
      >
        {props.title ? (
          <h2 className="text-xl font-semibold">{props.title}</h2>
        ) : null}

        {ok ? (
          <div className="mt-3 text-sm border rounded p-2 bg-green-50">
            {ok}
          </div>
        ) : null}
        {errors._global ? (
          <div className="mt-3 text-sm border rounded p-2 bg-red-50">
            {errors._global}
          </div>
        ) : null}

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            name="_hp"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input name="_ts" type="hidden" value={Date.now()} />

          {fields.map((f: any) => (
            <div key={f.id} className="space-y-1">
              <label className="text-sm opacity-80">
                {f.label}{" "}
                {f.required ? <span className="opacity-60">*</span> : null}
              </label>

              {f.type === "textarea" ? (
                <textarea
                  name={f.name}
                  className="border rounded p-2 w-full"
                  placeholder={f.placeholder || ""}
                />
              ) : f.type === "select" ? (
                <select name={f.name} className="border rounded p-2 w-full">
                  <option value="">Select…</option>
                  {(f.options || []).map((o: string) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "checkbox" ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" name={f.name} />
                  <span className="text-sm">{f.helpText || "Yes"}</span>
                </label>
              ) : (
                <input
                  name={f.name}
                  className="border rounded p-2 w-full"
                  placeholder={f.placeholder || ""}
                  type={
                    f.type === "email"
                      ? "email"
                      : f.type === "tel"
                        ? "tel"
                        : "text"
                  }
                />
              )}

              {f.helpText && f.type !== "checkbox" ? (
                <div className="text-xs opacity-60">{f.helpText}</div>
              ) : null}
              {errors[f.name] ? (
                <div className="text-xs text-red-600">{errors[f.name]}</div>
              ) : null}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white rounded px-4 py-2"
          >
            {submitting ? "Submitting…" : props.submitText || "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}
