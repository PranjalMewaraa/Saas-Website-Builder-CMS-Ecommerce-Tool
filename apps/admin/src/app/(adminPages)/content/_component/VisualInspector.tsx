"use client";

import { useMemo } from "react";
import { BlockPropsForm } from "../pages/edit/pageEditorClient";
import StylePreviewCard from "./StylePreviewCard";

/* small local UI helpers */

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <select
        className="w-full border rounded-lg px-3 py-2 text-sm"
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

/* ---------------- component ---------------- */

export function VisualInspector({
  block,
  siteId,
  assetsMap,
  forms,
  onChange,
}: any) {
  if (!block) {
    return (
      <div className="text-muted-foreground text-sm">
        Select a block to edit
      </div>
    );
  }

  /* -------- props helpers -------- */

  function setProp(key: string, val: any) {
    const next = structuredClone(block);
    next.props = next.props ?? {};
    next.props[key] = val;
    onChange(next);
  }

  function setPropPath(path: string, val: any) {
    const next = structuredClone(block);
    next.props = next.props || {};
    const parts = path.split(".");
    let cur = next.props;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]] ??= {};
    }
    cur[parts.at(-1)!] = val;
    onChange(next);
  }

  /* -------- style helpers -------- */

  function setStyle(path: string, val: any) {
    const next = structuredClone(block);
    next.style = next.style ?? { overrides: {} };
    next.style.overrides = next.style.overrides ?? {};

    const parts = path.split(".");
    let cur = next.style.overrides;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]] = cur[parts[i]] ?? {};
    }
    cur[parts.at(-1)!] = val;

    onChange(next);
  }

  function setPreset(id: string) {
    const next = structuredClone(block);
    next.style = { ...next.style, presetId: id || undefined };
    onChange(next);
  }

  const overrides = block.style?.overrides ?? {};

  const previewStyle = useMemo(() => overrides, [overrides]);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Block Properties</h3>

      <BlockPropsForm
        type={block.type}
        props={block.props}
        setProp={setProp}
        setPropPath={setPropPath}
        siteId={siteId}
        assetsMap={assetsMap}
        forms={forms}
      />

      {/* -------- appearance -------- */}

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-medium">Appearance & Style</h3>

        <div className="grid grid-cols-2 gap-3">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <NumberField
              key={side}
              label={`Padding ${side.toUpperCase()}`}
              value={overrides.padding?.[side] ?? 0}
              onChange={(n: number) => setStyle(`padding.${side}`, n)}
            />
          ))}
        </div>

        <Field
          label="Background Color"
          value={overrides.bg?.color ?? ""}
          onChange={(v: string) => {
            if (!v) {
              setStyle("bg", { type: "none" });
            } else {
              setStyle("bg", {
                ...(overrides.bg ?? {}),
                type: "solid",
                color: v,
              });
            }
          }}
        />

        <Field
          label="Text Color"
          value={overrides.textColor ?? ""}
          onChange={(v: string) => setStyle("textColor", v)}
          placeholder="#111111"
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Border Radius"
            value={overrides.radius ?? 0}
            onChange={(n: number) => setStyle("radius", n)}
          />

          <Select
            label="Shadow"
            value={overrides.shadow ?? "none"}
            onChange={(v: string) => setStyle("shadow", v)}
            options={["none", "sm", "md", "lg"]}
          />
        </div>

        <StylePreviewCard style={previewStyle} title="Live Style Preview" />
      </div>
    </div>
  );
}
