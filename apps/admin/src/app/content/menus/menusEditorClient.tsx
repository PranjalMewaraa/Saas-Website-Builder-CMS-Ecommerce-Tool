"use client";

import { useEffect, useState } from "react";
import EditorModeToggle from "../_component/EditorModeToggle";
import { useEditorMode } from "../_component/useEditorMode";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

export default function MenusEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);
  const [menus, setMenus] = useState<any[]>([]);
  const [active, setActive] = useState<string>("menu_main");
  const [tree, setTree] = useState<any[]>([]);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/admin/menus?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const list = data.menus ?? [];
      setMenus(list);
      const cur = list.find((m: any) => m._id === active) || list[0];
      setActive(cur?._id || "menu_main");
      setTree(cur?.draft_tree || []);
      setJsonText(JSON.stringify(cur?.draft_tree || [], null, 2));
    })();
  }, [siteId]);

  useEffect(() => {
    const cur = menus.find((m: any) => m._id === active);
    setTree(cur?.draft_tree || []);
    setJsonText(JSON.stringify(cur?.draft_tree || [], null, 2));
  }, [active]);

  async function save(nextTree: any[]) {
    await fetch(`/api/admin/menus?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu_id: active, tree: nextTree }),
    });
    alert("Saved menu draft ✅");
    // refresh menus
    const res = await fetch(
      `/api/admin/menus?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setMenus(data.menus ?? []);
  }

  return (
    <div className="space-y-3 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={`border rounded px-3 py-1 text-sm ${active === "menu_main" ? "bg-black text-white" : ""}`}
            onClick={() => setActive("menu_main")}
            type="button"
          >
            Main
          </button>
          <button
            className={`border rounded px-3 py-1 text-sm ${active === "menu_footer" ? "bg-black text-white" : ""}`}
            onClick={() => setActive("menu_footer")}
            type="button"
          >
            Footer
          </button>
        </div>
        <EditorModeToggle mode={mode} setMode={setMode} />
      </div>

      {mode === "form" ? (
        <div className="border rounded p-4 space-y-2">
          {tree.map((item, idx) => (
            <div
              key={item.id || idx}
              className="grid grid-cols-12 gap-2 items-center"
            >
              <input
                className="border rounded p-2 col-span-3"
                value={item.label || ""}
                onChange={(e) =>
                  update(idx, { ...item, label: e.target.value })
                }
                placeholder="Label"
              />
              <select
                className="border rounded p-2 col-span-2"
                value={item.type || "page"}
                onChange={(e) => update(idx, { ...item, type: e.target.value })}
              >
                <option value="page">page</option>
                <option value="external">external</option>
              </select>
              <input
                className="border rounded p-2 col-span-5"
                value={item.ref?.slug || item.ref?.href || ""}
                onChange={(e) => updateRef(idx, e.target.value, item.type)}
                placeholder="/about or https://..."
              />
              <div className="col-span-2 flex gap-2 justify-end">
                <button
                  className="border rounded px-2 py-2 text-sm"
                  type="button"
                  onClick={() => move(idx, -1)}
                >
                  ↑
                </button>
                <button
                  className="border rounded px-2 py-2 text-sm"
                  type="button"
                  onClick={() => move(idx, +1)}
                >
                  ↓
                </button>
                <button
                  className="border rounded px-2 py-2 text-sm"
                  type="button"
                  onClick={() => remove(idx)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              className="border rounded px-3 py-2 text-sm"
              type="button"
              onClick={add}
            >
              + Add Item
            </button>
            <button
              className="bg-black text-white rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => save(tree)}
            >
              Save Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded p-4 space-y-2">
          <textarea
            className="w-full border rounded p-2 font-mono text-sm min-h-[320px]"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="border rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(jsonText);
                if (!parsed.ok) return alert(parsed.error);
                setTree(parsed.value);
              }}
            >
              Apply JSON to Form
            </button>
            <button
              className="bg-black text-white rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(jsonText);
                if (!parsed.ok) return alert(parsed.error);
                save(parsed.value);
              }}
            >
              Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function add() {
    const id = `n_${Date.now()}`;
    const next = [
      ...tree,
      { id, label: "New", type: "page", ref: { slug: "/" } },
    ];
    setTree(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function remove(idx: number) {
    const next = tree.filter((_: any, i: number) => i !== idx);
    setTree(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...tree];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setTree(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function update(idx: number, item: any) {
    const next = [...tree];
    next[idx] = item;
    setTree(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function updateRef(idx: number, val: string, type: string) {
    const item = tree[idx];
    const ref = type === "external" ? { href: val } : { slug: val };
    update(idx, { ...item, ref });
  }
}
