"use client";

import { VisualBlockRenderer } from "../../../../../../../packages/renderer/VisualBlockRenderer";
import VisualLayoutSection from "./VisualLayoutSection";
import type { LayoutSelection } from "./layout-utils";

export function VisualCanvas({
  layout,
  selection,
  onSelect,
  onChangeBlock,
  assetsMap,
}: {
  layout: any;
  selection: LayoutSelection | null;
  onSelect: (sel: LayoutSelection) => void;
  onChangeBlock: (nextBlock: any) => void;
  assetsMap: any;
}) {
  const blocks = layout.sections?.[0]?.blocks ?? [];

  return (
    <div className="min-h-[70vh] bg-gray-50 p-6 rounded-xl space-y-6">
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
            />
          );
        }

        return (
          <VisualBlockRenderer
            key={b.id}
            block={b}
            isSelected={selection?.kind === "block" && selection.blockId === b.id}
            onSelect={() => onSelect({ kind: "block", blockId: b.id })}
          />
        );
      })}
    </div>
  );
}
