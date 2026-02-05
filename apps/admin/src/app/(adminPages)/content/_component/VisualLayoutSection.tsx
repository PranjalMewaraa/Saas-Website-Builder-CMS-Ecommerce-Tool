"use client";

import React, { useEffect, useRef, useState } from "react";
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
    "4-col": { template: "repeat(4, minmax(0, 1fr))" },
    "sidebar-left": { template: "minmax(0, 1fr) minmax(0, 2fr)" },
    "sidebar-right": { template: "minmax(0, 2fr) minmax(0, 1fr)" },
    "three-uneven": {
      template: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
    },
    "two-one": { template: "minmax(0, 2fr) minmax(0, 1fr)" },
    "one-two": { template: "minmax(0, 1fr) minmax(0, 2fr)" },
    "three-one": { template: "minmax(0, 3fr) minmax(0, 1fr)" },
    "one-three": { template: "minmax(0, 1fr) minmax(0, 3fr)" },
    "two-one-one": {
      template: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
    },
    "one-one-two": {
      template: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)",
    },
    "one-two-one": {
      template: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
    },
  };

function resolveAssetUrl(assetId: string | undefined, assetsMap: any) {
  if (!assetId || !assetsMap) return "";
  return assetsMap[assetId]?.url || "";
}

function renderAtomicPreview(
  block: LayoutAtomicBlock,
  assetsMap: any,
  menus?: any[],
) {
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

  if (block.type === "Atomic/Icon") {
    const size = props.size ?? 24;
    return (
      <span
        style={{
          ...style,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: typeof size === "number" ? `${size}px` : size,
          color: props.color || style.color,
          lineHeight: 1,
        }}
      >
        {props.icon || "★"}
      </span>
    );
  }

  if (block.type === "Atomic/Divider") {
    const orientation = props.orientation || "horizontal";
    const thickness = props.thickness ?? 1;
    const length =
      props.length ?? (orientation === "horizontal" ? "100%" : 32);
    return (
      <div
        style={{
          ...style,
          width: orientation === "horizontal" ? length : thickness,
          height: orientation === "horizontal" ? thickness : length,
          backgroundColor: props.color || "#e5e7eb",
          borderRadius: 999,
        }}
      />
    );
  }

  if (block.type === "Atomic/Spacer") {
    const axis = props.axis || "vertical";
    const size = props.size ?? 24;
    return (
      <div
        style={{
          ...style,
          width: axis === "horizontal" ? size : "100%",
          height: axis === "vertical" ? size : "100%",
        }}
      />
    );
  }

  if (block.type === "Atomic/Badge") {
    return (
      <span
        style={{
          ...style,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 10px",
          borderRadius: 999,
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: "rgba(15,23,42,0.08)",
          color: "rgba(15,23,42,0.9)",
        }}
      >
        {props.text || "Badge"}
      </span>
    );
  }

  if (block.type === "Atomic/List") {
    const items = props.items || [];
    const icon = props.icon || "•";
    if (props.ordered) {
      return (
        <ol style={{ ...style, paddingLeft: "1.25rem" }}>
          {items.map((item: string, idx: number) => (
            <li key={idx} style={{ marginBottom: "0.35rem" }}>
              {item}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <ul style={{ ...style, paddingLeft: 0, listStyle: "none" }}>
        {items.map((item: string, idx: number) => (
          <li
            key={idx}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem" }}
          >
            <span>{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "Atomic/Card") {
    return (
      <div
        style={{
          ...style,
          border: "1px solid rgba(15,23,42,0.12)",
          borderRadius: 16,
          padding: 16,
          background: "#fff",
        }}
      >
        {props.imageUrl ? (
          <img
            src={props.imageUrl}
            alt={props.title || "Card image"}
            style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
          />
        ) : null}
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          {props.title || "Card title"}
        </div>
        <div style={{ fontSize: 14, color: "rgba(15,23,42,0.7)" }}>
          {props.body || "Card description goes here."}
        </div>
        {props.buttonText ? (
          <span
            style={{
              display: "inline-flex",
              marginTop: 12,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#0f172a",
              color: "#fff",
              fontSize: 12,
            }}
          >
            {props.buttonText}
          </span>
        ) : null}
      </div>
    );
  }

  if (block.type === "Atomic/Accordion") {
    const items = props.items || [];
    return (
      <div>
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            style={{
              border: "1px solid rgba(15,23,42,0.12)",
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 8,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            <div
              style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.7)" }}
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "Atomic/Menu") {
    const menuId = props.menuId;
    const menu =
      menus?.find((m: any) => m._id === menuId) ||
      menus?.find((m: any) => m.id === menuId) ||
      menus?.[0];
    const tree = menu?.tree || [];
    const gap = props.itemGap ?? 16;
    if (!tree.length) {
      return (
        <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded p-2">
          Menu
        </div>
      );
    }
    return (
      <div
        style={{
          display: props.orientation === "vertical" ? "block" : "flex",
          gap: typeof gap === "number" ? `${gap}px` : gap,
          alignItems: "center",
        }}
      >
        {tree.map((node: any) => (
          <span key={node.id} style={{ fontSize: 13 }}>
            {node.label}
          </span>
        ))}
      </div>
    );
  }

  if (block.type === "Atomic/Countdown") {
    const targetDate = props.targetDate
      ? new Date(props.targetDate)
      : null;
    const diff = targetDate
      ? Math.max(0, targetDate.getTime() - Date.now())
      : 0;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const display = props.showSeconds
      ? `${days}d ${hours}h ${mins}m ${secs}s`
      : `${days}d ${hours}h ${mins}m`;
    return (
      <div style={{ ...style }}>
        {props.label ? (
          <div style={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
            {props.label}
          </div>
        ) : null}
        <div style={{ fontSize: 20, fontWeight: 600 }}>{display}</div>
      </div>
    );
  }

  if (block.type === "Atomic/Embed") {
    if (props.code) {
      return <div dangerouslySetInnerHTML={{ __html: props.code }} />;
    }
    if (props.src) {
      return (
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <iframe
            src={props.src}
            title={props.title || "Embed"}
            style={{ width: "100%", height: 240, border: 0 }}
          />
        </div>
      );
    }
    return (
      <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded p-2">
        Embed
      </div>
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
  menus,
  onSelect,
  onChangeBlock,
  showOutlines = true,
  onDeleteBlock,
  onDuplicateBlock,
}: {
  block: any;
  selection: LayoutSelection | null;
  assetsMap: any;
  menus?: any[];
  onSelect: (sel: LayoutSelection) => void;
  onChangeBlock: (nextBlock: any) => void;
  showOutlines?: boolean;
  onDeleteBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
}) {
  const atomicOptions = [
    {
      type: "Atomic/Text",
      title: "Text",
      description: "Headings, paragraphs, rich text",
    },
    {
      type: "Atomic/Image",
      title: "Image",
      description: "Responsive image block",
    },
    {
      type: "Atomic/Video",
      title: "Video",
      description: "Embed or upload video",
    },
    {
      type: "Atomic/Button",
      title: "Button",
      description: "Primary and secondary CTAs",
    },
    {
      type: "Atomic/Icon",
      title: "Icon",
      description: "Emoji or symbol icon",
    },
    {
      type: "Atomic/Divider",
      title: "Divider",
      description: "Line separator",
    },
    {
      type: "Atomic/Spacer",
      title: "Spacer",
      description: "Adjustable empty space",
    },
    {
      type: "Atomic/Badge",
      title: "Badge",
      description: "Small label pill",
    },
    {
      type: "Atomic/List",
      title: "List",
      description: "Bulleted or numbered list",
    },
    {
      type: "Atomic/Card",
      title: "Card",
      description: "Container with image and text",
    },
    {
      type: "Atomic/Accordion",
      title: "Accordion",
      description: "FAQ style items",
    },
    {
      type: "Atomic/Menu",
      title: "Menu",
      description: "Links from a menu",
    },
    {
      type: "Atomic/Countdown",
      title: "Countdown",
      description: "Promo/event timer",
    },
    {
      type: "Atomic/Embed",
      title: "Embed",
      description: "Iframe or HTML embed",
    },
    {
      type: "Atomic/Group",
      title: "Group",
      description: "Nested layout inside a column",
    },
  ];
  const props: LayoutSectionProps =
    block.props && block.props.rows ? block.props : { style: {}, rows: [] };
  const rows = props.rows || [];

  const [addAtomicDialog, setAddAtomicDialog] = useState<{
    rowId: string;
    colId: string;
    groupId?: string;
  } | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const prevScrollRef = useRef<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!addAtomicDialog) return;
    const scroller = document.querySelector(
      ".visual-canvas-scroll",
    ) as HTMLElement | null;
    if (!scroller) return;
    prevScrollRef.current = { top: scroller.scrollTop, left: scroller.scrollLeft };
    // allow layout to paint
    requestAnimationFrame(() => {
      scroller.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
      dialogRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [addAtomicDialog]);

  useEffect(() => {
    if (addAtomicDialog) return;
    const prev = prevScrollRef.current;
    if (!prev) return;
    const scroller = document.querySelector(
      ".visual-canvas-scroll",
    ) as HTMLElement | null;
    if (!scroller) return;
    scroller.scrollTo({ top: prev.top, left: prev.left, behavior: "smooth" });
    prevScrollRef.current = null;
  }, [addAtomicDialog]);

  function updateProps(next: LayoutSectionProps) {
    onChangeBlock({ ...block, props: next });
  }

  function addRow() {
    const row = createDefaultRow();
    updateProps({ ...props, rows: [...rows, row] });
    onSelect({ kind: "layout-row", blockId: block.id, rowId: row.id });
  }

  function moveRowTo(fromRowId: string, toRowId: string) {
    if (!fromRowId || !toRowId || fromRowId === toRowId) return;
    const fromIndex = rows.findIndex((r) => r.id === fromRowId);
    const toIndex = rows.findIndex((r) => r.id === toRowId);
    if (fromIndex < 0 || toIndex < 0) return;
    const nextRows = structuredClone(rows);
    const [item] = nextRows.splice(fromIndex, 1);
    nextRows.splice(toIndex, 0, item);
    updateProps({ ...props, rows: nextRows });
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

  function moveColTo(rowId: string, fromColId: string, toColId: string) {
    if (!fromColId || !toColId || fromColId === toColId) return;
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      const fromIndex = next.cols.findIndex((c: any) => c.id === fromColId);
      const toIndex = next.cols.findIndex((c: any) => c.id === toColId);
      if (fromIndex < 0 || toIndex < 0) return next;
      const [item] = next.cols.splice(fromIndex, 1);
      next.cols.splice(toIndex, 0, item);
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

  function moveAtomicTo(
    rowId: string,
    colId: string,
    fromAtomId: string,
    toAtomId: string,
  ) {
    if (!fromAtomId || !toAtomId || fromAtomId === toAtomId) return;
    const nextRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = structuredClone(r);
      const col = (next.cols || []).find((c: any) => c.id === colId);
      if (!col) return next;
      const fromIndex = col.blocks.findIndex((b: any) => b.id === fromAtomId);
      const toIndex = col.blocks.findIndex((b: any) => b.id === toAtomId);
      if (fromIndex < 0 || toIndex < 0) return next;
      const [item] = col.blocks.splice(fromIndex, 1);
      col.blocks.splice(toIndex, 0, item);
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

  function groupMoveRow(atomicId: string, fromRowId: string, toRowId: string) {
    if (!fromRowId || !toRowId || fromRowId === toRowId) return;
    updateGroupProps(atomicId, (gp: any) => {
      const rows = gp.rows || [];
      const fromIndex = rows.findIndex((r: any) => r.id === fromRowId);
      const toIndex = rows.findIndex((r: any) => r.id === toRowId);
      if (fromIndex < 0 || toIndex < 0) return;
      const [item] = rows.splice(fromIndex, 1);
      rows.splice(toIndex, 0, item);
      gp.rows = rows;
    });
  }

  function groupMoveCol(
    atomicId: string,
    rowId: string,
    fromColId: string,
    toColId: string,
  ) {
    if (!fromColId || !toColId || fromColId === toColId) return;
    updateGroupProps(atomicId, (gp: any) => {
      const row = (gp.rows || []).find((r: any) => r.id === rowId);
      if (!row) return;
      const fromIndex = row.cols.findIndex((c: any) => c.id === fromColId);
      const toIndex = row.cols.findIndex((c: any) => c.id === toColId);
      if (fromIndex < 0 || toIndex < 0) return;
      const [item] = row.cols.splice(fromIndex, 1);
      row.cols.splice(toIndex, 0, item);
    });
  }

  function groupMoveAtomic(
    atomicId: string,
    rowId: string,
    colId: string,
    fromAtomId: string,
    toAtomId: string,
  ) {
    if (!fromAtomId || !toAtomId || fromAtomId === toAtomId) return;
    updateGroupProps(atomicId, (gp: any) => {
      const row = (gp.rows || []).find((r: any) => r.id === rowId);
      if (!row) return;
      const col = (row.cols || []).find((c: any) => c.id === colId);
      if (!col) return;
      const fromIndex = col.blocks.findIndex((b: any) => b.id === fromAtomId);
      const toIndex = col.blocks.findIndex((b: any) => b.id === toAtomId);
      if (fromIndex < 0 || toIndex < 0) return;
      const [item] = col.blocks.splice(fromIndex, 1);
      col.blocks.splice(toIndex, 0, item);
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
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({
                      type: "group-row",
                      groupId: groupBlock.id,
                      rowId: gr.id,
                    }),
                  );
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  try {
                    const data = JSON.parse(
                      e.dataTransfer.getData("text/plain"),
                    );
                    if (
                      data?.type === "group-row" &&
                      data.groupId === groupBlock.id
                    ) {
                      groupMoveRow(groupBlock.id, data.rowId, gr.id);
                    }
                  } catch {}
                }}
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
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData(
                          "text/plain",
                          JSON.stringify({
                            type: "group-col",
                            groupId: groupBlock.id,
                            rowId: gr.id,
                            colId: gc.id,
                          }),
                        );
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        try {
                          const data = JSON.parse(
                            e.dataTransfer.getData("text/plain"),
                          );
                          if (
                            data?.type === "group-col" &&
                            data.groupId === groupBlock.id &&
                            data.rowId === gr.id
                          ) {
                            groupMoveCol(
                              groupBlock.id,
                              gr.id,
                              data.colId,
                              gc.id,
                            );
                          }
                        } catch {}
                      }}
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
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData(
                              "text/plain",
                              JSON.stringify({
                                type: "group-atomic",
                                groupId: groupBlock.id,
                                rowId: gr.id,
                                colId: gc.id,
                                atomId: ga.id,
                              }),
                            );
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            try {
                              const data = JSON.parse(
                                e.dataTransfer.getData("text/plain"),
                              );
                              if (
                                data?.type === "group-atomic" &&
                                data.groupId === groupBlock.id &&
                                data.rowId === gr.id &&
                                data.colId === gc.id
                              ) {
                                groupMoveAtomic(
                                  groupBlock.id,
                                  gr.id,
                                  gc.id,
                                  data.atomId,
                                  ga.id,
                                );
                              }
                            } catch {}
                          }}
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
                            : renderAtomicPreview(ga, assetsMap, menus)}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="w-full border border-dashed border-gray-300 rounded-md py-2 text-xs text-gray-500 hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddAtomicDialog({
                            rowId: gr.id,
                            colId: gc.id,
                            groupId: groupBlock.id,
                          });
                        }}
                      >
                        <Plus className="inline-block h-3 w-3 mr-1" />
                        Add Block
                      </button>
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
                  draggable
                  className={`group relative rounded-lg ${
                    showOutlines
                      ? "border border-dashed border-gray-400 hover:ring-1 hover:ring-blue-200"
                      : ""
                  } ${
                    rowSelected
                      ? "ring-2 ring-blue-500 border-blue-300"
                      : showOutlines
                        ? "border-gray-200"
                        : ""
                  }`}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData(
                      "text/plain",
                      JSON.stringify({ type: "row", rowId: row.id }),
                    );
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    try {
                      const data = JSON.parse(
                        e.dataTransfer.getData("text/plain"),
                      );
                      if (data?.type === "row") {
                        moveRowTo(data.rowId, row.id);
                      }
                    } catch {}
                  }}
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
                          draggable
                          className={`group/col relative rounded-lg ${
                            showOutlines
                              ? "border border-gray-400 hover:ring-1 hover:ring-blue-200"
                              : ""
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
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData(
                              "text/plain",
                              JSON.stringify({
                                type: "col",
                                rowId: row.id,
                                colId: col.id,
                              }),
                            );
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            try {
                              const data = JSON.parse(
                                e.dataTransfer.getData("text/plain"),
                              );
                              if (data?.type === "col" && data.rowId === row.id) {
                                moveColTo(row.id, data.colId, col.id);
                              }
                            } catch {}
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
                                  draggable
                                  className={`group relative rounded-md ${
                                    showOutlines ? "border border-gray-400" : ""
                                  } ${
                                    atomicSelected
                                      ? "ring-2 ring-blue-500 border-blue-300"
                                      : showOutlines
                                        ? "border-transparent hover:border-gray-200"
                                        : ""
                                  }`}
                                  onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = "move";
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      JSON.stringify({
                                        type: "atomic",
                                        rowId: row.id,
                                        colId: col.id,
                                        atomId: atomic.id,
                                      }),
                                    );
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    try {
                                      const data = JSON.parse(
                                        e.dataTransfer.getData("text/plain"),
                                      );
                                      if (
                                        data?.type === "atomic" &&
                                        data.rowId === row.id &&
                                        data.colId === col.id
                                      ) {
                                        moveAtomicTo(
                                          row.id,
                                          col.id,
                                          data.atomId,
                                          atomic.id,
                                        );
                                      }
                                    } catch {}
                                  }}
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
                                    : renderAtomicPreview(atomic, assetsMap, menus)}
                                </div>
                              );
                            })}

                            <div className="relative">
                              <button
                                type="button"
                                className="w-full border border-dashed border-gray-300 rounded-md py-2 text-xs text-gray-500 hover:bg-gray-50 opacity-0 pointer-events-none group-hover/col:opacity-100 group-hover/col:pointer-events-auto transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddAtomicDialog({
                                    rowId: row.id,
                                    colId: col.id,
                                  });
                                }}
                                title="Add block"
                              >
                                <Plus className="inline-block h-3 w-3 mr-1" />
                                Add Block
                              </button>
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

      {addAtomicDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAddAtomicDialog(null)}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Add New Block
                </div>
                <div className="text-xs text-gray-500">
                  Choose an atomic block to insert.
                </div>
              </div>
              <button
                type="button"
                className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                onClick={() => setAddAtomicDialog(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {atomicOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 text-left hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    if (addAtomicDialog.groupId) {
                      groupAddAtomic(
                        addAtomicDialog.groupId,
                        addAtomicDialog.rowId,
                        addAtomicDialog.colId,
                        opt.type,
                      );
                    } else {
                      addAtomic(
                        addAtomicDialog.rowId,
                        addAtomicDialog.colId,
                        opt.type,
                      );
                    }
                    setAddAtomicDialog(null);
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                    {opt.title.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {opt.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {opt.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
