"use client";

import React from "react";
import ImageField from "./ImageField";
import {
  type LayoutSelection,
  type LayoutSectionProps,
  type LayoutAtomicBlock,
  createDefaultSectionProps,
  createDefaultCol,
} from "./layout-utils";
import { ROW_PRESET_OPTIONS } from "../../../../../../../packages/renderer/layout-section";

const ROW_PRESET_PREVIEWS: Record<
  string,
  { label: string; template: string; cols: number }
> = {
  "1-col": { label: "1 Column", template: "minmax(0, 1fr)", cols: 1 },
  "2-col": {
    label: "2 Columns",
    template: "repeat(2, minmax(0, 1fr))",
    cols: 2,
  },
  "3-col": {
    label: "3 Columns",
    template: "repeat(3, minmax(0, 1fr))",
    cols: 3,
  },
  "sidebar-left": {
    label: "Sidebar Left",
    template: "minmax(0, 1fr) minmax(0, 2fr)",
    cols: 2,
  },
  "sidebar-right": {
    label: "Sidebar Right",
    template: "minmax(0, 2fr) minmax(0, 1fr)",
    cols: 2,
  },
  "three-uneven": {
    label: "3 Uneven",
    template: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
    cols: 3,
  },
};

const TEXT_STYLE_PRESETS: Record<
  string,
  { label: string; style: Record<string, any> }
> = {
  body: { label: "Body", style: { fontSize: 16, lineHeight: 24 } },
  subheading: {
    label: "Subheading",
    style: { fontSize: 18, lineHeight: 26, fontWeight: 500 },
  },
  heading: {
    label: "Heading",
    style: { fontSize: 32, lineHeight: 40, fontWeight: 700 },
  },
  eyebrow: {
    label: "Eyebrow",
    style: {
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: 600,
    },
  },
};

const BUTTON_STYLE_PRESETS: Record<
  string,
  { label: string; style: Record<string, any> }
> = {
  primary: {
    label: "Primary",
    style: {
      bgColor: "#111827",
      textColor: "#ffffff",
      padding: { top: 10, right: 18, bottom: 10, left: 18 },
      radius: 8,
      borderWidth: 0,
    },
  },
  secondary: {
    label: "Secondary",
    style: {
      bgColor: "#f3f4f6",
      textColor: "#111827",
      padding: { top: 10, right: 18, bottom: 10, left: 18 },
      radius: 8,
      borderWidth: 0,
    },
  },
  outline: {
    label: "Outline",
    style: {
      bgColor: "transparent",
      textColor: "#111827",
      borderColor: "#d1d5db",
      borderWidth: 1,
      padding: { top: 10, right: 18, bottom: 10, left: 18 },
      radius: 8,
    },
  },
};

