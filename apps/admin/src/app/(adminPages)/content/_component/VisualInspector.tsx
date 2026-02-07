"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import StylePreviewCard from "./StylePreviewCard";
import { BlockPropsForm } from "../pages/edit/components/BlocksPropForm";
import ColorPickerInput from "./ColorPickerInput";
import ImageField from "./ImageField";

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

function Checkbox({ label, value, onChange }: any) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
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
  const [openGroup, setOpenGroup] = useState<string>("size");

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
      <div className="border rounded-lg bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setOpenGroup(isOpen ? "" : id)}
          className="w-full px-3 py-2 text-left text-sm font-medium flex items-center justify-between"
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
        <h3 className="font-medium">Block Properties</h3>
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
        setPropPath={setPropPath}
        siteId={siteId}
        assetsMap={assetsMap}
        forms={forms}
        menus={menus}
      />

      {/* -------- appearance -------- */}

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-medium">Appearance & Style</h3>

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
                  onChange={(v: string) => setStyle("bg.gradient.direction", v)}
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
        </>

        <StylePreviewCard style={previewStyle} title="Live Style Preview" />
      </div>
    </div>
  );
}
