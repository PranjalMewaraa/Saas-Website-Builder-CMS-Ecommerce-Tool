"use client";

import { useEffect, useMemo, useState } from "react";
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
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function FormsClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);

  const [forms, setForms] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [name, setName] = useState("");
  const [schema, setSchema] = useState<any>({
    fields: [
      { id: "f1", name: "name", label: "Name", type: "text", required: true },
    ],
  });
  const [schemaJson, setSchemaJson] = useState("");

  async function refresh() {
    const res = await fetch(
      `/api/admin/forms?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    const list = data.forms ?? [];
    setForms(list);
    if (!activeId && list.length) setActiveId(list[0]._id);
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
    setSchema(active.draft_schema || { fields: [] });
    setSchemaJson(
      JSON.stringify(active.draft_schema || { fields: [] }, null, 2)
    );
  }, [activeId]);

  async function save() {
    await fetch(`/api/admin/forms?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form_id: activeId,
        name,
        draft_schema: schema,
      }),
    });
    alert("Saved form draft ✅");
    await refresh();
  }

  function createNew() {
    const id = `form_${Date.now()}`;
    setActiveId(id);
    setName("New Form");
    const base = {
      fields: [
        {
          id: newId("fld"),
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          placeholder: "Your name",
        },
        {
          id: newId("fld"),
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "you@example.com",
        },
        {
          id: newId("fld"),
          name: "message",
          label: "Message",
          type: "textarea",
          required: true,
          placeholder: "How can we help?",
        },
      ],
      successMessage: "Thanks! We will contact you soon.",
    };
    setSchema(base);
    setSchemaJson(JSON.stringify(base, null, 2));
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4">
      <div className="border rounded p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">Forms</div>
          <button
            className="border rounded px-2 py-1 text-sm"
            type="button"
            onClick={createNew}
          >
            + New
          </button>
        </div>

        <div className="space-y-1">
          {forms.map((f) => (
            <button
              key={f._id}
              className={`w-full text-left border rounded px-3 py-2 text-sm ${f._id === activeId ? "bg-black text-white" : ""}`}
              type="button"
              onClick={() => setActiveId(f._id)}
            >
              {f.name}
              <div className="text-xs opacity-70">{f._id}</div>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <a
            className="text-sm underline"
            href={`/content/forms/submissions?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(activeId)}`}
          >
            View submissions →
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm opacity-70">
            Site: <b>{siteId}</b> · Form: <b>{activeId || "(none)"}</b>
          </div>
          <EditorModeToggle mode={mode as any} setMode={setMode as any} />
        </div>

        <div className="border rounded p-4 space-y-3">
          <label className="space-y-1 block">
            <div className="text-sm opacity-70">Form name</div>
            <input
              className="border rounded p-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {mode === "json" ? (
            <div className="space-y-2">
              <div className="text-sm opacity-70">Schema JSON</div>
              <textarea
                className="w-full border rounded p-2 font-mono text-sm min-h-[320px]"
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="border rounded px-3 py-2 text-sm"
                  type="button"
                  onClick={() => {
                    const parsed = safeJsonParse(schemaJson);
                    if (!parsed.ok) return alert(parsed.error);
                    setSchema(parsed.value);
                  }}
                >
                  Apply JSON to Form
                </button>
                <button
                  className="bg-black text-white rounded px-3 py-2 text-sm"
                  type="button"
                  onClick={async () => {
                    const parsed = safeJsonParse(schemaJson);
                    if (!parsed.ok) return alert(parsed.error);
                    setSchema(parsed.value);
                    await save();
                  }}
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

          <button
            className="bg-black text-white rounded px-3 py-2"
            type="button"
            onClick={save}
            disabled={!activeId}
          >
            Save Draft
          </button>

          <div className="text-xs opacity-60">
            Use this form in page builder by adding a <b>Form/V1</b> block with{" "}
            <b>formId = {activeId}</b>.
          </div>
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

  function setField(i: number, patch: any) {
    const next = structuredClone(schema);
    next.fields[i] = { ...next.fields[i], ...patch };
    onChange(next);
  }

  function addField() {
    const next = structuredClone(schema);
    next.fields.push({
      id: newId("fld"),
      name: `field_${next.fields.length + 1}`,
      label: "New field",
      type: "text",
      required: false,
    });
    onChange(next);
  }

  function removeField(i: number) {
    const next = structuredClone(schema);
    next.fields.splice(i, 1);
    onChange(next);
  }

  function move(i: number, dir: -1 | 1) {
    const next = structuredClone(schema);
    const j = i + dir;
    if (j < 0 || j >= next.fields.length) return;
    [next.fields[i], next.fields[j]] = [next.fields[j], next.fields[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <label className="space-y-1 block">
        <div className="text-sm opacity-70">Success message</div>
        <input
          className="border rounded p-2 w-full"
          value={schema.successMessage || ""}
          onChange={(e) =>
            onChange({ ...schema, successMessage: e.target.value })
          }
          placeholder="Thanks! We'll contact you soon."
        />
      </label>

      <div className="font-medium text-sm">Fields</div>

      <div className="space-y-3">
        {fields.map((f: any, i: number) => (
          <div key={f.id} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{f.label || "Field"}</div>
              <div className="flex gap-2">
                <button
                  className="border rounded px-2 py-1 text-sm"
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>
                <button
                  className="border rounded px-2 py-1 text-sm"
                  type="button"
                  disabled={i === fields.length - 1}
                  onClick={() => move(i, +1)}
                >
                  ↓
                </button>
                <button
                  className="border rounded px-2 py-1 text-sm"
                  type="button"
                  onClick={() => removeField(i)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <input
                className="border rounded p-2"
                value={f.name || ""}
                onChange={(e) => setField(i, { name: e.target.value })}
                placeholder="name (key)"
              />
              <input
                className="border rounded p-2"
                value={f.label || ""}
                onChange={(e) => setField(i, { label: e.target.value })}
                placeholder="label"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-2 items-center">
              <select
                className="border rounded p-2"
                value={f.type || "text"}
                onChange={(e) => setField(i, { type: e.target.value })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 border rounded p-2">
                <input
                  type="checkbox"
                  checked={!!f.required}
                  onChange={(e) => setField(i, { required: e.target.checked })}
                />
                <span className="text-sm">Required</span>
              </label>

              <input
                className="border rounded p-2"
                value={f.placeholder || ""}
                onChange={(e) => setField(i, { placeholder: e.target.value })}
                placeholder="placeholder"
              />
            </div>

            <input
              className="border rounded p-2 w-full"
              value={f.helpText || ""}
              onChange={(e) => setField(i, { helpText: e.target.value })}
              placeholder="help text (optional)"
            />

            {f.type === "select" ? (
              <input
                className="border rounded p-2 w-full"
                value={(f.options || []).join(", ")}
                onChange={(e) =>
                  setField(i, {
                    options: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="options (comma separated)"
              />
            ) : null}
          </div>
        ))}
      </div>

      <button
        className="border rounded px-3 py-2 text-sm"
        type="button"
        onClick={addField}
      >
        + Add field
      </button>
    </div>
  );
}
