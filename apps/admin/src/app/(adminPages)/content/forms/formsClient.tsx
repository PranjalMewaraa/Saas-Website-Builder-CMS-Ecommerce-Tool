"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useMemo,
  useState,
} from "react";
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
    "idle"
  );
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/forms?site_id=${encodeURIComponent(siteId)}`,
        {
          cache: "no-store",
        }
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
    [forms, activeId]
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
        }
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
        description: "Check console for details.",
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p>Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="border rounded-xl bg-card shadow-sm h-fit">
        <div className="p-4 border-b bg-muted/40">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Forms</h2>
            <button
              onClick={createNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Form
            </button>
          </div>
        </div>

        <div className="p-3 space-y-1 max-h-[70vh] overflow-y-auto">
          {forms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No forms yet. Create your first one!
            </div>
          ) : (
            forms.map((f) => (
              <button
                key={f._id}
                onClick={() => setActiveId(f._id)}
                className={`
                  w-full text-left px-4 py-2.5 rounded-lg transition-colors
                  ${
                    f._id === activeId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                `}
              >
                <div className="font-medium">{f.name || "Untitled Form"}</div>
                <div className="text-xs opacity-70 font-mono truncate">
                  {f._id}
                </div>
              </button>
            ))
          )}
        </div>

        {activeId && (
          <div className="p-4 border-t text-sm">
            <a
              href={`/content/forms/submissions?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(activeId)}`}
              className="text-primary hover:underline flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              View submissions
            </a>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Form Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Site: <strong>{siteId}</strong> · Form ID:{" "}
              <strong className="font-mono">{activeId || "—"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <EditorModeToggle mode={mode} setMode={setMode} />

            <button
              onClick={save}
              disabled={saveStatus === "saving" || !activeId || !name.trim()}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                ${saveStatus === "success" ? "bg-green-600 text-white" : "bg-black text-white hover:bg-black/90"}
                disabled:opacity-60 transition-colors
              `}
            >
              {saveStatus === "saving" ? (
                <>Saving…</>
              ) : saveStatus === "success" ? (
                <>Saved ✓</>
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
          <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="font-medium text-lg mb-2">No form selected</h3>
            <p className="text-sm">
              Create a new form or select one from the list
            </p>
          </div>
        ) : (
          <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
            {/* Form Name & Success Message */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Form Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contact Us Form"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Success Message</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  <span>Schema JSON</span>
                </div>
                <textarea
                  className="w-full h-96 font-mono text-sm p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  value={schemaJson}
                  onChange={(e) => setSchemaJson(e.target.value)}
                  spellCheck={false}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const parsed = safeJsonParse(schemaJson);
                      if (!parsed.ok)
                        return toast({
                          variant: "error",
                          title: "Save failed",
                          description: parsed.error,
                        });
                      setSchema(parsed.value);
                    }}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-muted"
                  >
                    Apply JSON
                  </button>
                  <button
                    onClick={async () => {
                      const parsed = safeJsonParse(schemaJson);
                      if (!parsed.ok)
                        return toast({
                          variant: "error",
                          title: "Save failed",
                          description: parsed.error,
                        });
                      setSchema(parsed.value);
                      await save();
                    }}
                    className="px-5 py-2 bg-black text-white rounded-lg text-sm hover:bg-black/90"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Form Fields</h3>
        <button
          onClick={addField}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="border border-dashed rounded-xl p-10 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No fields yet</p>
          <p className="text-sm mt-1">
            Click "Add Field" to start building your form
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field: any, index: number) => (
            <div
              key={field.id}
              className="border rounded-xl p-5 bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div>
                    <div className="font-medium">
                      {field.label || "Unnamed field"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      name: {field.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveField(index, -1)}
                    className="p-1.5 rounded hover:bg-muted disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    title="Move down"
                    disabled={index === fields.length - 1}
                    onClick={() => moveField(index, 1)}
                    className="p-1.5 rounded hover:bg-muted disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    title="Delete field"
                    onClick={() => removeField(index)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Field Name (key)
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    value={field.name || ""}
                    onChange={(e) =>
                      updateField(index, { name: e.target.value })
                    }
                    placeholder="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Label</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={field.label || ""}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                    placeholder="Email Address"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Placeholder</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={field.placeholder || ""}
                    onChange={(e) =>
                      updateField(index, { placeholder: e.target.value })
                    }
                    placeholder="you@example.com"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!field.required}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Required</span>
                  </label>
                </div>

                {field.type === "select" && (
                  <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                    <label className="text-sm font-medium">
                      Options (comma separated)
                    </label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={(field.options || []).join(", ")}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}

                <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                  <label className="text-sm font-medium">
                    Help text (optional)
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
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

      {/* Simple live preview */}
      {fields.length > 0 && (
        <div className="border rounded-xl p-6 bg-white/60 mt-8">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Form Preview (approximate)
          </h4>
          <div className="space-y-5 max-w-xl mx-auto">
            {fields.map(
              (f: {
                id: Key | null | undefined;
                label:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactPortal
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
                required: any;
                type: string | undefined;
                placeholder: string | undefined;
                options: any;
                helpText:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactPortal
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
              }) => (
                <div key={f.id} className="space-y-1.5">
                  <label className="block text-sm font-medium">
                    {f.label}
                    {f.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 min-h-[100px] text-sm"
                      placeholder={f.placeholder}
                      disabled
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      disabled
                    >
                      <option value="">{f.placeholder || "Select..."}</option>
                      {(f.options || []).map((o: string) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder={f.placeholder}
                      disabled
                    />
                  )}
                  {f.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {f.helpText}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
