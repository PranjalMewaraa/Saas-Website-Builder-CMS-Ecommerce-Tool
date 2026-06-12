"use client";

import { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@acme/ui";
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

  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);

  function startRename(e: React.MouseEvent) {
    e.stopPropagation();
    setDraftLabel(label);
    setEditing(true);
  }

  function commitRename() {
    const next = draftLabel.trim();
    if (next) onRename(next);
    setEditing(false);
  }

  return (
    <div
      className={`border border-line rounded-card bg-surface ${isSelected ? "ring-2 ring-accent" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-2 p-2 border-b border-line">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted">
            Section
          </div>
          {editing ? (
            <input
              autoFocus
              aria-label="Section label"
              className="text-sm font-semibold w-full border border-line rounded-control px-2 py-1 bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              value={draftLabel}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDraftLabel(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setEditing(false);
                }
              }}
            />
          ) : (
            <div className="text-sm font-semibold truncate">{label}</div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={startRename}>
            Rename
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger-soft disabled:text-muted"
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
          </Button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`p-2 min-h-[64px] rounded-b-card transition-colors ${isOver ? "bg-accent-soft" : ""}`}
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
              <div className="text-xs text-muted border border-dashed border-line rounded-control p-3 text-center">
                Drop blocks here
              </div>
            ) : null}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
