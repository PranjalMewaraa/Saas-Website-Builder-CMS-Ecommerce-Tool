"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import StylePreviewCard from "./StylePreviewCard";
import { BlockPropsForm } from "../pages/edit/components/BlocksPropForm";
import ColorPickerInput from "./ColorPickerInput";
import ImageField from "./ImageField";

/* small local UI helpers */

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <input
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm 
                   transition-all duration-200 placeholder:text-slate-400
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function UnitField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: any;
  onChange: (val: string | number) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value ?? "");
  const [unit, setUnit] = useState("px");

  useEffect(() => {
    const v = value ?? "";
    setText(v);
    const m = String(v)
      .trim()
      .match(/(px|%|em|rem|vh|vw)$/);
    if (m) setUnit(m[1]);
  }, [value]);

  function parseAndEmit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    if (trimmed === "auto") {
      onChange("auto");
      return;
    }
    const match = trimmed.match(/^(-?\d+(?:\.\d+)?)(px|%|em|rem|vh|vw)$/);
    if (match) {
      onChange(`${match[1]}${match[2]}`);
      return;
    }
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      onChange(num);
      return;
    }
    onChange(trimmed);
  }

  function onUnitChange(nextUnit: string) {
    setUnit(nextUnit);
    const current = String(text || "").trim();
    if (!current || current === "auto") {
      onChange(current);
      return;
    }
    const numMatch = current.match(/^(-?\d+(?:\.\d+)?)(?:px|%|em|rem|vh|vw)?$/);
    if (numMatch) {
      const next = `${numMatch[1]}${nextUnit}`;
      setText(next);
      onChange(next);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <div className="group flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <input
          className="w-full px-3 py-2 text-sm font-mono focus:outline-none placeholder:text-slate-400"
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            const m = next.trim().match(/(px|%|em|rem|vh|vw)$/);
            if (m) setUnit(m[1]);
            parseAndEmit(next);
          }}
          placeholder={placeholder}
        />
        <div className="relative flex items-center border-l border-slate-100 bg-slate-50/50 px-1 hover:bg-slate-100 transition-colors">
          <select
            className="appearance-none bg-transparent pl-2 pr-6 py-1 text-[10px] font-bold text-slate-500 cursor-pointer focus:outline-none"
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
          >
            {["px", "%", "em", "rem", "vh", "vw"].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            className="absolute right-2 pointer-events-none text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}

// 3. Text Area
export function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <textarea
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[100px]
                   transition-all duration-200 resize-y
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// 4. Number Field
export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <input
        type="number"
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm 
                   transition-all duration-200
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={Number.isNaN(value) ? 0 : value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700 ml-0.5">
        {label}
      </label>
      <div className="relative group min-w-0">
        <select
          className="w-full min-w-0 appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm 
                     transition-all duration-200 outline-none
                     hover:border-slate-400
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => {
            const optLabel = typeof o === "string" ? o : o.label;
            const optValue = typeof o === "string" ? o : o.value;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        {/* Custom Chevron for a more premium feel */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
          <ChevronDown size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
function Checkbox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="group flex items-center gap-3 cursor-pointer select-none">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 
                     bg-white transition-all checked:bg-blue-600 checked:border-blue-600
                     focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {/* The checkmark icon that appears when checked */}
        <svg
          className="absolute h-3.5 w-3.5 inset-x-0.5 pointer-events-none hidden peer-checked:block text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
        {label}
      </span>
    </label>
  );
}

/* ---------------- component ---------------- */

export function VisualInspector({
  block,
  siteId,
  assetsMap,
  forms,
  menus,
  themePalette = [],
  onDeleteBlock,
  onChange,
}: any) {
  const [openGroup, setOpenGroup] = useState<string>("layout");

  /* -------- props helpers -------- */

  function setProp(key: string, val: any) {
    const next = structuredClone(block);
    next.props = next.props ?? {};
    next.props[key] = val;
    onChange(next);
  }

  function setProps(nextProps: any) {
    const next = structuredClone(block);
    next.props = nextProps ?? {};
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

  function setStyleOverrides(overrides: any) {
    const next = structuredClone(block);
    next.style = next.style ?? { overrides: {} };
    next.style.overrides = { ...(next.style.overrides || {}), ...overrides };
    onChange(next);
  }

  function replaceStyleOverrides(overrides: any) {
    const next = structuredClone(block);
    next.style = next.style ?? { overrides: {} };
    next.style.overrides = { ...(overrides || {}) };
    onChange(next);
  }

  function setPreset(id: string) {
    const next = structuredClone(block);
    next.style = { ...next.style, presetId: id || undefined };
    onChange(next);
  }

  const overrides = block?.style?.overrides ?? {};
  const display = overrides.display ?? "block";

  const previewStyle = useMemo(() => overrides, [overrides]);

  /* ---------------- UI ---------------- */

  if (!block) {
    return (
      <div className="text-muted-foreground text-sm">
        Select a block to edit
      </div>
    );
  }

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: ReactNode;
  }) => {
    const isOpen = openGroup === id;
    return (
      <div className="border-gray-100 rounded-lg bg-white ">
        <button
          type="button"
          onClick={() => setOpenGroup(isOpen ? "" : id)}
          className="w-full px-3 py-2 text-left text-sm font-bold flex items-center justify-between"
        >
          <span>{title}</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isOpen ? <div className="px-3 pb-3">{children}</div> : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Content & Structure</h3>
        {onDeleteBlock && (
          <button
            className="text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded"
            onClick={() => onDeleteBlock(block.id)}
            type="button"
          >
            Delete Block
          </button>
        )}
      </div>

      <BlockPropsForm
        type={block.type}
        props={block.props}
        setProp={setProp}
        setProps={setProps}
        setStyleOverrides={setStyleOverrides}
        replaceStyleOverrides={replaceStyleOverrides}
        setPropPath={setPropPath}
        siteId={siteId}
        assetsMap={assetsMap}
        forms={forms}
        menus={menus}
      />

      {/* -------- appearance -------- */}

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-medium">Design & Styling</h3>

        <>
          <Section id="layout" title="Layout & Alignment">
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Display"
                  value={display}
                  onChange={(v: string) => setStyle("display", v)}
                  options={["block", "flex", "grid"]}
                />
                <Select
                  label="Text Align"
                  value={overrides.align?.text ?? "left"}
                  onChange={(v: string) => setStyle("align.text", v)}
                  options={["left", "center", "right"]}
                />
              </div>

              {display === "flex" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Direction"
                      value={overrides.flexDirection ?? "row"}
                      onChange={(v: string) => setStyle("flexDirection", v)}
                      options={["row", "column"]}
                    />
                    <Select
                      label="Wrap"
                      value={overrides.flexWrap ?? "nowrap"}
                      onChange={(v: string) => setStyle("flexWrap", v)}
                      options={["nowrap", "wrap"]}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Align Items"
                      value={overrides.align?.items ?? "stretch"}
                      onChange={(v: string) => setStyle("align.items", v)}
                      options={["start", "center", "end", "stretch"]}
                    />
                    <Select
                      label="Justify Content"
                      value={overrides.align?.justify ?? "start"}
                      onChange={(v: string) => setStyle("align.justify", v)}
                      options={["start", "center", "end", "between"]}
                    />
                  </div>
                  <NumberField
                    label="Gap"
                    value={overrides.gap ?? 0}
                    onChange={(n: number) => setStyle("gap", n)}
                  />
                </>
              ) : null}

              {display === "grid" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <NumberField
                      label="Grid Columns"
                      value={overrides.gridColumns ?? 1}
                      onChange={(n: number) => setStyle("gridColumns", n)}
                    />
                    <NumberField
                      label="Grid Rows"
                      value={overrides.gridRows ?? 1}
                      onChange={(n: number) => setStyle("gridRows", n)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Align Items"
                      value={overrides.align?.items ?? "stretch"}
                      onChange={(v: string) => setStyle("align.items", v)}
                      options={["start", "center", "end", "stretch"]}
                    />
                    <Select
                      label="Justify Content"
                      value={overrides.align?.justify ?? "start"}
                      onChange={(v: string) => setStyle("align.justify", v)}
                      options={["start", "center", "end", "between"]}
                    />
                  </div>
                  <NumberField
                    label="Gap"
                    value={overrides.gap ?? 0}
                    onChange={(n: number) => setStyle("gap", n)}
                  />
                </>
              ) : null}
            </div>
          </Section>

          <Section id="size" title="Size & Spacing">
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Container"
                  value={overrides.container ?? "boxed"}
                  onChange={(v: string) => setStyle("container", v)}
                  options={["boxed", "full"]}
                />
                <Select
                  label="Max Width"
                  value={overrides.maxWidth ?? "xl"}
                  onChange={(v: string) => setStyle("maxWidth", v)}
                  options={["sm", "md", "lg", "xl", "2xl"]}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                  <NumberField
                    key={side}
                    label={`Padding ${side.toUpperCase()}`}
                    value={overrides.padding?.[side] ?? 0}
                    onChange={(n: number) => setStyle(`padding.${side}`, n)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                  <NumberField
                    key={side}
                    label={`Margin ${side.toUpperCase()}`}
                    value={overrides.margin?.[side] ?? 0}
                    onChange={(n: number) => setStyle(`margin.${side}`, n)}
                  />
                ))}
              </div>
            </div>
          </Section>

          <Section id="typography" title="Typography">
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumberField
                  label="Font Size"
                  value={overrides.fontSize ?? 16}
                  onChange={(n: number) => setStyle("fontSize", n)}
                />
                <NumberField
                  label="Font Weight"
                  value={overrides.fontWeight ?? 400}
                  onChange={(n: number) => setStyle("fontWeight", n)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumberField
                  label="Line Height"
                  value={overrides.lineHeight ?? 24}
                  onChange={(n: number) => setStyle("lineHeight", n)}
                />
                <NumberField
                  label="Letter Spacing"
                  value={overrides.letterSpacing ?? 0}
                  onChange={(n: number) => setStyle("letterSpacing", n)}
                />
              </div>
              <Select
                label="Text Transform"
                value={overrides.textTransform ?? "none"}
                onChange={(v: string) => setStyle("textTransform", v)}
                options={["none", "uppercase", "lowercase", "capitalize"]}
              />
            </div>
          </Section>

          <Section id="color" title="Color & Border">
            <div className="mt-3 space-y-3">
              <ColorPickerInput
                label="Text Color"
                value={overrides.textColor ?? ""}
                onChange={(v: string) => setStyle("textColor", v)}
                placeholder="#111111"
                palette={themePalette}
              />
              <Checkbox
                label="Enable Border"
                value={!!overrides.border?.enabled}
                onChange={(v: boolean) => setStyle("border.enabled", v)}
              />
              <div className="grid grid-cols-1 gap-3">
                <ColorPickerInput
                  label="Border Color"
                  value={overrides.border?.color ?? ""}
                  onChange={(v: string) => setStyle("border.color", v)}
                  placeholder="#e5e7eb"
                  palette={themePalette}
                />
                <NumberField
                  label="Border Width"
                  value={overrides.border?.width ?? 1}
                  onChange={(n: number) => setStyle("border.width", n)}
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
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
            </div>
          </Section>

          <Section id="background" title="Background">
            <div className="mt-3 space-y-3">
              <Select
                label="Type"
                value={overrides.bg?.type ?? "none"}
                onChange={(v: string) => setStyle("bg.type", v)}
                options={["none", "solid", "gradient", "image"]}
              />

              {overrides.bg?.type === "solid" && (
                <ColorPickerInput
                  label="Color"
                  value={overrides.bg?.color ?? ""}
                  onChange={(v: string) => setStyle("bg.color", v)}
                  placeholder="#ffffff"
                  palette={themePalette}
                />
              )}

              {overrides.bg?.type === "gradient" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ColorPickerInput
                    label="From"
                    value={overrides.bg?.gradient?.from ?? ""}
                    onChange={(v: string) => setStyle("bg.gradient.from", v)}
                    placeholder="#0f172a"
                    palette={themePalette}
                  />
                  <ColorPickerInput
                    label="To"
                    value={overrides.bg?.gradient?.to ?? ""}
                    onChange={(v: string) => setStyle("bg.gradient.to", v)}
                    placeholder="#38bdf8"
                    palette={themePalette}
                  />
                  <Select
                    label="Direction"
                    value={overrides.bg?.gradient?.direction ?? "to-r"}
                    onChange={(v: string) =>
                      setStyle("bg.gradient.direction", v)
                    }
                    options={["to-r", "to-l", "to-b", "to-t"]}
                  />
                </div>
              )}

              {overrides.bg?.type === "image" && (
                <div className="space-y-3">
                  <ImageField
                    siteId={siteId}
                    label="Background Image"
                    assetIdValue={overrides.bg?.imageAssetId || ""}
                    altValue=""
                    assetsMap={assetsMap}
                    onChangeAssetId={(v: any) => setStyle("bg.imageAssetId", v)}
                    onChangeAssetUrl={(v: any) => setStyle("bg.imageUrl", v)}
                    onChangeAlt={() => {}}
                  />
                  <ColorPickerInput
                    label="Overlay Color"
                    value={overrides.bg?.overlayColor ?? ""}
                    onChange={(v: string) => setStyle("bg.overlayColor", v)}
                    placeholder="rgba(0,0,0,0.4)"
                    palette={themePalette}
                  />
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium">Overlay Opacity</div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={overrides.bg?.overlayOpacity ?? 0.35}
                      onChange={(e) =>
                        setStyle("bg.overlayOpacity", Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="text-xs text-right text-muted-foreground">
                      {(overrides.bg?.overlayOpacity ?? 0.35).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </>

        <StylePreviewCard style={previewStyle} title="Live Style Preview" />
      </div>
    </div>
  );
}
