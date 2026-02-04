"use client";

import { VisualBlockRenderer } from "../../../../../../../packages/renderer/VisualBlockRenderer";
import { Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import VisualLayoutSection from "./VisualLayoutSection";
import type { LayoutSelection } from "./layout-utils";

export function VisualCanvas({
  layout,
  selection,
  onSelect,
  onChangeBlock,
  assetsMap,
  showGrid = false,
  showOutlines = true,
  zoom = 100,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: {
  layout: any;
  selection: LayoutSelection | null;
  onSelect: (sel: LayoutSelection) => void;
  onChangeBlock: (nextBlock: any) => void;
  assetsMap: any;
  showGrid?: boolean;
  showOutlines?: boolean;
  zoom?: number;
  onAddBlock?: (type: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
}) {
  const blocks = layout.sections?.[0]?.blocks ?? [];

  if (!blocks.length) {
    return (
      <div className="min-h-[70vh] bg-gray-50 p-6 rounded-xl">
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
      className="min-h-[70vh] bg-gray-50 p-6 rounded-xl space-y-6 overflow-auto"
      style={gridStyle}
    >
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top left",
        }}
      >
        <div className="space-y-6">
          {blocks.map((b: any) => {
            if (b.type === "Layout/Section") {
              return (
                <VisualLayoutSection
                  key={b.id}
                  block={b}
                  selection={selection}
                  assetsMap={assetsMap}
                  onSelect={onSelect}
                  onChangeBlock={onChangeBlock}
                  showOutlines={showOutlines}
                  onDeleteBlock={onDeleteBlock}
                />
              );
            }

            return (
              <div key={b.id} className="relative group">
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
                    selection?.kind === "block" && selection.blockId === b.id
                  }
                  onSelect={() => onSelect({ kind: "block", blockId: b.id })}
                  showOutlines={showOutlines}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
