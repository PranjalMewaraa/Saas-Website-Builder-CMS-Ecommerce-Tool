"use client";

import { useMemo, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import SortableBlockRow from "./SortableBlockRow";
import {
  Pencil,
  Trash2,
  Plus,
  GripVertical,
  AlertTriangle,
} from "lucide-react";

interface Section {
  id: string;
  label?: string;
  blocks: Array<{ id: string; type: string }>;
}

interface SectionCanvasProps {
  layout: { sections: Section[] };
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  onSelectBlock: (blockId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onRenameSection: (sectionId: string, label: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

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
}: SectionCanvasProps) {
  const sections = layout.sections ?? [];

  return (
    <div className="space-y-5">
      {sections.map((section, idx) => (
        <SectionCard
          key={section.id}
          section={section}
          index={idx}
          isSelected={selectedSectionId === section.id}
          isFirst={idx === 0}
          selectedBlockId={selectedBlockId}
          onSelect={() => onSelectSection(section.id)}
          onRename={(label) => onRenameSection(section.id, label)}
          onDelete={() => onDeleteSection(section.id)}
          onSelectBlock={onSelectBlock}
          onDeleteBlock={onDeleteBlock}
          onDuplicateBlock={onDuplicateBlock}
        />
      ))}
    </div>
  );
}

interface SectionCardProps {
  section: Section;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  selectedBlockId: string | null;
  onSelect: () => void;
  onRename: (label: string) => void;
  onDelete: () => void;
  onSelectBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
}

function SectionCard({
  section,
  index,
  isSelected,
  isFirst,
  selectedBlockId,
  onSelect,
  onRename,
  onDelete,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: SectionCardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempLabel, setTempLabel] = useState(
    section.label || `Section ${index + 1}`
  );

  const blocks = section.blocks ?? [];
  const label = section.label || `Section ${index + 1}`;

  const handleRenameSave = () => {
    const trimmed = tempLabel.trim();
    if (trimmed && trimmed !== label) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  const handleDeleteWithConfirm = () => {
    if (isFirst) return;
    if (confirm(`Delete section "${label}" and all its blocks?`)) {
      onDelete();
    }
  };

  return (
    <div
      className={`
        rounded-xl border bg-white shadow-sm overflow-hidden
        transition-all duration-150
        ${isSelected ? "ring-2 ring-blue-500 border-blue-300" : "border-gray-200 hover:border-gray-300"}
      `}
      onClick={onSelect}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-gray-50/70">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Section {index + 1}
          </div>

          {isRenaming ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSave();
                  if (e.key === "Escape") setIsRenaming(false);
                }}
                onBlur={handleRenameSave}
                className="min-w-[140px] px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameSave();
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Save
              </button>
            </div>
          ) : (
            <div
              className="text-sm font-semibold truncate cursor-pointer hover:text-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              {label}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isRenaming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Rename section"
            >
              <Pencil size={16} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteWithConfirm();
            }}
            disabled={isFirst}
            title={
              isFirst ? "Cannot delete the first section" : "Delete section"
            }
            className={`
              p-1.5 rounded-md transition-colors
              ${
                isFirst
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              }
            `}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Droppable Blocks Area */}
      <div
        ref={setNodeRef}
        className={`
          min-h-[80px] p-4 transition-colors duration-150
          ${isOver ? "bg-blue-50/60 border-2 border-dashed border-blue-400" : "bg-white"}
        `}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2.5">
            {blocks.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Drop blocks here</p>
                <p className="text-xs text-gray-400">
                  or click blocks from the library on the right
                </p>
              </div>
            ) : (
              blocks.map((block) => (
                <SortableBlockRow
                  key={block.id}
                  block={block}
                  selected={selectedBlockId === block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                  onDuplicate={() => onDuplicateBlock(block.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
