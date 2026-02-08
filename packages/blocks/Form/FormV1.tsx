"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [handle, setHandle] = useState(props.handle || "");

  useEffect(() => {
    if (props.handle) {
      setHandle(props.handle);
      return;
    }
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("storefront_handle") || "";
    if (stored) setHandle(stored);
  }, [props.handle]);

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
      handle,
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

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = { ok: res.ok };
      }

      if (!json.ok) {
        setErrors(json.errors || { _global: json.error || "Submit failed" });
        return;
      }

      setOk(json.message || "Submitted.");
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setErrors({ _global: "Submit failed" });
    } finally {
      setSubmitting(false);
    }
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
        className="mx-auto rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm"
        style={{ maxWidth: maxWidth }}
      >
        {props.title ? (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              {props.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              We’ll get back to you within 24 hours.
            </p>
          </div>
        ) : null}

        {ok ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {ok}
          </div>
        ) : null}
        {errors._global ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errors._global}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            name="_hp"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input name="_ts" type="hidden" value={Date.now()} />

          {fields.map((f: any) => (
            <div key={f.id} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {f.label}{" "}
                {f.required ? <span className="opacity-60">*</span> : null}
              </label>

              {f.type === "textarea" ? (
                <textarea
                  name={f.name}
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder={f.placeholder || ""}
                />
              ) : f.type === "select" ? (
                <select
                  name={f.name}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="">Select…</option>
                  {(f.options || []).map((o: string) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "checkbox" ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={f.name}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  <span className="text-sm text-slate-600">
                    {f.helpText || "Yes"}
                  </span>
                </label>
              ) : (
                <input
                  name={f.name}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
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
                <div className="text-xs text-slate-500">{f.helpText}</div>
              ) : null}
              {errors[f.name] ? (
                <div className="text-xs text-rose-600">{errors[f.name]}</div>
              ) : null}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting…" : props.submitText || "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}
