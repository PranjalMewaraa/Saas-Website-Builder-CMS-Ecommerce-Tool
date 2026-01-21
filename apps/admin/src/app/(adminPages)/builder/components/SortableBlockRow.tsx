"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Copy,
  Trash2,
  Type,
  Image as ImageIcon,
  Layout,
  // add more icons for specific block types if you want
} from "lucide-react";

type Block = {
  id: string;
  type: string;
  // you can extend with more fields if needed (e.g. content preview)
};

interface SortableBlockRowProps {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function SortableBlockRow({
  block,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableBlockRowProps) {
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
    opacity: isDragging ? 0.75 : 1,
    scale: isDragging ? 1.02 : 1,
    boxShadow: isDragging ? "0 10px 25px -5px rgba(0,0,0,0.15)" : "none",
  };

  // Optional: map block types to icons (customize as needed)
  const getBlockIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "text":
      case "heading":
      case "paragraph":
        return <Type size={16} />;
      case "image":
      case "gallery":
        return <ImageIcon size={16} />;
      case "section":
      case "container":
      case "hero":
        return <Layout size={16} />;
      default:
        return <Layout size={16} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-3 p-3 rounded-lg border 
        transition-all duration-150 cursor-pointer
        ${
          selected
            ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/40 shadow-sm"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/80"
        }
        ${isDragging ? "shadow-lg z-10" : ""}
      `}
      onClick={onSelect}
    >
      {/* Drag handle – always visible on hover / when selected */}
      <button
        type="button"
        className={`
          flex items-center justify-center w-8 h-8 rounded-md
          text-gray-400 hover:text-gray-700 hover:bg-gray-100
          transition-colors cursor-grab active:cursor-grabbing
          ${isDragging ? "text-blue-600 bg-blue-50" : ""}
        `}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder block"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={18} />
      </button>

      {/* Block icon + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`
            flex items-center justify-center w-8 h-8 rounded-md
            ${selected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}
          `}
        >
          {getBlockIcon(block.type)}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
          </div>
          <div className="text-xs text-gray-500 font-mono truncate">
            {block.id.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Duplicate block"
        >
          <Copy size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete block"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
