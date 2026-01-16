"use client";

import { useEffect, useState } from "react";
import { useEditorMode } from "../_component/useEditorMode";
import EditorModeToggle from "../_component/EditorModeToggle";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem"; // we’ll define this for nested support

type MenuNode = {
  id: string;
  label: string;
  type?: "page" | "external";
  ref?: { slug?: string; href?: string };
  children?: MenuNode[];
};

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
  const [activeMenuId, setActiveMenuId] = useState("header");
  const [tree, setTree] = useState<MenuNode[]>([]);
  const [jsonText, setJsonText] = useState("");
  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // Fetch pages
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/pages?site_id=${siteId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setPages(data.pages || []);
    })();
  }, [siteId]);

  // Fetch menus
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      const list = data.menus ?? [];
      if (!list.find((m: any) => m.id === "header"))
        list.unshift({ id: "header", name: "Header", tree: [] });
      if (!list.find((m: any) => m.id === "footer"))
        list.push({ id: "footer", name: "Footer", tree: [] });
      setMenus(list);
      const cur = list.find((m: any) => m.id === activeMenuId) || list[0];
      setActiveMenuId(cur.id);
      setTree(cur?.tree || []);
      setJsonText(JSON.stringify(cur?.tree || [], null, 2));
    })();
  }, [siteId]);

  // Update tree on menu switch
  useEffect(() => {
    const cur = menus.find((m) => m.id === activeMenuId);
    setTree(cur?.tree || []);
    setJsonText(JSON.stringify(cur?.tree || [], null, 2));
  }, [activeMenuId, menus]);

  async function save(nextTree: MenuNode[]) {
    const nextMenus = menus.map((m) =>
      m.id === activeMenuId ? { ...m, tree: nextTree } : m,
    );
    await fetch(`/api/admin/menus?site_id=${siteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menus: nextMenus }),
    });
    alert("Saved menu draft ✅");
    setMenus(nextMenus);
  }

  function addItem(parent?: MenuNode) {
    const id = `n_${Date.now()}`;
    const newItem: MenuNode = {
      id,
      label: "New Item",
      type: "page",
      ref: { slug: "/" },
      children: [],
    };
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(newItem);
      setTree([...tree]);
    } else {
      setTree([...tree, newItem]);
    }
    setJsonText(JSON.stringify(tree, null, 2));
  }

  function removeItem(idx: number, parent?: MenuNode) {
    if (parent) {
      parent.children = parent.children?.filter((_, i) => i !== idx);
      setTree([...tree]);
    } else {
      setTree(tree.filter((_, i) => i !== idx));
    }
    setJsonText(JSON.stringify(tree, null, 2));
  }

  function updateItem(idx: number, item: MenuNode, parent?: MenuNode) {
    if (parent) {
      parent.children![idx] = item;
    } else {
      tree[idx] = item;
    }
    setTree([...tree]);
    setJsonText(JSON.stringify(tree, null, 2));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = tree.findIndex((t) => t.id === active.id);
    const newIndex = tree.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const nextTree = arrayMove(tree, oldIndex, newIndex);
    setTree(nextTree);
    setJsonText(JSON.stringify(nextTree, null, 2));
  }

  if (!menus.length) return <div>Loading menus...</div>;

  return (
    <div className="space-y-3 max-w-4xl">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {menus.map((m) => (
            <button
              key={m.id}
              className={`border rounded px-3 py-1 text-sm ${
                m.id === activeMenuId ? "bg-black text-white" : ""
              }`}
              onClick={() => setActiveMenuId(m.id)}
              type="button"
            >
              {m.name}
            </button>
          ))}
        </div>
        <EditorModeToggle mode={mode} setMode={setMode} />
      </div>

      {mode === "form" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tree.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tree.map((item, idx) => (
              <SortableItem
                key={item.id}
                item={item}
                idx={idx}
                tree={tree}
                setTree={setTree}
                pages={pages}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
              />
            ))}
          </SortableContext>

          <div className="flex gap-2 mt-2">
            <button
              className="border rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => addItem()}
            >
              + Add Root Item
            </button>
            <button
              className="bg-black text-white rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => save(tree)}
            >
              Save Draft
            </button>
          </div>
        </DndContext>
      ) : (
        <div className="border rounded p-4 space-y-2">
          <textarea
            className="w-full border rounded p-2 font-mono text-sm min-h-[320px]"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
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
}
