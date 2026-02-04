"use client";

import React, { useState } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Copy,
} from "lucide-react";
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
  getBackgroundVideo,
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

function renderVideoLayer(video: ReturnType<typeof getBackgroundVideo>) {
  if (!video) return null;
  return (
    <>
      <video
        src={video.src}
        poster={video.poster}
        autoPlay={video.autoplay}
        muted={video.muted}
        loop={video.loop}
        controls={video.controls}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      {video.overlayColor ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(${video.overlayColor}, ${video.overlayColor})`,
            opacity: video.overlayOpacity,
            zIndex: 1,
          }}
        />
      ) : null}
    </>
  );
}

export default function VisualLayoutSection({
  block,
  selection,
  assetsMap,
  onSelect,
  onChangeBlock,
  showOutlines = true,
  onDeleteBlock,
  onDuplicateBlock,
}: {
  block: any;
  selection: LayoutSelection | null;
  assetsMap: any;
  onSelect: (sel: LayoutSelection) => void;
  onChangeBlock: (nextBlock: any) => void;
  showOutlines?: boolean;
  onDeleteBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
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

  function updateGroupProps(
    atomicId: string,
    mutator: (groupProps: any) => void,
  ) {
    const nextRows = rows.map((r) => {
      const next = structuredClone(r);
      next.cols = (next.cols || []).map((c: any) => {
        const col = structuredClone(c);
        col.blocks = (col.blocks || []).map((b: any) => {
          if (b.id !== atomicId) return b;
          const nb = structuredClone(b);
          nb.props = nb.props || { rows: [] };
          mutator(nb.props);
          return nb;
        });
        return col;
      });
      return next;
    });
    updateProps({ ...props, rows: nextRows });
  }

  function groupAddRow(atomicId: string) {
    updateGroupProps(atomicId, (gp: any) => {
      gp.rows = gp.rows || [];
      gp.rows.push(createDefaultRow());
    });
  }

  function groupAddCol(atomicId: string, rowId: string) {
    updateGroupProps(atomicId, (gp: any) => {
      const row = (gp.rows || []).find((r: any) => r.id === rowId);
      if (!row) return;
      row.cols = row.cols || [];
      row.cols.push(createDefaultCol());
      if (row.layout?.columns) row.layout.columns = row.cols.length;
    });
  }

  function groupAddAtomic(
    atomicId: string,
    rowId: string,
    colId: string,
    type: any,
  ) {
    updateGroupProps(atomicId, (gp: any) => {
      const row = (gp.rows || []).find((r: any) => r.id === rowId);
      if (!row) return;
      const col = (row.cols || []).find((c: any) => c.id === colId);
      if (!col) return;
      col.blocks = col.blocks || [];
      col.blocks.push(createAtomicBlock(type));
    });
  }

  function renderGroupLayout(groupBlock: any) {
    const gProps = groupBlock.props || { rows: [] };
    const gRows = gProps.rows || [];

    const groupOuterStyle = resolveLayoutStyle(groupBlock.style || {});
    const groupInnerStyle = resolveLayoutStyle(gProps.style || {});
    const groupOuterVideo = getBackgroundVideo(groupBlock.style);
    const groupInnerVideo = getBackgroundVideo(gProps.style);

    return (
      <div
        className="border border-dashed border-gray-300 rounded-md p-3 space-y-4"
        style={{
          ...groupOuterStyle,
          position: groupOuterVideo ? "relative" : groupOuterStyle.position,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            kind: "layout-group",
            blockId: block.id,
            rowId: "",
            colId: "",
            atomicId: groupBlock.id,
          });
        }}
      >
        {renderVideoLayer(groupOuterVideo)}
        <div className="text-[10px] uppercase tracking-wider text-gray-400">
          Group
        </div>
        <div
          style={{
            ...groupInnerStyle,
            position: groupInnerVideo ? "relative" : groupInnerStyle.position,
          }}
        >
        {renderVideoLayer(groupInnerVideo)}
        <div style={{ position: "relative", zIndex: 2 }}>
        {gRows.length === 0 ? (
          <button
            type="button"
            className="w-full border border-dashed border-gray-300 rounded-md py-2 text-xs text-gray-500 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              groupAddRow(groupBlock.id);
              onSelect({
                kind: "layout-group",
                blockId: block.id,
                rowId: "",
                colId: "",
                atomicId: groupBlock.id,
              });
            }}
          >
            <Plus className="inline-block h-3 w-3 mr-1" />
            Add Row
          </button>
        ) : (
          <div className="space-y-4">
            {gRows.map((gr: any) => (
              <div
                key={gr.id}
                className="border border-dashed border-gray-300 rounded-md p-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({
                    kind: "layout-group-row",
                    blockId: block.id,
                    rowId: "",
                    colId: "",
                    atomicId: groupBlock.id,
                    groupRowId: gr.id,
                  });
                }}
              >
                <div className="text-[10px] text-gray-400 mb-2">Row</div>
                <div className="grid gap-3">
                  {(gr.cols || []).map((gc: any) => (
                    <div
                      key={gc.id}
                      className="border border-gray-300 rounded-md p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect({
                          kind: "layout-group-col",
                          blockId: block.id,
                          rowId: "",
                          colId: "",
                          atomicId: groupBlock.id,
                          groupRowId: gr.id,
                          groupColId: gc.id,
                        });
                      }}
                    >
                      {(gc.blocks || []).map((ga: any) => (
                        <div
                          key={ga.id}
                          className="border border-gray-200 rounded p-2 mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({
                              kind: "layout-group-atomic",
                              blockId: block.id,
                              rowId: "",
                              colId: "",
                              atomicId: groupBlock.id,
                              groupRowId: gr.id,
                              groupColId: gc.id,
                              groupAtomicId: ga.id,
                            });
                          }}
                        >
                          {ga.type === "Atomic/Group"
                            ? renderGroupLayout(ga)
                            : renderAtomicPreview(ga, assetsMap)}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="w-full border border-dashed border-gray-300 rounded-md py-2 text-xs text-gray-500 hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAddCol({
                            rowId: gr.id,
                            colId: gc.id,
                          });
                        }}
                      >
                        <Plus className="inline-block h-3 w-3 mr-1" />
                        Add Block
                      </button>
                      {activeAddCol &&
                        activeAddCol.rowId === gr.id &&
                        activeAddCol.colId === gc.id && (
                          <div className="mt-2 w-full rounded-md border bg-white shadow-sm p-2 space-y-1 text-xs text-gray-700">
                            {[
                              "Atomic/Text",
                              "Atomic/Image",
                              "Atomic/Video",
                              "Atomic/Button",
                              "Atomic/Group",
                            ].map((t) => (
                              <button
                                key={t}
                                type="button"
                                className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 text-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  groupAddAtomic(groupBlock.id, gr.id, gc.id, t);
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
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    groupAddCol(groupBlock.id, gr.id);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Add Column
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-full border border-dashed border-gray-300 rounded-md py-2 text-xs text-gray-500 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                groupAddRow(groupBlock.id);
              }}
            >
              <Plus className="inline-block h-3 w-3 mr-1" />
              Add Row
            </button>
          </div>
        )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-xl border ${
        selection?.kind === "layout-section" && selection.blockId === block.id
          ? "ring-2 ring-blue-500 border-blue-300"
          : "border-gray-200"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({ kind: "layout-section", blockId: block.id });
      }}
    >
      <div className="absolute right-2 -top-3 bg-white border rounded-full shadow-sm flex items-center gap-1 p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition z-20">
        <button
          className="p-1 rounded hover:bg-gray-50 text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicateBlock?.(block.id);
          }}
          title="Duplicate section block"
          type="button"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          className="p-1 rounded hover:bg-red-50 text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock?.(block.id);
          }}
          title="Delete section block"
          type="button"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="absolute left-3 -top-3 text-[10px] bg-white px-2 py-0.5 border rounded-full text-gray-500">
        Section
      </div>

      <div
        className="p-4 group"
        style={{
          ...resolveLayoutStyle(props.style),
          position: getBackgroundVideo(props.style) ? "relative" : undefined,
        }}
      >
        {renderVideoLayer(getBackgroundVideo(props.style))}
        <div style={{ position: "relative", zIndex: 2 }}>
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
              const rowVideo = getBackgroundVideo(row.style);

              return (
                <div
                  key={row.id}
                  className={`group relative rounded-lg ${
                    showOutlines ? "border border-dashed border-gray-400 hover:ring-1 hover:ring-blue-200" : ""
                  } ${
                    rowSelected
                      ? "ring-2 ring-blue-500 border-blue-300"
                      : showOutlines
                        ? "border-gray-200"
                        : ""
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
                      position: rowVideo ? "relative" : undefined,
                    }}
                  >
                    {renderVideoLayer(rowVideo)}
                    <div
                      style={{
                        ...rowLayoutStyle,
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                    {(row.cols || []).map((col) => {
                      const colSelected =
                        selection?.kind === "layout-col" &&
                        selection.blockId === block.id &&
                        selection.rowId === row.id &&
                        selection.colId === col.id;
                      const colVideo = getBackgroundVideo(col.style);

                      return (
                        <div
                          key={col.id}
                          className={`group/col relative rounded-lg ${
                            showOutlines ? "border border-gray-400 hover:ring-1 hover:ring-blue-200" : ""
                          } ${
                            colSelected
                              ? "ring-2 ring-blue-500 border-blue-300"
                              : showOutlines
                                ? "border-gray-200"
                                : ""
                          }`}
                          style={{
                            ...resolveLayoutStyle(col.style),
                            ...resolveColFlexStyle(col.style),
                            position: colVideo ? "relative" : undefined,
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
                          {renderVideoLayer(colVideo)}
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

                          <div className="space-y-4 p-3" style={{ position: "relative", zIndex: 2 }}>
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
                                  className={`group relative rounded-md ${
                                    showOutlines ? "border border-gray-400" : ""
                                  } ${
                                    atomicSelected
                                      ? "ring-2 ring-blue-500 border-blue-300"
                                      : showOutlines
                                        ? "border-transparent hover:border-gray-200"
                                        : ""
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
                                  {atomic.type === "Atomic/Group"
                                    ? renderGroupLayout(atomic)
                                    : renderAtomicPreview(atomic, assetsMap)}
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
                                  <div className="absolute z-10 mt-2 w-full rounded-md border bg-white shadow-sm p-2 space-y-1 text-xs text-gray-700">
                                    {[
                                      "Atomic/Text",
                                      "Atomic/Image",
                                      "Atomic/Video",
                                      "Atomic/Button",
                                      "Atomic/Group",
                                    ].map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 text-gray-700"
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
    </div>
  );
}
