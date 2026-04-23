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
  mega?: {
    enabled?: boolean;
    columns?: number;
    sections?: Array<{
      title?: string;
      links?: Array<{
        label?: string;
        type?: "page" | "external";
        ref?: { slug?: string; href?: string };
        href?: string;
        badge?: string;
      }>;
    }>;
    promo?: {
      title?: string;
      description?: string;
      ctaText?: string;
      ctaHref?: string;
    };
  };
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
  const isTopLevel = !parent;
  const megaEnabled = !!item.mega?.enabled;

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
                {p.title}
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

      {isTopLevel && (
        <div className="mt-2 rounded border bg-slate-50 p-2 space-y-2">
          <label className="inline-flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={megaEnabled}
              onChange={(e) =>
                updateItem(
                  idx,
                  {
                    ...item,
                    mega: e.target.checked
                      ? {
                          enabled: true,
                          columns: item.mega?.columns || 3,
                          sections:
                            item.mega?.sections && item.mega.sections.length
                              ? item.mega.sections
                              : [
                                  {
                                    title: "Column 1",
                                    links: [
                                      {
                                        label: "Link",
                                        type: "page",
                                        ref: { slug: pages[0]?.slug || "" },
                                      },
                                    ],
                                  },
                                ],
                          promo: item.mega?.promo || {
                            title: "Promo",
                            description: "",
                            ctaText: "Shop Now",
                            ctaHref: "/products",
                          },
                        }
                      : { enabled: false },
                  },
                  parent,
                )
              }
            />
            Enable Mega Menu
          </label>

          {megaEnabled ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">
                  <div className="mb-1 opacity-70">Columns</div>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    className="w-full border rounded p-1"
                    value={item.mega?.columns || 3}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        {
                          ...item,
                          mega: {
                            ...item.mega,
                            enabled: true,
                            columns: Math.max(
                              1,
                              Math.min(6, Number(e.target.value || 1)),
                            ),
                          },
                        },
                        parent,
                      )
                    }
                  />
                </label>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium">Mega Sections</div>
                {(item.mega?.sections || []).map((section, sIdx) => (
                  <div key={sIdx} className="rounded border bg-white p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] opacity-70">Section {sIdx + 1}</div>
                      <button
                        type="button"
                        className="text-[11px] border rounded px-1.5 py-0.5"
                        onClick={() => {
                          const nextSections = [...(item.mega?.sections || [])];
                          nextSections.splice(sIdx, 1);
                          updateItem(
                            idx,
                            {
                              ...item,
                              mega: { ...item.mega, enabled: true, sections: nextSections },
                            },
                            parent,
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      className="w-full border rounded p-1 text-xs"
                      placeholder="Section title"
                      value={section.title || ""}
                      onChange={(e) => {
                        const nextSections = [...(item.mega?.sections || [])];
                        nextSections[sIdx] = {
                          ...nextSections[sIdx],
                          title: e.target.value,
                        };
                        updateItem(
                          idx,
                          {
                            ...item,
                            mega: { ...item.mega, enabled: true, sections: nextSections },
                          },
                          parent,
                        );
                      }}
                    />
                    {(section.links || []).map((link, lIdx) => (
                      <div key={lIdx} className="grid grid-cols-4 gap-1">
                        <input
                          className="border rounded p-1 text-xs"
                          placeholder="Label"
                          value={link.label || ""}
                          onChange={(e) => {
                            const nextSections = [...(item.mega?.sections || [])];
                            const nextLinks = [...(nextSections[sIdx].links || [])];
                            nextLinks[lIdx] = { ...nextLinks[lIdx], label: e.target.value };
                            nextSections[sIdx] = { ...nextSections[sIdx], links: nextLinks };
                            updateItem(
                              idx,
                              {
                                ...item,
                                mega: { ...item.mega, enabled: true, sections: nextSections },
                              },
                              parent,
                            );
                          }}
                        />
                        <select
                          className="border rounded p-1 text-xs"
                          value={link.type || "page"}
                          onChange={(e) => {
                            const nextSections = [...(item.mega?.sections || [])];
                            const nextLinks = [...(nextSections[sIdx].links || [])];
                            const nextType = e.target.value as "page" | "external";
                            nextLinks[lIdx] = {
                              ...nextLinks[lIdx],
                              type: nextType,
                              ref:
                                nextType === "page"
                                  ? { slug: nextLinks[lIdx]?.ref?.slug || pages[0]?.slug || "" }
                                  : { href: nextLinks[lIdx]?.ref?.href || nextLinks[lIdx]?.href || "" },
                            };
                            nextSections[sIdx] = { ...nextSections[sIdx], links: nextLinks };
                            updateItem(
                              idx,
                              {
                                ...item,
                                mega: { ...item.mega, enabled: true, sections: nextSections },
                              },
                              parent,
                            );
                          }}
                        >
                          <option value="page">page</option>
                          <option value="external">external</option>
                        </select>
                        {link.type === "external" ? (
                          <input
                            className="border rounded p-1 text-xs"
                            placeholder="https://..."
                            value={link.ref?.href || link.href || ""}
                            onChange={(e) => {
                              const nextSections = [...(item.mega?.sections || [])];
                              const nextLinks = [...(nextSections[sIdx].links || [])];
                              nextLinks[lIdx] = {
                                ...nextLinks[lIdx],
                                type: "external",
                                href: e.target.value,
                                ref: { ...(nextLinks[lIdx]?.ref || {}), href: e.target.value },
                              };
                              nextSections[sIdx] = { ...nextSections[sIdx], links: nextLinks };
                              updateItem(
                                idx,
                                {
                                  ...item,
                                  mega: { ...item.mega, enabled: true, sections: nextSections },
                                },
                                parent,
                              );
                            }}
                          />
                        ) : (
                          <select
                            className="border rounded p-1 text-xs"
                            value={link.ref?.slug || ""}
                            onChange={(e) => {
                              const nextSections = [...(item.mega?.sections || [])];
                              const nextLinks = [...(nextSections[sIdx].links || [])];
                              nextLinks[lIdx] = {
                                ...nextLinks[lIdx],
                                type: "page",
                                ref: { ...(nextLinks[lIdx]?.ref || {}), slug: e.target.value },
                              };
                              nextSections[sIdx] = { ...nextSections[sIdx], links: nextLinks };
                              updateItem(
                                idx,
                                {
                                  ...item,
                                  mega: { ...item.mega, enabled: true, sections: nextSections },
                                },
                                parent,
                              );
                            }}
                          >
                            <option value="">-- select page --</option>
                            {pages.map((p) => (
                              <option key={p.slug} value={p.slug}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          className="border rounded p-1 text-xs"
                          placeholder="Badge"
                          value={link.badge || ""}
                          onChange={(e) => {
                            const nextSections = [...(item.mega?.sections || [])];
                            const nextLinks = [...(nextSections[sIdx].links || [])];
                            nextLinks[lIdx] = { ...nextLinks[lIdx], badge: e.target.value };
                            nextSections[sIdx] = { ...nextSections[sIdx], links: nextLinks };
                            updateItem(
                              idx,
                              {
                                ...item,
                                mega: { ...item.mega, enabled: true, sections: nextSections },
                              },
                              parent,
                            );
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-[11px] border rounded px-1.5 py-0.5"
                      onClick={() => {
                        const nextSections = [...(item.mega?.sections || [])];
                        const nextLinks = [...(nextSections[sIdx].links || [])];
                        nextLinks.push({
                          label: "Link",
                          type: "page",
                          ref: { slug: pages[0]?.slug || "" },
                        });
                        nextSections[sIdx] = { ...nextSections[sIdx], links: nextLinks };
                        updateItem(
                          idx,
                          {
                            ...item,
                            mega: { ...item.mega, enabled: true, sections: nextSections },
                          },
                          parent,
                        );
                      }}
                    >
                      + Add Link
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs border rounded px-2 py-1"
                  onClick={() => {
                    const nextSections = [...(item.mega?.sections || [])];
                    nextSections.push({
                      title: `Column ${nextSections.length + 1}`,
                      links: [
                        {
                          label: "Link",
                          type: "page",
                          ref: { slug: pages[0]?.slug || "" },
                        },
                      ],
                    });
                    updateItem(
                      idx,
                      {
                        ...item,
                        mega: { ...item.mega, enabled: true, sections: nextSections },
                      },
                      parent,
                    );
                  }}
                >
                  + Add Section
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

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
