"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import SortableBlockRow from "./SortableBlockRow";

export default function SectionCanvas({
  layout,
  selectedBlockId,
  selectedSectionId,
  onSelectBlock,
  onSelectSection,
  onDeleteBlock,
  onDuplicateBlock,
  onRenameSection,
  onDeleteSection,
}: {
  layout: any;
  selectedBlockId: string;
  selectedSectionId: string;
  onSelectBlock: (blockId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onRenameSection: (sectionId: string, label: string) => void;
  onDeleteSection: (sectionId: string) => void;
}) {
  const sections = layout.sections ?? [];

  return (
    <div className="space-y-4">
      {sections.map((sec: any, idx: number) => (
        <SectionCard
          key={sec.id}
          section={sec}
          isSelected={selectedSectionId === sec.id}
          isFirst={idx === 0}
          onSelect={() => onSelectSection(sec.id)}
          onRename={(label: string) => onRenameSection(sec.id, label)}
          onDelete={() => onDeleteSection(sec.id)}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onDeleteBlock={onDeleteBlock}
          onDuplicateBlock={onDuplicateBlock}
        />
      ))}
    </div>
  );
}

function SectionCard({
  section,
  isSelected,
  isFirst,
  onSelect,
  onRename,
  onDelete,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: any) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });

  const blocks = section.blocks ?? [];
  const label = section.label || section.id;

  return (
    <div
      className={`border rounded-lg ${isSelected ? "ring-2 ring-black" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-2 p-2 border-b">
        <div className="min-w-0">
          <div className="text-xs uppercase opacity-60">Section</div>
          <div className="text-sm font-semibold truncate">{label}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 text-xs"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = prompt("Section label", label);
              if (next != null) onRename(String(next).trim());
            }}
          >
            Rename
          </button>

          <button
            className="border rounded px-2 py-1 text-xs"
            type="button"
            disabled={isFirst}
            title={
              isFirst
                ? "Home section can't be deleted in MVP"
                : "Delete section"
            }
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`p-2 min-h-[64px] ${isOver ? "bg-black/5" : ""}`}
      >
        <SortableContext
          items={blocks.map((b: any) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {blocks.map((b: any) => (
              <SortableBlockRow
                key={b.id}
                block={b}
                selected={selectedBlockId === b.id}
                onSelect={() => onSelectBlock(b.id)}
                onDelete={() => onDeleteBlock(b.id)}
                onDuplicate={() => onDuplicateBlock(b.id)}
              />
            ))}

            {blocks.length === 0 ? (
              <div className="text-xs opacity-60 border border-dashed rounded p-3">
                Drop blocks here
              </div>
            ) : null}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
