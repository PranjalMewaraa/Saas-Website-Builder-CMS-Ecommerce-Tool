"use client";

import { VisualBlockRenderer } from "../../../../../../../packages/renderer/VisualBlockRenderer";

export function VisualCanvas({ layout, selectedId, setSelectedId }: any) {
  const blocks = layout.sections?.[0]?.blocks ?? [];

  return (
    <div className="min-h-[70vh] bg-gray-50 p-6 rounded-xl space-y-6">
      {blocks.map((b: any) => (
        <VisualBlockRenderer
          key={b.id}
          block={b}
          isSelected={selectedId === b.id}
          onSelect={() => setSelectedId(b.id)}
        />
      ))}
    </div>
  );
}
