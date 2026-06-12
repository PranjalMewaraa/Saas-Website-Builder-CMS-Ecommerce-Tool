"use client";

import { useMemo, useState } from "react";
import { Input, EmptyState } from "@acme/ui";

const BLOCKS = [
  { type: "Header/V1", group: "Header", desc: "Top navigation + CTA" },
  { type: "Hero", group: "Hero", desc: "Headline + CTA + image" },
  { type: "ProductGrid/V1", group: "Catalog", desc: "Featured products grid" },
  { type: "Form/V1", group: "Forms", desc: "Contact / lead form" },
  { type: "Footer/V1", group: "Footer", desc: "Links + logo" },
] as const;

export default function BlockLibraryPanel({
  onAdd,
}: {
  onAdd: (type: string) => void;
}) {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = BLOCKS.filter(
      (b) =>
        !query ||
        b.type.toLowerCase().includes(query) ||
        b.group.toLowerCase().includes(query)
    );
    const g: Record<string, typeof list> = {};
    for (const b of list) (g[b.group] ||= []).push(b);
    return g;
  }, [q]);

  const hasResults = Object.keys(grouped).length > 0;

  return (
    <div className="space-y-3">
      <div className="font-semibold">Blocks</div>
      <Input
        label="Search blocks"
        placeholder="Search blocks…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted">
              {group}
            </div>
            {items.map((b) => (
              <button
                key={b.type}
                className="w-full border border-line rounded-control bg-surface p-2 text-left transition-colors hover:bg-canvas hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                type="button"
                onClick={() => onAdd(b.type)}
              >
                <div className="text-sm font-medium">{b.type}</div>
                <div className="text-xs text-muted">{b.desc}</div>
              </button>
            ))}
          </div>
        ))}

        {!hasResults ? (
          <EmptyState
            title="No blocks match"
            description={`Nothing matches “${q.trim()}”. Try a different search.`}
          />
        ) : null}
      </div>
    </div>
  );
}
