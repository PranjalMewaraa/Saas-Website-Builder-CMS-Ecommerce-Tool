"use client";

import React, { useState } from "react";
import { Plus, ArrowUp, ArrowDown, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import {
  createAtomicBlock,
  createDefaultCol,
  createDefaultRow,
  type LayoutAtomicBlock,
  type LayoutSelection,
  type LayoutSectionProps,
} from "./layout-utils";
import {
  resolveLayoutStyle,
  resolveRowLayoutStyle,
  resolveColFlexStyle,
  toCssSizeValue,
} from "../../../../../../../packages/renderer/layout-style";

const ROW_PRESETS: Record<string, { template: string; gap?: number | string }> =
  {
    "1-col": { template: "minmax(0, 1fr)" },
    "2-col": { template: "repeat(2, minmax(0, 1fr))" },
    "3-col": { template: "repeat(3, minmax(0, 1fr))" },
    "sidebar-left": { template: "minmax(0, 1fr) minmax(0, 2fr)" },
    "sidebar-right": { template: "minmax(0, 2fr) minmax(0, 1fr)" },
    "three-uneven": {
      template: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
    },
  };

function resolveAssetUrl(assetId: string | undefined, assetsMap: any) {
  if (!assetId || !assetsMap) return "";
  return assetsMap[assetId]?.url || "";
}

function renderAtomicPreview(block: LayoutAtomicBlock, assetsMap: any) {
  const style = resolveLayoutStyle(block.style);
  const props = block.props || {};

  if (block.type === "Atomic/Text") {
    const Tag: any = props.tag || "p";
    return (
      <Tag style={style} className="min-h-[18px]">
        {props.text || ""}
      </Tag>
    );
  }

  if (block.type === "Atomic/Image") {
    const src = props.src || resolveAssetUrl(props.assetId, assetsMap);
    const imgStyle: React.CSSProperties = {
      ...style,
      width: toCssSizeValue(props.width) || style.width,
      height: toCssSizeValue(props.height) || style.height,
      objectFit: props.objectFit || "cover",
    };
    if (!src) {
      return (
        <div
          style={{
            ...imgStyle,
            border: "1px dashed rgba(0,0,0,0.2)",
            padding: "24px",
            fontSize: "12px",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Image
        </div>
      );
    }
    return <img src={src} alt={props.alt || ""} style={imgStyle} />;
  }

  if (block.type === "Atomic/Video") {
    const src = props.src || resolveAssetUrl(props.assetId, assetsMap);
    if (!src) {
      return (
        <div
          style={{
            ...style,
            border: "1px dashed rgba(0,0,0,0.2)",
            padding: "24px",
            fontSize: "12px",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Video
        </div>
      );
    }
    return (
      <video
        src={src}
        poster={props.poster}
        autoPlay={!!props.autoplay}
        muted={!!props.muted}
        loop={!!props.loop}
        controls={props.controls ?? true}
        style={style}
      />
    );
  }

  if (block.type === "Atomic/Button") {
    return (
      <a
        href={props.href || "#"}
        target={props.target || "_self"}
        style={style}
        className="inline-flex items-center justify-center"
      >
        {props.label || "Button"}
      </a>
    );
  }

  return (
    <div className="text-xs text-red-500">Unknown: {block.type}</div>
  );
}

export default function VisualLayoutSection({
  block,
  selection,
  assetsMap,
  onSelect,
  onChangeBlock,
}: {
  block: any;
  selection: LayoutSelection | null;
  assetsMap: any;
  onSelect: (sel: LayoutSelection) => void;
  onChangeBlock: (nextBlock: any) => void;
}) {
  const props: LayoutSectionProps =
    block.props && block.props.rows ? block.props : { style: {}, rows: [] };
  const rows = props.rows || [];

  const [activeAddCol, setActiveAddCol] = useState<{
    rowId: string;
    colId: string;
  } | null>(null);

  function updateProps(next: LayoutSectionProps) {
    onChangeBlock({ ...block, props: next });
  }

  function addRow() {
    const row = createDefaultRow();
    updateProps({ ...props, rows: [...rows, row] });
    onSelect({ kind: "layout-row", blockId: block.id, rowId: row.id });
  }

  function moveRow(rowId: string, dir: -1 | 1) {
    const idx = rows.findIndex((r) => r.id === rowId);
    if (idx < 0) return;
    const next = structuredClone(rows);
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    updateProps({ ...props, rows: next });
  }

  function deleteRow(rowId: string) {
    const next = rows.filter((r) => r.id !== rowId);
    updateProps({ ...props, rows: next });
  }

  function addCol(rowId: string) {
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      next.cols = next.cols || [];
      next.cols.push(createDefaultCol());
      if (next.layout?.columns) {
        next.layout.columns = next.cols.length;
      }
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  function moveCol(rowId: string, colId: string, dir: -1 | 1) {
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      const idx = next.cols.findIndex((c: any) => c.id === colId);
      if (idx < 0) return next;
      const j = idx + dir;
      if (j < 0 || j >= next.cols.length) return next;
      [next.cols[idx], next.cols[j]] = [next.cols[j], next.cols[idx]];
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  function deleteCol(rowId: string, colId: string) {
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      next.cols = (next.cols || []).filter((c: any) => c.id !== colId);
      if (next.layout?.columns) {
        next.layout.columns = next.cols.length || 1;
      }
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  function addAtomic(rowId: string, colId: string, type: any) {
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      const col = (next.cols || []).find((c: any) => c.id === colId);
      if (col) {
        col.blocks = col.blocks || [];
        col.blocks.push(createAtomicBlock(type));
      }
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  function moveAtomic(
    rowId: string,
    colId: string,
    atomId: string,
    dir: -1 | 1,
  ) {
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      const col = (next.cols || []).find((c: any) => c.id === colId);
      if (!col) return next;
      const idx = col.blocks.findIndex((b: any) => b.id === atomId);
      if (idx < 0) return next;
      const j = idx + dir;
      if (j < 0 || j >= col.blocks.length) return next;
      [col.blocks[idx], col.blocks[j]] = [col.blocks[j], col.blocks[idx]];
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  function deleteAtomic(rowId: string, colId: string, atomId: string) {
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      const col = (next.cols || []).find((c: any) => c.id === colId);
      if (!col) return next;
      col.blocks = (col.blocks || []).filter((b: any) => b.id !== atomId);
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  return (
    <div
      className={`relative rounded-xl border ${
        selection?.kind === "layout-section" && selection.blockId === block.id
          ? "ring-2 ring-blue-500 border-blue-300"
          : "border-gray-200"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({ kind: "layout-section", blockId: block.id });
      }}
    >
      <div className="absolute left-3 -top-3 text-[10px] bg-white px-2 py-0.5 border rounded-full text-gray-500">
        Section
      </div>

      <div className="p-4 group" style={resolveLayoutStyle(props.style)}>
        {rows.length === 0 ? (
          <button
            type="button"
            className="w-full border border-dashed border-gray-300 rounded-lg py-6 text-sm text-gray-500 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              addRow();
            }}
            title="Add row"
          >
            <Plus className="inline-block h-4 w-4 mr-1" />
            Add Row
          </button>
        ) : (
          <div className="space-y-6">
            {rows.map((row) => {
              const rowSelected =
                selection?.kind === "layout-row" &&
                selection.blockId === block.id &&
                selection.rowId === row.id;

              const rowPreset =
                row.layout?.mode === "preset"
                  ? ROW_PRESETS[row.layout?.presetId || "1-col"]
                  : undefined;

              const rowLayoutStyle = resolveRowLayoutStyle(
                row.layout,
                rowPreset,
              );

              return (
                <div
                  key={row.id}
                  className={`group relative rounded-lg border border-dashed hover:ring-1 hover:ring-blue-200 ${
                    rowSelected ? "ring-2 ring-blue-500 border-blue-300" : "border-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect({
                      kind: "layout-row",
                      blockId: block.id,
                      rowId: row.id,
                    });
                  }}
                >
                  <div className="absolute right-2 -top-3 bg-white border rounded-full shadow-sm flex items-center gap-1 p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                    <button
                      className="p-1 rounded hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveRow(row.id, -1);
                      }}
                      title="Move row up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveRow(row.id, 1);
                      }}
                      title="Move row down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(row.id);
                      }}
                      title="Delete row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="absolute left-3 -top-3 text-[10px] bg-white px-2 py-0.5 border rounded-full text-gray-500">
                    Row
                  </div>

                  <div
                    className="p-4"
                    style={{
                      ...resolveLayoutStyle(row.style),
                      ...rowLayoutStyle,
                    }}
                  >
                    {(row.cols || []).map((col) => {
                      const colSelected =
                        selection?.kind === "layout-col" &&
                        selection.blockId === block.id &&
                        selection.rowId === row.id &&
                        selection.colId === col.id;

                      return (
                        <div
                          key={col.id}
                          className={`group/col relative rounded-lg border hover:ring-1 hover:ring-blue-200 ${
                            colSelected
                              ? "ring-2 ring-blue-500 border-blue-300"
                              : "border-gray-200"
                          }`}
                          style={{
                            ...resolveLayoutStyle(col.style),
                            ...resolveColFlexStyle(col.style),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({
                              kind: "layout-col",
                              blockId: block.id,
                              rowId: row.id,
                              colId: col.id,
                            });
                          }}
                        >
                          <div className="absolute right-2 -top-3 bg-white border rounded-full shadow-sm flex items-center gap-1 p-1 opacity-0 pointer-events-none group-hover/col:opacity-100 group-hover/col:pointer-events-auto transition">
                            <button
                              className="p-1 rounded hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveCol(row.id, col.id, -1);
                              }}
                              title="Move column left"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveCol(row.id, col.id, 1);
                              }}
                              title="Move column right"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-red-50 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCol(row.id, col.id);
                              }}
                              title="Delete column"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="absolute left-3 -top-3 text-[10px] bg-white px-2 py-0.5 border rounded-full text-gray-500">
                            Col
                          </div>

                          <div className="space-y-4 p-3">
                            {(col.blocks || []).map((atomic) => {
                              const atomicSelected =
                                selection?.kind === "layout-atomic" &&
                                selection.blockId === block.id &&
                                selection.rowId === row.id &&
                                selection.colId === col.id &&
                                selection.atomicId === atomic.id;

                              return (
                                <div
                                  key={atomic.id}
                                  className={`group relative rounded-md border ${
                                    atomicSelected
                                      ? "ring-2 ring-blue-500 border-blue-300"
                                      : "border-transparent hover:border-gray-200"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      kind: "layout-atomic",
                                      blockId: block.id,
                                      rowId: row.id,
                                      colId: col.id,
                                      atomicId: atomic.id,
                                    });
                                  }}
                                >
                                  <div className="absolute right-2 -top-3 bg-white border rounded-full shadow-sm flex items-center gap-1 p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                                    <button
                                      className="p-1 rounded hover:bg-gray-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveAtomic(row.id, col.id, atomic.id, -1);
                                      }}
                                      title="Move up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      className="p-1 rounded hover:bg-gray-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveAtomic(row.id, col.id, atomic.id, 1);
                                      }}
                                      title="Move down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                    <button
                                      className="p-1 rounded hover:bg-red-50 text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAtomic(row.id, col.id, atomic.id);
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                  {renderAtomicPreview(atomic, assetsMap)}
                                </div>
                              );
                            })}

                            <div className="relative">
                              <button
                                type="button"
                                className="w-full border border-dashed border-gray-300 rounded-md py-2 text-xs text-gray-500 hover:bg-gray-50 opacity-0 pointer-events-none group-hover/col:opacity-100 group-hover/col:pointer-events-auto transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAddCol({ rowId: row.id, colId: col.id });
                                }}
                                title="Add block"
                              >
                                <Plus className="inline-block h-3 w-3 mr-1" />
                                Add Block
                              </button>
                              {activeAddCol &&
                                activeAddCol.rowId === row.id &&
                                activeAddCol.colId === col.id && (
                                  <div className="absolute z-10 mt-2 w-full rounded-md border bg-white shadow-sm p-2 space-y-1 text-xs">
                                    {[
                                      "Atomic/Text",
                                      "Atomic/Image",
                                      "Atomic/Video",
                                      "Atomic/Button",
                                    ].map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addAtomic(row.id, col.id, t);
                                          setActiveAddCol(null);
                                        }}
                                      >
                                        {t.replace("Atomic/", "")}
                                      </button>
                                    ))}
                                    <button
                                      type="button"
                                      className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 text-gray-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveAddCol(null);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 pb-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        addCol(row.id);
                      }}
                      title="Add column"
                    >
                      <Plus className="h-3 w-3" />
                      Add Column
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="w-full border border-dashed border-gray-300 rounded-lg py-3 text-xs text-gray-500 hover:bg-gray-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition"
              onClick={(e) => {
                e.stopPropagation();
                addRow();
              }}
              title="Add row"
            >
              <Plus className="inline-block h-3 w-3 mr-1" />
              Add Row
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
