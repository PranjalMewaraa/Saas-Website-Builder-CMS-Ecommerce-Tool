"use client";

import { useMemo, useState } from "react";

type CategoryOption = {
  id: string;
  label: string;
  parent_id?: string | null;
};

function buildChildrenMap(options: CategoryOption[]) {
  const map = new Map<string, string[]>();
  for (const o of options) {
    const parent = o.parent_id || "";
    if (!parent) continue;
    const list = map.get(parent) || [];
    list.push(o.id);
    map.set(parent, list);
  }
  return map;
}

function collectDescendants(childrenMap: Map<string, string[]>, startId: string) {
  const out: string[] = [];
  const queue = [...(childrenMap.get(startId) || [])];
  const seen = new Set<string>();
  while (queue.length) {
    const id = String(queue.shift() || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    const kids = childrenMap.get(id) || [];
    for (const k of kids) {
      if (!seen.has(k)) queue.push(k);
    }
  }
  return out;
}

export default function CategoryFilterTreeClient({
  options,
  initialSelectedIds,
}: {
  options: CategoryOption[];
  initialSelectedIds: string[];
}) {
  const childrenMap = useMemo(() => buildChildrenMap(options), [options]);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds || []),
  );

  function toggle(id: string, nextChecked: boolean) {
    const descendants = collectDescendants(childrenMap, id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (nextChecked) {
        next.add(id);
        for (const d of descendants) next.add(d);
      } else {
        next.delete(id);
        for (const d of descendants) next.delete(d);
      }
      return next;
    });
  }

  return (
    <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1">
      {options.map((c) => (
        <label key={c.id} className="flex items-start gap-2 text-sm min-w-0">
          <input
            type="checkbox"
            name="category"
            value={c.id}
            checked={selected.has(c.id)}
            onChange={(e) => toggle(c.id, e.target.checked)}
          />
          <span className="break-words">{c.label}</span>
        </label>
      ))}
    </div>
  );
}

