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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export type MenuNode = {
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

type Props = {
  siteId: string;
  urlMode?: string;
  activeMenuIdFor: string;
  initialMenu: {
    id: string;
    name: string;
    tree: MenuNode[];
    slot?: "header" | "footer";
  };
  onSave?: () => void;
};

export default function MenusEditorClient({
  siteId,
  urlMode,
  activeMenuIdFor,
  initialMenu,
  onSave,
}: Props) {
  const { mode, setMode } = useEditorMode("form", urlMode);

  const [menus, setMenus] = useState<any[]>([]);
  const [activeMenuId, setActiveMenuId] = useState(activeMenuIdFor);
  const [tree, setTree] = useState<MenuNode[]>(initialMenu?.tree || []);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(initialMenu?.tree || [], null, 2),
  );
  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);
  const [newMenuName, setNewMenuName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  // ── FETCH MENUS AND PAGES ────────────────────────────────
  useEffect(() => {
    (async () => {
      const [menusRes, pagesRes] = await Promise.all([
        fetch(`/api/admin/menus?site_id=${siteId}`, { cache: "no-store" }),
        fetch(`/api/admin/pages?site_id=${siteId}`, { cache: "no-store" }),
      ]);

      const menusData = await menusRes.json();
      const pagesData = await pagesRes.json();

      setMenus(menusData.menus || []);
      setPages(pagesData.pages || []);

      const current = menusData.menus?.find(
        (m: any) => m._id === activeMenuIdFor,
      );
      if (current) {
        setActiveMenuId(current._id);
        setTree(current.draft_tree || []);
        setJsonText(JSON.stringify(current.draft_tree || [], null, 2));
      }
    })();
  }, [siteId, activeMenuIdFor]);

  // ── SYNC TREE WHEN ACTIVE MENU CHANGES ────────────────
  useEffect(() => {
    const current = menus.find((m) => m._id === activeMenuId);
    if (current) {
      setTree(current.draft_tree || []);
      setJsonText(JSON.stringify(current.draft_tree || [], null, 2));
    }
  }, [activeMenuId, menus]);

  // ── SAVE TREE TO BACKEND ───────────────────────────────
  const saveTree = async (nextTree: MenuNode[]) => {
    try {
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_id: activeMenuId,
          tree: nextTree,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }

      setMenus((prev) =>
        prev.map((m) =>
          m._id === activeMenuId ? { ...m, draft_tree: nextTree } : m,
        ),
      );

      alert("Menu draft saved ✓");
      if (onSave) onSave();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.message}`);
    }
  };

  // ── CREATE NEW MENU ─────────────────────────────────────
  const createMenu = async () => {
    if (!newMenuName.trim()) return;

    try {
      const tempId = `temp_${Date.now()}`;
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_id: tempId,
          name: newMenuName.trim(),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { menu } = await res.json();

      setMenus((prev) => [...prev, menu]);
      setActiveMenuId(menu._id);
      setTree([]);
      setJsonText("[]");
      setNewMenuName("");
    } catch (err) {
      alert("Failed to create menu");
    }
  };

  // ── ADD / REMOVE / UPDATE MENU ITEMS ───────────────────
  const addItem = (parent?: MenuNode) => {
    const id = `node_${Date.now()}`;
    const newItem: MenuNode = {
      id,
      label: "New Item",
      type: "page",
      ref: { slug: pages[0]?.slug || "" },
      children: [],
    };

    const newTree = parent ? [...tree] : [...tree, newItem];

    if (parent) {
      parent.children = [...(parent.children || []), newItem];
    } else {
      setTree(newTree);
    }

    setJsonText(JSON.stringify(newTree, null, 2));
  };

  const removeItem = (idx: number, parent?: MenuNode) => {
    let newTree = [...tree];

    if (parent) {
      parent.children = parent.children?.filter((_, i) => i !== idx) || [];
    } else {
      newTree = newTree.filter((_, i) => i !== idx);
    }

    setTree(newTree);
    setJsonText(JSON.stringify(newTree, null, 2));
  };

  const updateItem = (
    idx: number,
    updatedItem: MenuNode,
    parent?: MenuNode,
  ) => {
    let newTree = [...tree];
    if (parent) {
      if (parent.children) parent.children[idx] = updatedItem;
    } else {
      newTree[idx] = updatedItem;
    }
    setTree(newTree);
    setJsonText(JSON.stringify(newTree, null, 2));
  };

  // ── DRAG & DROP ────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tree.findIndex((item) => item.id === active.id);
    const newIndex = tree.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newTree = arrayMove(tree, oldIndex, newIndex);
    setTree(newTree);
    setJsonText(JSON.stringify(newTree, null, 2));
  };

  // ── ASSIGN MENU TO HEADER / FOOTER SLOT ───────────────
  const handleSlotChange = async (
    slot: "header" | "footer",
    menuId: string,
  ) => {
    await fetch(`/api/admin/menus?site_id=${siteId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assign",
        menu_id: menuId,
        slot,
      }),
    });

    setMenus((prev) =>
      prev.map((m) => ({
        ...m,
        slot: m._id === menuId ? slot : m.slot === slot ? undefined : m.slot,
      })),
    );
  };

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Mode toggle + Create menu */}
      <div className="flex items-center justify-between">
        <EditorModeToggle mode={mode} setMode={setMode} />
        <div className="flex gap-2">
          <input
            type="text"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            placeholder="New menu name..."
            className="border rounded px-3 py-1.5 text-sm"
          />
          <button
            onClick={createMenu}
            disabled={!newMenuName.trim()}
            className="bg-green-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      {/* Header / Footer slot selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg">
        {(["header", "footer"] as const).map((slot) => (
          <div key={slot}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {slot} Menu
            </label>
            <select
              value={menus.find((m) => m.slot === slot)?._id || ""}
              onChange={(e) => handleSlotChange(slot, e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {menus.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Menu tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {menus.map((m) => (
          <button
            key={m._id}
            type="button"
            onClick={() => setActiveMenuId(m._id)}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg border border-b-0 ${
              activeMenuId === m._id
                ? "bg-white border-gray-300 -mb-px"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Menu editor / JSON */}
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

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => addItem()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium"
            >
              + Add Root Item
            </button>

            <button
              type="button"
              onClick={() => saveTree(tree)}
              className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Save Draft
            </button>
          </div>
        </DndContext>
      ) : (
        <div className="border rounded-lg p-5 bg-white">
          <textarea
            className="w-full h-96 font-mono text-sm p-4 border rounded resize-y mb-4"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(jsonText);
                if (!parsed.ok) return alert(parsed.error);
                setTree(parsed.value);
              }}
              className="border border-gray-300 hover:bg-gray-50 px-5 py-2 rounded text-sm"
            >
              Apply JSON → Form
            </button>

            <button
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(jsonText);
                if (!parsed.ok) return alert(parsed.error);
                saveTree(parsed.value);
              }}
              className="bg-black text-white px-6 py-2 rounded text-sm font-medium"
            >
              Save Draft (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
