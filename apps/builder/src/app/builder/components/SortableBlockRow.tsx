"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
      className={`border rounded p-2 flex items-center justify-between gap-2 ${selected ? "ring-2 ring-black" : ""}`}
      onClick={onSelect}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{block.type}</div>
        <div className="text-xs opacity-60 truncate">{block.id}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="border rounded px-2 py-1 text-xs"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          Duplicate
        </button>
        <button
          className="border rounded px-2 py-1 text-xs"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </button>

        <button
          className="border rounded px-2 py-1 text-xs cursor-grab active:cursor-grabbing"
          type="button"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          Drag
        </button>
      </div>
    </div>
  );
}
