"use client";

import React from "react";
import { VisualBlockRenderer } from "../../../../../../../packages/renderer/VisualBlockRenderer";
import { Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import VisualLayoutSection from "./VisualLayoutSection";
import type { LayoutSelection } from "./layout-utils";

const BREAKPOINT_FRAME = {
  desktop: { label: "Desktop", width: null },
  laptop: { label: "Laptop", width: 1280 },
  tablet: { label: "Tablet", width: 834 },
  mobile: { label: "Mobile", width: 390 },
} as const;

export function VisualCanvas({
  layout,
  selection,
  onSelect,
  onChangeBlock,
  assetsMap,
  menus,
  showGrid = false,
  showOutlines = true,
  zoom = 100,
  fitMode = false,
  activeBreakpoint = "desktop",
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
}: {
  layout: any;
  selection: LayoutSelection | null;
  onSelect: (sel: LayoutSelection) => void;
  onChangeBlock: (nextBlock: any) => void;
  assetsMap: any;
  menus?: any[];
  showGrid?: boolean;
  showOutlines?: boolean;
  zoom?: number;
  fitMode?: boolean;
  activeBreakpoint?: keyof typeof BREAKPOINT_FRAME;
  onAddBlock?: (type: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
  onMoveBlock?: (fromId: string, toId: string) => void;
}) {
  const blocks = layout.sections?.[0]?.blocks ?? [];
  const [dragBlockId, setDragBlockId] = React.useState<string | null>(null);
  const canvasViewportRef = React.useRef<HTMLDivElement | null>(null);
  const [availableWidth, setAvailableWidth] = React.useState(0);
  const frameConfig =
    BREAKPOINT_FRAME[activeBreakpoint] || BREAKPOINT_FRAME.desktop;
  const requestedZoom = Math.max(25, Math.min(200, zoom));

  React.useEffect(() => {
    const node = canvasViewportRef.current;
    if (!node) return;

    const update = () => {
      setAvailableWidth(node.clientWidth);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const effectiveZoom =
    frameConfig.width && availableWidth > 0
      ? Math.max(
          25,
          Math.min(
            fitMode ? 100 : requestedZoom,
            Math.floor(((availableWidth - 32) / frameConfig.width) * 100),
          ),
        )
      : requestedZoom;
  const scaledFrameWidth = frameConfig.width
    ? Math.max(320, Math.round((frameConfig.width * effectiveZoom) / 100))
    : null;
  const fitTargetZoom =
    frameConfig.width && availableWidth > 0
      ? Math.max(
          25,
          Math.min(
            100,
            Math.floor(((availableWidth - 32) / frameConfig.width) * 100),
          ),
        )
      : requestedZoom;
  const isAutoFit = frameConfig.width
    ? fitMode || effectiveZoom < requestedZoom
    : false;

  if (!blocks.length) {
    return (
      <div className="h-full min-h-0 bg-gray-50 p-6 rounded-xl">
        <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center bg-white">
          <div className="text-lg font-semibold text-gray-800">
            Start building your page
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Add your first block to begin.
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => onAddBlock?.("Hero/V1")}
            >
              Add Hero
            </button>
            <button
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => onAddBlock?.("Layout/Section")}
            >
              Add Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  const gridStyle = showGrid
    ? {
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }
    : {};

  return (
    <div
      className="h-full min-h-0 bg-gray-50 p-6 rounded-xl space-y-6 overflow-auto"
      style={gridStyle}
      ref={canvasViewportRef}
    >
      <div className="mx-auto flex min-h-full w-full justify-center px-2 pb-12 pt-1">
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
            <span>{frameConfig.label}</span>
            <span className="text-slate-300">•</span>
            <span>
              {frameConfig.width ? `${frameConfig.width}px` : "Fluid width"}
            </span>
            <span className="text-slate-300">•</span>
            <span>{effectiveZoom}% zoom</span>
            {isAutoFit ? (
              <>
                <span className="text-slate-300">•</span>
                <span>
                  {fitMode
                    ? `fit mode${fitTargetZoom !== effectiveZoom ? ` (${fitTargetZoom}% target)` : ""}`
                    : `fit from ${requestedZoom}%`}
                </span>
              </>
            ) : null}
          </div>
          <div
            className={`relative transition-all duration-200 ${
              frameConfig.width
                ? "rounded-[28px] border border-slate-300 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                : "w-full"
            }`}
            style={{
              width: scaledFrameWidth ? `${scaledFrameWidth}px` : "100%",
              maxWidth: "100%",
            }}
          >
            {frameConfig.width ? (
              <div className="mb-3 flex items-center justify-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/60" />
              </div>
            ) : null}
            <div
              style={
                {
                  zoom: `${effectiveZoom}%`,
                  width: "100%",
                } as any
              }
            >
              <div className="space-y-6">
                {blocks.map((b: any) => {
                  if (b.type === "Layout/Section") {
                    return (
                      <div
                        key={b.id}
                        className="relative"
                        draggable
                        onDragStart={(e) => {
                          setDragBlockId(b.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", b.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromId =
                            dragBlockId || e.dataTransfer.getData("text/plain");
                          if (fromId) onMoveBlock?.(fromId, b.id);
                          setDragBlockId(null);
                        }}
                        onDragEnd={() => setDragBlockId(null)}
                      >
                        <VisualLayoutSection
                          block={b}
                          selection={selection}
                          assetsMap={assetsMap}
                          menus={menus}
                          onSelect={onSelect}
                          onChangeBlock={onChangeBlock}
                          showOutlines={showOutlines}
                          onDeleteBlock={onDeleteBlock}
                          onDuplicateBlock={onDuplicateBlock}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={b.id}
                      className="relative group"
                      draggable
                      onDragStart={(e) => {
                        setDragBlockId(b.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", b.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId =
                          dragBlockId || e.dataTransfer.getData("text/plain");
                        if (fromId) onMoveBlock?.(fromId, b.id);
                        setDragBlockId(null);
                      }}
                      onDragEnd={() => setDragBlockId(null)}
                    >
                      <div className="absolute right-2 -top-3 bg-white border rounded-full shadow-sm flex items-center gap-1 p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition z-20">
                        <button
                          className="p-1 rounded hover:bg-gray-50 text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateBlock?.(b.id);
                          }}
                          title="Duplicate block"
                          type="button"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBlock?.(b.id);
                          }}
                          title="Delete block"
                          type="button"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <VisualBlockRenderer
                        block={b}
                        isSelected={
                          selection?.kind === "block" &&
                          selection.blockId === b.id
                        }
                        onSelect={() =>
                          onSelect({ kind: "block", blockId: b.id })
                        }
                        showOutlines={showOutlines}
                        menus={menus}
                        activeBreakpoint={activeBreakpoint}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
