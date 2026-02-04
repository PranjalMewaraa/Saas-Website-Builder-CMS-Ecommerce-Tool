"use client";

import React, { useEffect, useState } from "react";
import ImageField from "./ImageField";
import ColorPickerInput from "./ColorPickerInput";

const DEFAULT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
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
  themePalette = [],
  onDeleteBlock,
  onChangeBlock,
}: {
  block: any;
  selection: LayoutSelection | null;
  siteId: string;
  assetsMap: any;
  themePalette?: string[];
  onDeleteBlock?: (id: string) => void;
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

  function updateGroup(atomicId: string, mutator: (groupProps: any) => void) {
    applyUpdate((draft) => {
      for (const r of draft.rows) {
        for (const c of r.cols || []) {
          const target = (c.blocks || []).find((b: any) => b.id === atomicId);
          if (target && target.type === "Atomic/Group") {
            target.props = target.props || { rows: [] };
            mutator(target.props);
            return;
          }
        }
      }
    });
  }

  function getGroup(atomicId: string) {
    for (const r of props.rows) {
      for (const c of r.cols || []) {
        const target = (c.blocks || []).find((b: any) => b.id === atomicId);
        if (target && target.type === "Atomic/Group") return target;
      }
    }
    return null;
  }

  if (selection.kind === "layout-section") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Section Settings</div>
          {onDeleteBlock && (
            <button
              className="text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded"
              onClick={() => onDeleteBlock(block.id)}
              type="button"
            >
              Delete Section Block
            </button>
          )}
        </div>
        <StyleFields
          style={props.style}
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
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
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
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
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
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

  function renderAtomicEditor(
    atom: LayoutAtomicBlock,
    updateAtomic: (mutator: (draftAtom: LayoutAtomicBlock) => void) => void,
    onStyleChange: (nextStyle: any) => void,
  ) {
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
              assetUrlValue={atom.props?.src || DEFAULT_IMAGE}
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
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
          onChange={onStyleChange}
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

    return renderAtomicEditor(atom, updateAtomic, (nextStyle) =>
      applyUpdate((draft) => {
        const targetRow = draft.rows.find((r) => r.id === row.id);
        const targetCol = targetRow?.cols.find((c) => c.id === col.id);
        const targetAtom = targetCol?.blocks.find((b) => b.id === atom.id);
        if (targetAtom) targetAtom.style = nextStyle;
      }),
    );
  }

  if (selection.kind === "layout-group") {
    const groupBlock = getGroup(selection.atomicId);
    if (!groupBlock) return null;
    return (
      <div className="space-y-5">
        <div className="text-sm font-medium">Group Settings</div>
        <StyleFields
          style={groupBlock.props?.style}
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
          onChange={(nextStyle) =>
            updateGroup(selection.atomicId, (gp) => {
              gp.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  if (selection.kind === "layout-group-row") {
    const groupBlock = getGroup(selection.atomicId);
    const row =
      groupBlock?.props?.rows?.find((r: any) => r.id === selection.groupRowId) ||
      null;
    if (!groupBlock || !row) return null;
    return (
      <div className="space-y-5">
        <div className="text-sm font-medium">Group Row Settings</div>
        <Select
          label="Layout Mode"
          value={row.layout?.mode || "preset"}
          options={["preset", "manual"]}
          onChange={(v) =>
            updateGroup(selection.atomicId, (gp) => {
              const target = gp.rows.find((r: any) => r.id === row.id);
              if (!target) return;
              target.layout = target.layout || {};
              target.layout.mode = v as any;
            })
          }
        />
        <StyleFields
          style={row.style}
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
          onChange={(nextStyle) =>
            updateGroup(selection.atomicId, (gp) => {
              const target = gp.rows.find((r: any) => r.id === row.id);
              if (target) target.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  if (selection.kind === "layout-group-col") {
    const groupBlock = getGroup(selection.atomicId);
    const row =
      groupBlock?.props?.rows?.find((r: any) => r.id === selection.groupRowId) ||
      null;
    const col =
      row?.cols?.find((c: any) => c.id === selection.groupColId) || null;
    if (!groupBlock || !row || !col) return null;
    return (
      <div className="space-y-5">
        <div className="text-sm font-medium">Group Column Settings</div>
        <StyleFields
          style={col.style}
          palette={themePalette}
          siteId={siteId}
          assetsMap={assetsMap}
          onChange={(nextStyle) =>
            updateGroup(selection.atomicId, (gp) => {
              const r = gp.rows.find((rr: any) => rr.id === row.id);
              const c = r?.cols?.find((cc: any) => cc.id === col.id);
              if (c) c.style = nextStyle;
            })
          }
        />
      </div>
    );
  }

  if (selection.kind === "layout-group-atomic") {
    const groupBlock = getGroup(selection.atomicId);
    const row =
      groupBlock?.props?.rows?.find((r: any) => r.id === selection.groupRowId) ||
      null;
    const col =
      row?.cols?.find((c: any) => c.id === selection.groupColId) || null;
    const atom =
      col?.blocks?.find((b: any) => b.id === selection.groupAtomicId) || null;
    if (!groupBlock || !row || !col || !atom) return null;
    return renderAtomicEditor(
      atom,
      (mutator) =>
        updateGroup(selection.atomicId, (gp) => {
          const r = gp.rows.find((rr: any) => rr.id === row.id);
          const c = r?.cols?.find((cc: any) => cc.id === col.id);
          const a = c?.blocks?.find((bb: any) => bb.id === atom.id);
          if (a) mutator(a);
        }),
      (nextStyle) =>
        updateGroup(selection.atomicId, (gp) => {
          const r = gp.rows.find((rr: any) => rr.id === row.id);
          const c = r?.cols?.find((cc: any) => cc.id === col.id);
          const a = c?.blocks?.find((bb: any) => bb.id === atom.id);
          if (a) a.style = nextStyle;
        }),
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

function UnitField({
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
    const m = String(v).trim().match(/(px|%|em|rem|vh|vw)$/);
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
    const match = trimmed.match(/^(-?\\d+(?:\\.\\d+)?)(px|%|em|rem|vh|vw)$/);
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
    const numMatch = current.match(
      /^(-?\\d+(?:\\.\\d+)?)(?:px|%|em|rem|vh|vw)?$/,
    );
    if (numMatch) {
      const next = `${numMatch[1]}${nextUnit}`;
      setText(next);
      onChange(next);
    }
  }

  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex gap-2 items-center">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 font-mono"
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
        <select
          className="border rounded-lg px-2 py-2 text-xs bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
        >
          {["px", "%", "em", "rem", "vh", "vw"].map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
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
  palette = [],
  siteId,
  assetsMap,
  onChange,
}: {
  style: any;
  palette?: string[];
  siteId?: string;
  assetsMap?: any;
  onChange: (next: any) => void;
}) {
  const s = style || {};
  const resolvedBg =
    s.bg ?? (s.bgColor ? { type: "solid", color: s.bgColor } : { type: "none" });
  const bgType = resolvedBg.type || "none";

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

  function setBg(next: any) {
    const updated = structuredClone(s);
    updated.bg = { ...(updated.bg || {}), ...next };
    if (next.type === "none") {
      updated.bgColor = undefined;
    }
    if (next.type === "solid") {
      const color = next.color ?? updated.bg?.color;
      if (color) updated.bgColor = color;
    }
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Style</div>

      <details open className="border rounded-lg p-3 bg-white shadow-sm">
        <summary className="cursor-pointer text-sm font-medium">
          Size & Spacing
        </summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <UnitField
              label="Width"
              value={s.width || ""}
              onChange={(v) => set("width", v)}
              placeholder="100%"
            />
            <UnitField
              label="Max Width"
              value={s.maxWidth || ""}
              onChange={(v) => set("maxWidth", v)}
              placeholder="1200px"
            />
            <UnitField
              label="Min Width"
              value={s.minWidth || ""}
              onChange={(v) => set("minWidth", v)}
              placeholder="0"
            />
            <UnitField
              label="Height"
              value={s.height || ""}
              onChange={(v) => set("height", v)}
              placeholder="auto"
            />
            <UnitField
              label="Max Height"
              value={s.maxHeight || ""}
              onChange={(v) => set("maxHeight", v)}
              placeholder="800px"
            />
            <UnitField
              label="Min Height"
              value={s.minHeight || ""}
              onChange={(v) => set("minHeight", v)}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <UnitField
              label="Padding Top"
              value={Number(s.padding?.top ?? 0)}
              onChange={(v) => set("padding.top", v)}
            />
            <UnitField
              label="Padding Right"
              value={Number(s.padding?.right ?? 0)}
              onChange={(v) => set("padding.right", v)}
            />
            <UnitField
              label="Padding Bottom"
              value={Number(s.padding?.bottom ?? 0)}
              onChange={(v) => set("padding.bottom", v)}
            />
            <UnitField
              label="Padding Left"
              value={Number(s.padding?.left ?? 0)}
              onChange={(v) => set("padding.left", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <UnitField
              label="Margin Top"
              value={Number(s.margin?.top ?? 0)}
              onChange={(v) => set("margin.top", v)}
            />
            <UnitField
              label="Margin Right"
              value={Number(s.margin?.right ?? 0)}
              onChange={(v) => set("margin.right", v)}
            />
            <UnitField
              label="Margin Bottom"
              value={Number(s.margin?.bottom ?? 0)}
              onChange={(v) => set("margin.bottom", v)}
            />
            <UnitField
              label="Margin Left"
              value={Number(s.margin?.left ?? 0)}
              onChange={(v) => set("margin.left", v)}
            />
          </div>
        </div>
      </details>

      <details open className="border rounded-lg p-3 bg-white shadow-sm">
        <summary className="cursor-pointer text-sm font-medium">
          Background
        </summary>
        <div className="mt-3 space-y-3">
          <Select
            label="Type"
            value={bgType}
            options={["none", "solid", "gradient", "image", "video"]}
            onChange={(v) => setBg({ type: v })}
          />

          {bgType === "solid" ? (
            <ColorPickerInput
              label="Color"
              value={resolvedBg.color || ""}
              onChange={(v) => setBg({ type: "solid", color: v })}
              placeholder="#ffffff"
              palette={palette}
            />
          ) : null}

          {bgType === "gradient" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ColorPickerInput
                  label="From"
                  value={resolvedBg.gradient?.from || ""}
                  onChange={(v) =>
                    setBg({ type: "gradient", gradient: { ...resolvedBg.gradient, from: v } })
                  }
                  placeholder="#0f172a"
                  palette={palette}
                />
                <ColorPickerInput
                  label="To"
                  value={resolvedBg.gradient?.to || ""}
                  onChange={(v) =>
                    setBg({ type: "gradient", gradient: { ...resolvedBg.gradient, to: v } })
                  }
                  placeholder="#38bdf8"
                  palette={palette}
                />
              </div>
              <NumberField
                label="Angle"
                value={Number(resolvedBg.gradient?.angle ?? 180)}
                onChange={(v) =>
                  setBg({
                    type: "gradient",
                    gradient: { ...resolvedBg.gradient, angle: v },
                  })
                }
              />
            </div>
          ) : null}

          {bgType === "image" ? (
            <div className="space-y-3">
              <ImageField
                siteId={siteId || ""}
                label="Background Image"
                assetIdValue={resolvedBg.imageAssetId || ""}
                assetUrlValue={resolvedBg.imageUrl || ""}
                altValue=""
                assetsMap={assetsMap}
                onChangeAssetId={(v) =>
                  setBg({ type: "image", imageAssetId: v })
                }
                onChangeAssetUrl={(v) => setBg({ type: "image", imageUrl: v })}
                onChangeAlt={() => {}}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Size"
                  value={resolvedBg.imageSize || "cover"}
                  options={["cover", "contain", "auto"]}
                  onChange={(v) => setBg({ type: "image", imageSize: v })}
                />
                <Select
                  label="Repeat"
                  value={resolvedBg.imageRepeat || "no-repeat"}
                  options={["no-repeat", "repeat", "repeat-x", "repeat-y"]}
                  onChange={(v) => setBg({ type: "image", imageRepeat: v })}
                />
              </div>
              <Field
                label="Position"
                value={resolvedBg.imagePosition || "center"}
                onChange={(v) => setBg({ type: "image", imagePosition: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <ColorPickerInput
                  label="Overlay Color"
                  value={resolvedBg.overlayColor || ""}
                  onChange={(v) => setBg({ type: "image", overlayColor: v })}
                  placeholder="#000000"
                  palette={palette}
                />
                <NumberField
                  label="Overlay Opacity"
                  value={Number(resolvedBg.overlayOpacity ?? 0.35)}
                  onChange={(v) =>
                    setBg({ type: "image", overlayOpacity: v })
                  }
                />
              </div>
            </div>
          ) : null}

          {bgType === "video" ? (
            <div className="space-y-3">
              <Field
                label="Video URL"
                value={resolvedBg.videoUrl || ""}
                onChange={(v) => setBg({ type: "video", videoUrl: v })}
                placeholder="https://..."
              />
              <Field
                label="Poster"
                value={resolvedBg.videoPoster || ""}
                onChange={(v) => setBg({ type: "video", videoPoster: v })}
                placeholder="https://..."
              />
              <div className="grid grid-cols-2 gap-3">
                <Checkbox
                  label="Autoplay"
                  value={!!resolvedBg.videoAutoplay}
                  onChange={(v) => setBg({ type: "video", videoAutoplay: v })}
                />
                <Checkbox
                  label="Muted"
                  value={resolvedBg.videoMuted ?? true}
                  onChange={(v) => setBg({ type: "video", videoMuted: v })}
                />
                <Checkbox
                  label="Loop"
                  value={resolvedBg.videoLoop ?? true}
                  onChange={(v) => setBg({ type: "video", videoLoop: v })}
                />
                <Checkbox
                  label="Controls"
                  value={!!resolvedBg.videoControls}
                  onChange={(v) => setBg({ type: "video", videoControls: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorPickerInput
                  label="Overlay Color"
                  value={resolvedBg.overlayColor || ""}
                  onChange={(v) => setBg({ type: "video", overlayColor: v })}
                  placeholder="#000000"
                  palette={palette}
                />
                <NumberField
                  label="Overlay Opacity"
                  value={Number(resolvedBg.overlayOpacity ?? 0.35)}
                  onChange={(v) =>
                    setBg({ type: "video", overlayOpacity: v })
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </details>

      <details open className="border rounded-lg p-3 bg-white shadow-sm">
        <summary className="cursor-pointer text-sm font-medium">
          Color & Border
        </summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-3 min-w-0">
            <ColorPickerInput
              label="Text Color"
              value={s.textColor || ""}
              onChange={(v) => set("textColor", v)}
              placeholder="#111111"
              palette={palette}
            />
            <ColorPickerInput
              label="Border Color"
              value={s.borderColor || ""}
              onChange={(v) => set("borderColor", v)}
              placeholder="#e5e7eb"
              palette={palette}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 min-w-0">
            <UnitField
              label="Border Width"
              value={s.borderWidth || ""}
              onChange={(v) => set("borderWidth", v)}
              placeholder="1"
            />
            <Field
              label="Radius"
              value={s.radius || ""}
              onChange={(v) => set("radius", v)}
              placeholder="8"
            />
          </div>

          <Select
            label="Shadow"
            value={s.shadow || "none"}
            options={["none", "sm", "md", "lg"]}
            onChange={(v) => set("shadow", v)}
          />
        </div>
      </details>

      <details open className="border rounded-lg p-3 bg-white shadow-sm">
        <summary className="cursor-pointer text-sm font-medium">
          Layout & Alignment
        </summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Display"
              value={s.display || "block"}
              options={["block", "flex", "grid"]}
              onChange={(v) => set("display", v)}
            />
            <Select
              label="Direction"
              value={s.flexDirection || "row"}
              options={["row", "column"]}
              onChange={(v) => set("flexDirection", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Wrap"
              value={s.flexWrap || "nowrap"}
              options={["nowrap", "wrap"]}
              onChange={(v) => set("flexWrap", v)}
            />
            <UnitField
              label="Gap"
              value={s.gap || ""}
              onChange={(v) => set("gap", v)}
              placeholder="12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Align Items"
              value={s.align || "stretch"}
              options={["start", "center", "end", "stretch"]}
              onChange={(v) => set("align", v)}
            />
            <Select
              label="Justify Content"
              value={s.justify || "start"}
              options={["start", "center", "end", "between", "around", "evenly"]}
              onChange={(v) => set("justify", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Align Self"
              value={s.alignSelf || "stretch"}
              options={["start", "center", "end", "stretch"]}
              onChange={(v) => set("alignSelf", v)}
            />
            <Select
              label="Justify Self"
              value={s.justifySelf || "stretch"}
              options={["start", "center", "end", "stretch"]}
              onChange={(v) => set("justifySelf", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Grid Columns"
              value={Number(s.gridColumns || 0)}
              onChange={(v) => set("gridColumns", v || undefined)}
            />
            <NumberField
              label="Grid Rows"
              value={Number(s.gridRows || 0)}
              onChange={(v) => set("gridRows", v || undefined)}
            />
          </div>
        </div>
      </details>

      <details open className="border rounded-lg p-3 bg-white shadow-sm">
        <summary className="cursor-pointer text-sm font-medium">Typography</summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Text Align"
              value={s.textAlign || "left"}
              options={["left", "center", "right"]}
              onChange={(v) => set("textAlign", v)}
            />
            <Select
              label="Text Transform"
              value={s.textTransform || "none"}
              options={["none", "uppercase", "lowercase", "capitalize"]}
              onChange={(v) => set("textTransform", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <UnitField
              label="Font Size"
              value={s.fontSize || ""}
              onChange={(v) => set("fontSize", v)}
              placeholder="16"
            />
            <UnitField
              label="Font Weight"
              value={s.fontWeight || ""}
              onChange={(v) => set("fontWeight", v)}
              placeholder="400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <UnitField
              label="Line Height"
              value={s.lineHeight || ""}
              onChange={(v) => set("lineHeight", v)}
              placeholder="24"
            />
            <UnitField
              label="Letter Spacing"
              value={s.letterSpacing || ""}
              onChange={(v) => set("letterSpacing", v)}
              placeholder="0.2"
            />
          </div>
        </div>
      </details>
    </div>
  );
}
