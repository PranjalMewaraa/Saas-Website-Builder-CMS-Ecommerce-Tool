"use client";

import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// optional: define MenuNode type in separate file
import { Transform, Transition } from "@dnd-kit/utilities";
import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
type MenuNode = {
  id: string;
  label: string;
  type?: "page" | "external";
  ref?: { slug?: string; href?: string };
  children?: MenuNode[];
};

type Props = {
  item: MenuNode;
  idx: number;
  tree: MenuNode[];
  setTree: (t: MenuNode[]) => void;
  pages: { slug: string; title: string }[];
  addItem: (parent?: MenuNode) => void;
  removeItem: (idx: number, parent?: MenuNode) => void;
  updateItem: (idx: number, item: MenuNode, parent?: MenuNode) => void;
  parent?: MenuNode;
};

export default function SortableItem({
  item,
  idx,
  tree,
  setTree,
  pages,
  addItem,
  removeItem,
  updateItem,
  parent,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform as Transform),
    transition,
  };

  const [expanded, setExpanded] = useState(true);

  function handleChildDragEnd(oldIndex: number, newIndex: number) {
    if (!item.children) return;
    const nextChildren = arrayMove(item.children, oldIndex, newIndex);
    updateItem(idx, { ...item, children: nextChildren }, parent);
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded p-2 mb-1">
      <div className="flex gap-2 items-center">
        <span {...listeners} {...attributes} className="cursor-move">
          ☰
        </span>
        <input
          className="border rounded p-1 flex-1"
          value={item.label}
          onChange={(e) =>
            updateItem(idx, { ...item, label: e.target.value }, parent)
          }
        />
        <select
          className="border rounded p-1"
          value={item.type || "page"}
          onChange={(e) => {
            const t = e.target.value as "page" | "external";
            updateItem(idx, { ...item, type: t }, parent);
          }}
        >
          <option value="page">page</option>
          <option value="external">external</option>
        </select>
        {item.type === "page" ? (
          <select
            className="border rounded p-1 flex-1"
            value={item.ref?.slug || ""}
            onChange={(e) => {
              const ref = { slug: e.target.value };
              updateItem(idx, { ...item, ref }, parent);
            }}
          >
            <option value="">-- select page --</option>
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title || p.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="border rounded p-1 flex-1"
            placeholder="https://..."
            value={item.ref?.href || ""}
            onChange={(e) => {
              const ref = { href: e.target.value };
              updateItem(idx, { ...item, ref }, parent);
            }}
          />
        )}
        <button
          type="button"
          className="border px-2 rounded text-sm"
          onClick={() => addItem(item)}
        >
          +
        </button>
        <button
          type="button"
          className="border px-2 rounded text-sm"
          onClick={() => removeItem(idx, parent)}
        >
          ✕
        </button>
        {item.children && item.children.length > 0 && (
          <button
            type="button"
            className="border px-2 rounded text-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▼" : "▶"}
          </button>
        )}
      </div>

      {/* Nested children */}
      {item.children && item.children.length > 0 && expanded && (
        <div className="ml-6 mt-1">
          <SortableContext
            items={item.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {item.children.map((child, cIdx) => (
              <SortableItem
                key={child.id}
                item={child}
                idx={cIdx}
                tree={item.children!}
                setTree={(nextChildren) =>
                  updateItem(idx, { ...item, children: nextChildren }, parent)
                }
                pages={pages}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
                parent={item}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
