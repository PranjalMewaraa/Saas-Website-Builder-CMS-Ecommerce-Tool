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
    refresh();
  }, [siteId]);

  async function refresh() {
    const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    const list = data.menus ?? [];
    setMenus(list);
    const cur = list.find((m: any) => m._id === active) || list[0];
    setActive(cur?._id || "menu_main");
    setTree(cur?.draft_tree || []);
    setJsonText(JSON.stringify(cur?.draft_tree || [], null, 2));
  }

  function sync(next: any[]) {
    setTree(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  async function save(nextTree: any[]) {
    await fetch(`/api/admin/menus?site_id=${siteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu_id: active, tree: nextTree }),
    });
    alert("Saved menu draft ✅");
    refresh();
  }

  return (
    <div className="space-y-3 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {menus.map((m) => (
            <button
              key={m._id}
              className={`border px-3 py-1 text-sm rounded ${
                active === m._id ? "bg-black text-white" : ""
              }`}
              onClick={() => {
                setActive(m._id);
                sync(m.draft_tree || []);
              }}
            >
              {m._id}
            </button>
          ))}
        </div>
        <EditorModeToggle mode={mode} setMode={setMode} />
      </div>

      {mode === "form" ? (
        <MenuTreeEditor tree={tree} onChange={sync} />
      ) : (
        <textarea
          className="w-full border rounded p-2 font-mono min-h-[300px]"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
      )}

      <div className="flex gap-2">
        <button
          className="border px-3 py-2 rounded"
          onClick={() => addRoot(tree, sync)}
        >
          + Add Item
        </button>
        <button
          className="bg-black text-white px-3 py-2 rounded"
          onClick={() =>
            mode === "form"
              ? save(tree)
              : (() => {
                  const parsed = safeJsonParse(jsonText);
                  if (!parsed.ok) return alert(parsed.error);
                  save(parsed.value);
                })()
          }
        >
          Save Draft
        </button>
      </div>
    </div>
  );
}

function MenuTreeEditor({
  tree,
  onChange,
}: {
  tree: any[];
  onChange: (v: any[]) => void;
}) {
  function update(idx: number, item: any) {
    const next = [...tree];
    next[idx] = item;
    onChange(next);
  }

  function remove(idx: number) {
    const next = tree.filter((_: any, i: number) => i !== idx);
    onChange(next);
  }

  function addChild(idx: number) {
    const next = [...tree];
    next[idx].children = next[idx].children || [];
    next[idx].children.push(newItem());
    onChange(next);
  }

  return (
    <div className="border rounded p-4 space-y-2">
      {tree.map((item, idx) => (
        <div key={item.id} className="space-y-2">
          <MenuItemEditor
            item={item}
            onChange={(v: any) => update(idx, v)}
            onRemove={() => remove(idx)}
            onAddChild={() => addChild(idx)}
          />
          {item.children && (
            <div className="ml-6 border-l pl-4">
              <MenuTreeEditor
                tree={item.children}
                onChange={(c) => update(idx, { ...item, children: c })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MenuItemEditor({ item, onChange, onRemove, onAddChild }: any) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input
        className="border p-2 col-span-3"
        value={item.label}
        onChange={(e) => onChange({ ...item, label: e.target.value })}
      />
      <select
        className="border p-2 col-span-2"
        value={item.type}
        onChange={(e) => onChange({ ...item, type: e.target.value })}
      >
        <option value="page">page</option>
        <option value="external">external</option>
      </select>
      <input
        className="border p-2 col-span-4"
        value={item.ref?.slug || item.ref?.href || ""}
        onChange={(e) =>
          onChange({
            ...item,
            ref:
              item.type === "external"
                ? { href: e.target.value }
                : { slug: e.target.value },
          })
        }
      />
      <div className="col-span-3 flex gap-2 justify-end">
        <button onClick={onAddChild}>+ Child</button>
        <button onClick={onRemove}>✕</button>
      </div>
    </div>
  );
}

function newItem() {
  return {
    id: `n_${Date.now()}`,
    label: "New",
    type: "page",
    ref: { slug: "/" },
    children: [],
  };
}

function addRoot(tree: any[], sync: any) {
  sync([...tree, newItem()]);
}
