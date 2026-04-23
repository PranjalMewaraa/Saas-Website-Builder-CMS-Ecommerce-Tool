"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import EditorModeToggle from "../_component/EditorModeToggle";
import { useEditorMode } from "../_component/useEditorMode";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "checkbox",
] as const;

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function shortRef(value?: string) {
  if (!value) return "";
  return value.length > 10 ? value.slice(-10) : value;
}

export default function FormsClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { toast } = useUI();
  const { mode, setMode } = useEditorMode("form", urlMode, ["form", "json"]);
  const [forms, setForms] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [name, setName] = useState("");
  const [schema, setSchema] = useState<any>({ fields: [] });
  const [schemaJson, setSchemaJson] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle",
  );
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/forms?site_id=${encodeURIComponent(siteId)}`,
        {
          cache: "no-store",
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      const list = data.forms ?? [];
      setForms(list);
      if (!activeId && list.length > 0) {
        setActiveId(list[0]._id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [siteId]);

  const active = useMemo(
    () => forms.find((f) => f._id === activeId),
    [forms, activeId],
  );

  useEffect(() => {
    if (!active) return;
    setName(active.name || "");
    const s = active.draft_schema || { fields: [] };
    setSchema(s);
    setSchemaJson(JSON.stringify(s, null, 2));
  }, [active]);

  async function save() {
    if (!activeId) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(
        `/api/admin/forms?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form_id: activeId,
            name,
            draft_schema: schema,
          }),
        },
      );
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2200);
      await refresh();
    } catch (err) {
      console.error(err);
      setSaveStatus("idle");
      toast({
        variant: "error",
        title: "Save failed",
        description: "Check console.",
      });
    }
  }

  function createNew() {
    const id = `form_${Date.now()}`;
    const base = {
      fields: [
        {
          id: newId("fld"),
          name: "name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "John Doe",
        },
        {
          id: newId("fld"),
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "you@example.com",
        },
        {
          id: newId("fld"),
          name: "message",
          label: "Your Message",
          type: "textarea",
          required: true,
          placeholder: "How can we assist you?",
        },
      ],
      successMessage: "Thank you! We'll get back to you soon.",
    };

    setActiveId(id);
    setName("New Contact Form");
    setSchema(base);
    setSchemaJson(JSON.stringify(base, null, 2));

    setForms((prev) => [
      { _id: id, name: "New Contact Form", draft_schema: base },
      ...prev,
    ]);
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-lg font-medium">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Sidebar – Forms List */}
        <div className="flex h-fit flex-col rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Forms</h2>
              <button
                onClick={createNew}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Form
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {forms.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No forms created yet.
                <br />
                Start by clicking "New Form".
              </div>
            ) : (
              <div className="space-y-1">
                {forms.map((f) => (
                  <button
                    key={f._id}
                    onClick={() => setActiveId(f._id)}
                    className={`
                      group flex w-full flex-col rounded-lg px-4 py-3 text-left transition
                      ${
                        f._id === activeId
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted/70"
                      }
                    `}
                  >
                    <div className="font-medium leading-tight">
                      {f.name || "Untitled Form"}
                    </div>
                    <div className="mt-0.5 text-xs opacity-70">
                      Ref: {shortRef(f._id)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeId && (
            <div className="border-t p-4 text-sm">
              <a
                href={`/content/forms/submissions?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(activeId)}`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View submissions
              </a>
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Form Builder
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Site: <strong>{siteId}</strong> · Form:{" "}
                <strong>{active?.name || "—"}</strong>
                {activeId ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (Ref: {shortRef(activeId)})
                  </span>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <EditorModeToggle mode={mode} setMode={setMode} />

              <button
                onClick={save}
                disabled={saveStatus === "saving" || !activeId || !name.trim()}
                className={`
                  inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition
                  ${
                    saveStatus === "success"
                      ? "bg-green-600 text-white"
                      : saveStatus === "saving"
                        ? "bg-primary/80 text-white cursor-wait"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }
                  disabled:opacity-60
                `}
              >
                {saveStatus === "saving" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {saveStatus === "saving" ? (
                  "Saving..."
                ) : saveStatus === "success" ? (
                  "Saved ✓"
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </>
                )}
              </button>
            </div>
          </div>

          {!activeId ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
              <FileText className="mb-4 h-14 w-14 text-muted-foreground/50" />
              <h3 className="text-xl font-medium">No form selected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a form from the list or create a new one
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm p-6 lg:p-8 space-y-8">
              {/* Name + Success Message */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Form Name</label>
                  <input
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contact Form"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Success Message</label>
                  <input
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={schema.successMessage || ""}
                    onChange={(e) =>
                      setSchema({ ...schema, successMessage: e.target.value })
                    }
                    placeholder="Thank you! We'll get back to you soon."
                  />
                </div>
              </div>

              {mode === "json" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Schema (JSON)</span>
                  </div>
                  <textarea
                    className="h-96 w-full rounded-lg border bg-background p-4 font-mono text-sm shadow-inner focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={schemaJson}
                    onChange={(e) => setSchemaJson(e.target.value)}
                    spellCheck={false}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const parsed = safeJsonParse(schemaJson);
                        if (!parsed.ok) {
                          toast({
                            variant: "error",
                            title: "Invalid JSON",
                            description: parsed.error,
                          });
                          return;
                        }
                        setSchema(parsed.value);
                      }}
                      className="rounded-lg border px-5 py-2.5 text-sm hover:bg-muted"
                    >
                      Apply Changes
                    </button>
                    <button
                      onClick={async () => {
                        const parsed = safeJsonParse(schemaJson);
                        if (!parsed.ok) {
                          toast({
                            variant: "error",
                            title: "Invalid JSON",
                            description: parsed.error,
                          });
                          return;
                        }
                        setSchema(parsed.value);
                        await save();
                      }}
                      className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
              ) : (
                <FormSchemaForm
                  schema={schema}
                  onChange={(next) => {
                    setSchema(next);
                    setSchemaJson(JSON.stringify(next, null, 2));
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormSchemaForm({
  schema,
  onChange,
}: {
  schema: any;
  onChange: (s: any) => void;
}) {
  const fields = schema.fields ?? [];

  function updateField(index: number, patch: Partial<any>) {
    const next = structuredClone(schema);
    next.fields[index] = { ...next.fields[index], ...patch };
    onChange(next);
  }

  function addField() {
    const next = structuredClone(schema);
    next.fields.push({
      id: newId("fld"),
      name: `field_${next.fields.length + 1}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
    });
    onChange(next);
  }

  function removeField(index: number) {
    const next = structuredClone(schema);
    next.fields.splice(index, 1);
    onChange(next);
  }

  function moveField(index: number, direction: -1 | 1) {
    const next = structuredClone(schema);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= next.fields.length) return;
    [next.fields[index], next.fields[newIndex]] = [
      next.fields[newIndex],
      next.fields[index],
    ];
    onChange(next);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight">Form Fields</h3>
        <button
          onClick={addField}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
          <p className="text-lg font-medium">No fields yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first field to start building the form
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {fields.map((field: any, index: number) => (
            <div
              key={field.id}
              className="group relative rounded-xl border bg-muted/30 p-6 shadow-sm transition hover:border-primary/40 hover:bg-muted/50"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex flex-1 items-center gap-4">
                  <GripVertical className="h-6 w-6 cursor-grab text-muted-foreground/70" />
                  <div>
                    <div className="font-semibold">
                      {field.label || "Unnamed"}
                    </div>
                    <div className="mt-0.5 text-xs font-mono text-muted-foreground">
                      key: {field.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveField(index, -1)}
                    className="rounded p-2 hover:bg-muted disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    title="Move down"
                    disabled={index === fields.length - 1}
                    onClick={() => moveField(index, 1)}
                    className="rounded p-2 hover:bg-muted disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => removeField(index)}
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field Key</label>
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={field.name || ""}
                    onChange={(e) =>
                      updateField(index, { name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Label</label>
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={field.label || ""}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={field.type || "text"}
                    onChange={(e) =>
                      updateField(index, { type: e.target.value })
                    }
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Placeholder</label>
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={field.placeholder || ""}
                    onChange={(e) =>
                      updateField(index, { placeholder: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!field.required}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Required</span>
                  </label>
                </div>

                {field.type === "select" && (
                  <div className="col-span-2 lg:col-span-3 space-y-2">
                    <label className="text-sm font-medium">
                      Options (comma separated)
                    </label>
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={(field.options || []).join(", ")}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Yes, No, Maybe"
                    />
                  </div>
                )}

                <div className="col-span-2 lg:col-span-3 space-y-2">
                  <label className="text-sm font-medium">
                    Help text / description
                  </label>
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={field.helpText || ""}
                    onChange={(e) =>
                      updateField(index, { helpText: e.target.value })
                    }
                    placeholder="We'll never share your email."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Preview */}
      {fields.length > 0 && (
        <div className="mt-12 rounded-xl border bg-gradient-to-b from-white to-gray-50/80 p-8 shadow-sm">
          <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Live Form Preview
          </h4>

          <div className="mx-auto max-w-2xl space-y-6 rounded-lg border bg-white p-8 shadow">
            {fields.map((f: any) => (
              <div key={f.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {f.label}
                  {f.required && <span className="ml-1 text-red-500">*</span>}
                </label>

                {f.type === "textarea" ? (
                  <textarea
                    className="h-28 w-full rounded-lg border bg-background px-4 py-2.5 text-sm shadow-sm"
                    placeholder={f.placeholder}
                    disabled
                  />
                ) : f.type === "select" ? (
                  <select
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm shadow-sm"
                    disabled
                  >
                    <option value="">
                      {f.placeholder || "Choose an option..."}
                    </option>
                    {(f.options || []).map((o: string) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm shadow-sm"
                    placeholder={f.placeholder}
                    disabled
                  />
                )}

                {f.helpText && (
                  <p className="text-xs text-muted-foreground">{f.helpText}</p>
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                disabled
                className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground opacity-70"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