export default function LayoutInspector({
  block,
  selection,
  siteId,
  assetsMap,
  onChangeBlock,
}: {
  block: any;
  selection: LayoutSelection | null;
  siteId: string;
  assetsMap: any;
  onChangeBlock: (nextBlock: any) => void;
}) {
  if (!block) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a layout section to edit.
      </div>
    );
  }
  if (!selection || selection.kind === "block") {
    return (
      <div className="text-sm text-muted-foreground">
        Select a section, row, column, or atomic block to edit.
      </div>
    );
  }

  const props: LayoutSectionProps =
    block.props && block.props.rows ? block.props : createDefaultSectionProps();

  function applyUpdate(mutator: (draft: LayoutSectionProps) => void) {
    const next = structuredClone(props);
    mutator(next);
    onChangeBlock({ ...block, props: next });
  }

  if (selection.kind === "layout-section") {
    return (
      <div className="space-y-5">
        <div className="text-sm font-medium">Section Settings</div>
        <StyleFields
          style={props.style}
          onChange={(nextStyle) =>
            applyUpdate((draft) => {
              draft.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  if (selection.kind === "layout-row") {
    const row = props.rows.find((r) => r.id === selection.rowId);
    if (!row) return null;

    return (
      <div className="space-y-5">
        <div className="text-sm font-medium">Row Settings</div>

        <Select
          label="Layout Mode"
          value={row.layout?.mode || "preset"}
          options={["preset", "manual"]}
          onChange={(v) =>
            applyUpdate((draft) => {
              const target = draft.rows.find((r) => r.id === row.id);
              if (!target) return;
              target.layout = target.layout || {};
              target.layout.mode = v as any;
            })
          }
        />

        {row.layout?.mode !== "manual" ? (
          <div className="space-y-3">
            <div className="text-sm font-medium">Row Preset</div>
            <div className="grid grid-cols-2 gap-3">
              {ROW_PRESET_OPTIONS.map((o) => {
                const def = ROW_PRESET_PREVIEWS[o.id];
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`border rounded-lg p-2 text-left text-xs ${
                      (row.layout?.presetId || "1-col") === o.id
                        ? "ring-2 ring-blue-500 border-blue-300"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      applyUpdate((draft) => {
                        const target = draft.rows.find((r) => r.id === row.id);
                        if (!target) return;
                        target.layout = target.layout || {};
                        target.layout.presetId = o.id;
                        target.layout.display = "grid";
                        const preset = ROW_PRESET_PREVIEWS[o.id];
                        if (preset) {
                          const needed = preset.cols;
                          target.layout.columns = needed;
                          target.cols = target.cols || [];
                          if (target.cols.length < needed) {
                            for (let i = target.cols.length; i < needed; i++) {
                              target.cols.push(createDefaultCol());
                            }
                          } else if (target.cols.length > needed) {
                            target.cols = target.cols.slice(0, needed);
                          }
                        }
                      })
                    }
                  >
                    <div className="text-[11px] font-medium mb-2">
                      {def?.label || o.id}
                    </div>
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: def?.template || "repeat(1, 1fr)",
                      }}
                    >
                      {Array.from(
                        { length: def?.cols || 1 },
                        (_, idx) => idx,
                      ).map((idx) => (
                        <div
                          key={idx}
                          className="h-6 rounded bg-gray-100 border border-dashed border-gray-300"
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <Select
              label="Display"
              value={row.layout?.display || "grid"}
              options={["grid", "flex"]}
              onChange={(v) =>
                applyUpdate((draft) => {
                  const target = draft.rows.find((r) => r.id === row.id);
                  if (!target) return;
                  target.layout = target.layout || {};
                  target.layout.display = v as any;
                })
              }
            />
            <NumberField
              label="Columns"
              value={row.layout?.columns || row.cols.length || 1}
              onChange={(n) =>
                applyUpdate((draft) => {
                  const target = draft.rows.find((r) => r.id === row.id);
                  if (!target) return;
                  target.layout = target.layout || {};
                  target.layout.columns = n;
                  if (n > (target.cols?.length || 0)) {
                    const toAdd = n - (target.cols?.length || 0);
                    target.cols = target.cols || [];
                    for (let i = 0; i < toAdd; i++) {
                      target.cols.push(createDefaultCol());
                    }
                  }
                })
              }
            />
          </>
        )}

        <NumberField
          label="Gap"
          value={Number(row.layout?.gap ?? 24)}
          onChange={(n) =>
            applyUpdate((draft) => {
              const target = draft.rows.find((r) => r.id === row.id);
              if (!target) return;
              target.layout = target.layout || {};
              target.layout.gap = n;
            })
          }
        />

        <Select
          label="Align"
          value={row.layout?.align || "stretch"}
          options={["start", "center", "end", "stretch"]}
          onChange={(v) =>
            applyUpdate((draft) => {
              const target = draft.rows.find((r) => r.id === row.id);
              if (!target) return;
              target.layout = target.layout || {};
              target.layout.align = v as any;
            })
          }
        />

        <Select
          label="Justify"
          value={row.layout?.justify || "start"}
          options={["start", "center", "end", "between", "around", "evenly"]}
          onChange={(v) =>
            applyUpdate((draft) => {
              const target = draft.rows.find((r) => r.id === row.id);
              if (!target) return;
              target.layout = target.layout || {};
              target.layout.justify = v as any;
            })
          }
        />

        <StyleFields
          style={row.style}
          onChange={(nextStyle) =>
            applyUpdate((draft) => {
              const target = draft.rows.find((r) => r.id === row.id);
              if (target) target.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  if (selection.kind === "layout-col") {
    const row = props.rows.find((r) => r.id === selection.rowId);
    const col = row?.cols.find((c) => c.id === selection.colId);
    if (!row || !col) return null;

    return (
      <div className="space-y-5">
        <div className="text-sm font-medium">Column Settings</div>
        <StyleFields
          style={col.style}
          onChange={(nextStyle) =>
            applyUpdate((draft) => {
              const targetRow = draft.rows.find((r) => r.id === row.id);
              const targetCol = targetRow?.cols.find((c) => c.id === col.id);
              if (targetCol) targetCol.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  if (selection.kind === "layout-atomic") {
    const row = props.rows.find((r) => r.id === selection.rowId);
    const col = row?.cols.find((c) => c.id === selection.colId);
    const atom = col?.blocks.find((b) => b.id === selection.atomicId);
    if (!row || !col || !atom) return null;

    function updateAtomic(mutator: (draftAtom: LayoutAtomicBlock) => void) {
      applyUpdate((draft) => {
        for (const r of draft.rows) {
          for (const c of r.cols || []) {
            const target = c.blocks.find((b) => b.id === atom.id);
            if (target) {
              mutator(target);
              return;
            }
          }
        }
      });
    }

    return (
      <div className="space-y-6">
        <div className="text-sm font-medium">Atomic Block</div>

        {atom.type === "Atomic/Text" && (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Typography Presets</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TEXT_STYLE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-50"
                    onClick={() =>
                      updateAtomic((draftAtom) => {
                        draftAtom.style = {
                          ...(draftAtom.style || {}),
                          ...preset.style,
                        };
                      })
                    }
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <Select
              label="Tag"
              value={atom.props?.tag || "p"}
              options={["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"]}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, tag: v };
                })
              }
            />
            <TextArea
              label="Text"
              value={atom.props?.text || ""}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, text: v };
                })
              }
            />
          </>
        )}

        {atom.type === "Atomic/Image" && (
          <>
            <ImageField
              siteId={siteId}
              label="Image Asset"
              assetIdValue={atom.props?.assetId || ""}
              altValue={atom.props?.alt || ""}
              onChangeAssetId={(v: any) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, assetId: v };
                })
              }
              onChangeAlt={(v: any) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, alt: v };
                })
              }
              assetsMap={assetsMap}
            />
            <Field
              label="Image URL"
              value={atom.props?.src || ""}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, src: v };
                })
              }
              placeholder="https://..."
            />
          </>
        )}

        {atom.type === "Atomic/Video" && (
          <>
            <Field
              label="Video URL"
              value={atom.props?.src || ""}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, src: v };
                })
              }
              placeholder="https://..."
            />
            <Field
              label="Poster URL"
              value={atom.props?.poster || ""}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, poster: v };
                })
              }
              placeholder="https://..."
            />
            <Checkbox
              label="Autoplay"
              value={!!atom.props?.autoplay}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, autoplay: v };
                })
              }
            />
            <Checkbox
              label="Muted"
              value={!!atom.props?.muted}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, muted: v };
                })
              }
            />
            <Checkbox
              label="Loop"
              value={!!atom.props?.loop}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, loop: v };
                })
              }
            />
            <Checkbox
              label="Controls"
              value={atom.props?.controls ?? true}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, controls: v };
                })
              }
            />
          </>
        )}

        {atom.type === "Atomic/Button" && (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Button Presets</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BUTTON_STYLE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-50"
                    onClick={() =>
                      updateAtomic((draftAtom) => {
                        draftAtom.style = {
                          ...(draftAtom.style || {}),
                          ...preset.style,
                        };
                      })
                    }
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <Field
              label="Label"
              value={atom.props?.label || ""}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, label: v };
                })
              }
            />
            <Field
              label="Href"
              value={atom.props?.href || ""}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, href: v };
                })
              }
              placeholder="/"
            />
            <Select
              label="Target"
              value={atom.props?.target || "_self"}
              options={["_self", "_blank"]}
              onChange={(v) =>
                updateAtomic((draftAtom) => {
                  draftAtom.props = { ...draftAtom.props, target: v };
                })
              }
            />
          </>
        )}

        <StyleFields
          style={atom.style}
          onChange={(nextStyle) =>
            applyUpdate((draft) => {
              const targetRow = draft.rows.find((r) => r.id === row.id);
              const targetCol = targetRow?.cols.find((c) => c.id === col.id);
              const targetAtom = targetCol?.blocks.find((b) => b.id === atom.id);
              if (targetAtom) targetAtom.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  return null;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
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

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <textarea
        className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <input
        type="number"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={Number.isNaN(value) ? 0 : value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
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
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <select
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
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
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function StyleFields({
  style,
  onChange,
}: {
  style: any;
  onChange: (next: any) => void;
}) {
  const s = style || {};

  function set(path: string, val: any) {
    const next = structuredClone(s);
    const parts = path.split(".");
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]] ??= {};
    }
    cur[parts.at(-1)!] = val;
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Style</div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Width"
          value={s.width || ""}
          onChange={(v) => set("width", v)}
          placeholder="100%"
        />
        <Field
          label="Max Width"
          value={s.maxWidth || ""}
          onChange={(v) => set("maxWidth", v)}
          placeholder="1200px"
        />
        <Field
          label="Min Width"
          value={s.minWidth || ""}
          onChange={(v) => set("minWidth", v)}
          placeholder="0"
        />
        <Field
          label="Height"
          value={s.height || ""}
          onChange={(v) => set("height", v)}
          placeholder="auto"
        />
        <Field
          label="Max Height"
          value={s.maxHeight || ""}
          onChange={(v) => set("maxHeight", v)}
          placeholder="800px"
        />
        <Field
          label="Min Height"
          value={s.minHeight || ""}
          onChange={(v) => set("minHeight", v)}
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Background"
          value={s.bgColor || ""}
          onChange={(v) => set("bgColor", v)}
          placeholder="#ffffff"
        />
        <Field
          label="Text Color"
          value={s.textColor || ""}
          onChange={(v) => set("textColor", v)}
          placeholder="#111111"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Text Align"
          value={s.textAlign || "left"}
          options={["left", "center", "right"]}
          onChange={(v) => set("textAlign", v)}
        />
        <Select
          label="Align Items"
          value={s.align || "stretch"}
          options={["start", "center", "end", "stretch"]}
          onChange={(v) => set("align", v)}
        />
      </div>

      <Select
        label="Justify"
        value={s.justify || "start"}
        options={["start", "center", "end", "between", "around", "evenly"]}
        onChange={(v) => set("justify", v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Border Color"
          value={s.borderColor || ""}
          onChange={(v) => set("borderColor", v)}
          placeholder="#e5e7eb"
        />
        <Field
          label="Border Width"
          value={s.borderWidth || ""}
          onChange={(v) => set("borderWidth", v)}
          placeholder="1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Radius"
          value={s.radius || ""}
          onChange={(v) => set("radius", v)}
          placeholder="8"
        />
        <Select
          label="Shadow"
          value={s.shadow || "none"}
          options={["none", "sm", "md", "lg"]}
          onChange={(v) => set("shadow", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Font Size"
          value={s.fontSize || ""}
          onChange={(v) => set("fontSize", v)}
          placeholder="16"
        />
        <Field
          label="Font Weight"
          value={s.fontWeight || ""}
          onChange={(v) => set("fontWeight", v)}
          placeholder="400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Line Height"
          value={s.lineHeight || ""}
          onChange={(v) => set("lineHeight", v)}
          placeholder="24"
        />
        <Field
          label="Letter Spacing"
          value={s.letterSpacing || ""}
          onChange={(v) => set("letterSpacing", v)}
          placeholder="0.2"
        />
      </div>

      <Select
        label="Text Transform"
        value={s.textTransform || "none"}
        options={["none", "uppercase", "lowercase", "capitalize"]}
        onChange={(v) => set("textTransform", v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Padding Top"
          value={Number(s.padding?.top ?? 0)}
          onChange={(n) => set("padding.top", n)}
        />
        <NumberField
          label="Padding Right"
          value={Number(s.padding?.right ?? 0)}
          onChange={(n) => set("padding.right", n)}
        />
        <NumberField
          label="Padding Bottom"
          value={Number(s.padding?.bottom ?? 0)}
          onChange={(n) => set("padding.bottom", n)}
        />
        <NumberField
          label="Padding Left"
          value={Number(s.padding?.left ?? 0)}
          onChange={(n) => set("padding.left", n)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Margin Top"
          value={Number(s.margin?.top ?? 0)}
          onChange={(n) => set("margin.top", n)}
        />
        <NumberField
          label="Margin Right"
          value={Number(s.margin?.right ?? 0)}
          onChange={(n) => set("margin.right", n)}
        />
        <NumberField
          label="Margin Bottom"
          value={Number(s.margin?.bottom ?? 0)}
          onChange={(n) => set("margin.bottom", n)}
        />
        <NumberField
          label="Margin Left"
          value={Number(s.margin?.left ?? 0)}
          onChange={(n) => set("margin.left", n)}
        />
      </div>
    </div>
  );
}
