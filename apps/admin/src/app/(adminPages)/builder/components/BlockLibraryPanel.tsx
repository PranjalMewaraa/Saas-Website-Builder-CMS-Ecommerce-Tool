"use client";

import { useMemo, useState } from "react";
import {
  Layout,
  Heading,
  Grid,
  Mail,
  Footprints,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";

const BLOCKS = [
  {
    type: "Header/V1",
    group: "Header",
    desc: "Top navigation + CTA",
    icon: Layout,
  },
  {
    type: "Hero",
    group: "Hero",
    desc: "Headline + CTA + image",
    icon: Heading,
  },
  {
    type: "ProductGrid/V1",
    group: "Catalog",
    desc: "Featured products grid",
    icon: Grid,
  },
  { type: "Form/V1", group: "Forms", desc: "Contact / lead form", icon: Mail },
  {
    type: "Footer/V1",
    group: "Footer",
    desc: "Links + logo + copyright",
    icon: Footprints,
  },
] as const;

type BlockType = (typeof BLOCKS)[number];

interface BlockLibraryPanelProps {
  onAdd: (type: string) => void;
}

export default function BlockLibraryPanel({ onAdd }: BlockLibraryPanelProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = BLOCKS.filter(
      (b) =>
        !q ||
        b.type.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q)
    );

    const map: Record<string, BlockType[]> = {};
    filtered.forEach((b) => {
      if (!map[b.group]) map[b.group] = [];
      map[b.group].push(b);
    });

    // Sort groups alphabetically
    return Object.fromEntries(
      Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [query]);

  const hasResults = Object.keys(grouped).length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900">Block Library</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag or click to add blocks
        </p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!hasResults ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No blocks found matching "{query}"</p>
            <button
              onClick={() => setQuery("")}
              className="mt-3 text-blue-600 hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-1">
                {group}
              </h3>

              <div className="grid gap-2">
                {items.map((block) => {
                  const Icon = block.icon;

                  return (
                    <button
                      key={block.type}
                      onClick={() => onAdd(block.type)}
                      className={`
                        group flex items-center gap-3 p-3 rounded-lg border border-gray-200 
                        bg-white hover:border-blue-300 hover:bg-blue-50/40 
                        transition-all duration-150 text-left
                        focus:outline-none focus:ring-2 focus:ring-blue-500/40
                      `}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {block.type}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {block.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
