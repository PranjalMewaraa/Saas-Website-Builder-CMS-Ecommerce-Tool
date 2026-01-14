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

const emptyStyle = {
  container: "boxed",
  maxWidth: "xl",
  padding: { top: 24, right: 16, bottom: 24, left: 16 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  bg: { type: "none" },
  textColor: "",
  radius: 0,
  shadow: "none",
  border: { enabled: false, color: "", width: 1 },
  align: { text: "left", items: "stretch", justify: "start" },
};

export default function PresetsEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);

  const [presets, setPresets] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [style, setStyle] = useState<any>(emptyStyle);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const list = data.presets ?? [];
      setPresets(list);
      if (list.length > 0) setSelectedId(list[0]._id);
    })();
  }, [siteId]);

  const selected = useMemo(
    () => presets.find((p) => p._id === selectedId),
    [presets, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setName(selected.name || "");
    setTarget(selected.target || "");
    setStyle(selected.style || emptyStyle);
    setJsonText(JSON.stringify(selected.style || emptyStyle, null, 2));
  }, [selectedId]);

  async function savePreset() {
    const _id = selectedId || `preset_${Date.now()}`;
    await fetch(
      `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id, name, target, style }),
      }
    );
    alert("Saved preset ✅");
    // reload list
    const res = await fetch(
      `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    const list = data.presets ?? [];
    setPresets(list);
    setSelectedId(_id);
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4">
      <div className="border rounded p-3 space-y-2">
        <div className="font-medium">Presets</div>
        <button
          className="w-full border rounded px-3 py-2 text-sm"
          onClick={() => {
            const id = `preset_${Date.now()}`;
            setSelectedId(id);
            setName("New Preset");
            setTarget("");
            setStyle(emptyStyle);
            setJsonText(JSON.stringify(emptyStyle, null, 2));
          }}
          type="button"
        >
          + New Preset
        </button>

        <div className="space-y-1">
          {presets.map((p) => (
            <button
              key={p._id}
              className={`w-full text-left border rounded px-3 py-2 text-sm ${p._id === selectedId ? "bg-black text-white" : ""}`}
              onClick={() => setSelectedId(p._id)}
              type="button"
            >
              {p.name}
              <div className="text-xs opacity-70">{p._id}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm opacity-70">
            Site: <b>{siteId}</b>
          </div>
          <EditorModeToggle mode={mode} setMode={setMode} />
        </div>

        <div className="border rounded p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-sm opacity-70">Preset ID</div>
              <input
                className="border rounded p-2 w-full font-mono text-sm"
                value={selectedId}
                readOnly
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm opacity-70">Target (optional)</div>
              <input
                className="border rounded p-2 w-full"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Hero/* or Header/V1"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <div className="text-sm opacity-70">Name</div>
              <input
                className="border rounded p-2 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </div>

          {mode === "form" ? (
            <StyleForm
              value={style}
              onChange={(next) => {
                setStyle(next);
                setJsonText(JSON.stringify(next, null, 2));
              }}
            />
          ) : (
            <div className="space-y-2">
              <div className="text-sm opacity-70">Style JSON</div>
              <textarea
                className="w-full border rounded p-2 font-mono text-sm min-h-80"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
              <button
                className="border rounded px-3 py-2 text-sm"
                type="button"
                onClick={() => {
                  const parsed = safeJsonParse(jsonText);
                  if (!parsed.ok) return alert(parsed.error);
                  setStyle(parsed.value);
                }}
              >
                Apply JSON to Form
              </button>
            </div>
          )}

          <button
            className="bg-black text-white px-3 py-2 rounded"
            type="button"
            onClick={savePreset}
          >
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}

function StyleForm({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const v = value ?? {};
  const pad = v.padding ?? {};
  const bg = v.bg ?? { type: "none" };
  const border = v.border ?? { enabled: false };

  function set(path: string, newVal: any) {
    const next = structuredClone(v);
    const parts = path.split(".");
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++)
      cur = cur[parts[i]] ?? (cur[parts[i]] = {});
    cur[parts[parts.length - 1]] = newVal;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Select
          label="Container"
          value={v.container || "boxed"}
          onChange={(x: any) => set("container", x)}
          options={["boxed", "full"]}
        />
        <Select
          label="Max Width"
          value={v.maxWidth || "xl"}
          onChange={(x: any) => set("maxWidth", x)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-2">
        <NumberField
          label="Pad Top"
          value={pad.top ?? 0}
          onChange={(n: any) => set("padding.top", n)}
        />
        <NumberField
          label="Pad Right"
          value={pad.right ?? 0}
          onChange={(n: any) => set("padding.right", n)}
        />
        <NumberField
          label="Pad Bottom"
          value={pad.bottom ?? 0}
          onChange={(n: any) => set("padding.bottom", n)}
        />
        <NumberField
          label="Pad Left"
          value={pad.left ?? 0}
          onChange={(n: any) => set("padding.left", n)}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Select
          label="Background Type"
          value={bg.type || "none"}
          onChange={(x: any) => set("bg.type", x)}
          options={["none", "solid", "gradient", "image"]}
        />
        <Field
          label="Text Color"
          value={v.textColor || ""}
          onChange={(x: any) => set("textColor", x)}
          placeholder="var(--color-text) or #fff"
        />
        <Select
          label="Shadow"
          value={v.shadow || "none"}
          onChange={(x: any) => set("shadow", x)}
          options={["none", "sm", "md", "lg"]}
        />
      </div>

      {bg.type === "solid" ? (
        <Field
          label="BG Color"
          value={bg.color || ""}
          onChange={(x: any) => set("bg.color", x)}
          placeholder="var(--color-bg) or #ffffff"
        />
      ) : null}

      {bg.type === "gradient" ? (
        <div className="grid md:grid-cols-3 gap-3">
          <Field
            label="From"
            value={bg.gradient?.from || ""}
            onChange={(x: any) => set("bg.gradient.from", x)}
            placeholder="#111827"
          />
          <Field
            label="To"
            value={bg.gradient?.to || ""}
            onChange={(x: any) => set("bg.gradient.to", x)}
            placeholder="#2563EB"
          />
          <Select
            label="Direction"
            value={bg.gradient?.direction || "to-r"}
            onChange={(x: any) => set("bg.gradient.direction", x)}
            options={["to-r", "to-l", "to-b", "to-t"]}
          />
        </div>
      ) : null}

      {bg.type === "image" ? (
        <Field
          label="Image URL"
          value={bg.imageUrl || ""}
          onChange={(x: any) => set("bg.imageUrl", x)}
          placeholder="https://..."
        />
      ) : null}

      <div className="grid md:grid-cols-3 gap-3">
        <NumberField
          label="Radius"
          value={v.radius ?? 0}
          onChange={(n: any) => set("radius", n)}
        />
        <Select
          label="Text Align"
          value={v.align?.text || "left"}
          onChange={(x: any) => set("align.text", x)}
          options={["left", "center", "right"]}
        />
        <label className="flex items-center gap-2 border rounded p-2">
          <input
            type="checkbox"
            checked={!!border.enabled}
            onChange={(e) => set("border.enabled", e.target.checked)}
          />
          <span className="text-sm">Border</span>
        </label>
      </div>

      {border.enabled ? (
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label="Border Color"
            value={border.color || ""}
            onChange={(x: any) => set("border.color", x)}
            placeholder="rgba(0,0,0,0.12)"
          />
          <NumberField
            label="Border Width"
            value={border.width ?? 1}
            onChange={(n: any) => set("border.width", n)}
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: any) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <select
        className="border rounded p-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
