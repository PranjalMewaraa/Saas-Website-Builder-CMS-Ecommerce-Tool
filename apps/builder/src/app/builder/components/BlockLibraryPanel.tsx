"use client";

import { useMemo, useState } from "react";

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

  return (
    <div className="space-y-3">
      <div className="font-semibold">Blocks</div>
      <input
        className="border rounded p-2 w-full"
        placeholder="Search blocks…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <div className="text-xs uppercase opacity-60">{group}</div>
            {items.map((b) => (
              <button
                key={b.type}
                className="w-full border rounded p-2 text-left"
                type="button"
                onClick={() => onAdd(b.type)}
              >
                <div className="text-sm font-medium">{b.type}</div>
                <div className="text-xs opacity-70">{b.desc}</div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
