"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@acme/ui";

export default function SortableBlockRow({
  block,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: any;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-line rounded-control bg-surface p-2 flex items-center justify-between gap-2 ${selected ? "ring-2 ring-accent" : ""}`}
      onClick={onSelect}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{block.type}</div>
        <div className="text-xs text-muted truncate">{block.id}</div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          Duplicate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger hover:bg-danger-soft"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          Drag
        </Button>
      </div>
    </div>
  );
}
