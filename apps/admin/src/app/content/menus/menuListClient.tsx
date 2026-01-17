"use client";

import { useEffect, useState } from "react";
import MenusEditorClient from "./menusEditorClient";

export type MenuDoc = {
  _id: string;
  name: string;
  draft_tree: any[]; // or import { MenuNode }[] if you want strong typing
  published_tree: any[];
  slot?: "header" | "footer" | null;
};

type Props = {
  siteId: string;
  urlMode: string;
};

export default function MenusListClient({ siteId, urlMode }: Props) {
  const [menus, setMenus] = useState<MenuDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<MenuDoc | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newMenuName, setNewMenuName] = useState("");

  // ── Fetch / Refresh menus ───────────────────────────────────────
  const refreshMenus = async () => {
    try {
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch menus");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch (err) {
      console.error("Refresh menus failed:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshMenus().finally(() => setLoading(false));
  }, [siteId]);

  // ── Create new menu ─────────────────────────────────────────────
  const handleCreate = async () => {
    const name = newMenuName.trim();
    if (!name) return;

    setActionLoading("create");
    try {
      const tempId = `temp_${Date.now()}`;

      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_id: tempId,
          name,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { menu } = await res.json();

      setMenus((prev) => [...prev.filter((m) => m._id !== tempId), menu]);

      setEditingMenu(menu);
      setNewMenuName("");
    } catch (err) {
      console.error("Create menu failed:", err);
      alert("Failed to create menu");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete menu ─────────────────────────────────────────────────
  const handleDelete = async (menu: MenuDoc) => {
    if (!confirm(`Delete menu "${menu.name}"?\nThis cannot be undone.`)) return;

    setActionLoading(menu._id);
    try {
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_id: menu._id }),
      });

      if (!res.ok) throw new Error(await res.text());

      setMenus((prev) => prev.filter((m) => m._id !== menu._id));
      if (editingMenu?._id === menu._id) setEditingMenu(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete menu");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Assign slot (header/footer/none) ────────────────────────────
  const handleAssignSlot = async (menuId: string, slotValue: string) => {
    const slot = slotValue === "" ? null : (slotValue as "header" | "footer");

    setActionLoading(menuId);
    try {
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          menu_id: menuId,
          slot,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setMenus((prev) =>
        prev.map((m) =>
          m._id === menuId ? { ...m, slot: slot ?? undefined } : m,
        ),
      );
    } catch (err) {
      console.error("Assign slot failed:", err);
      alert("Failed to update menu slot");
      refreshMenus(); // rollback on error
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Menus</h1>

      {/* Create new menu */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-md">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New menu name
          </label>
          <input
            type="text"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            placeholder="e.g. Main Navigation, Utility Links, Mobile Menu"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            disabled={actionLoading === "create"}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!newMenuName.trim() || actionLoading === "create"}
          className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed self-end sm:self-auto"
        >
          {actionLoading === "create" ? "Creating…" : "+ Create Menu"}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 py-12 text-center">Loading menus...</div>
      ) : menus.length === 0 ? (
        <div className="text-gray-500 py-12 text-center">
          No menus created yet. Start by creating one above.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <div
              key={menu._id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {menu.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    {menu.draft_tree?.length || 0} item
                    {menu.draft_tree?.length !== 1 ? "s" : ""} in draft
                  </p>
                  <p>
                    Slot:{" "}
                    <span className="font-medium">
                      {menu.slot || "— none —"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <select
                  value={menu.slot || ""}
                  onChange={(e) => handleAssignSlot(menu._id, e.target.value)}
                  disabled={actionLoading === menu._id}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[110px]"
                >
                  <option value="">No Slot</option>
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>

                <button
                  onClick={() => setEditingMenu(menu)}
                  disabled={actionLoading === menu._id}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(menu)}
                  disabled={actionLoading === menu._id}
                  className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-sm font-medium transition disabled:opacity-50"
                >
                  {actionLoading === menu._id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Side Drawer */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="w-full max-w-4xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="p-6 md:p-8 relative">
              <button
                className="absolute top-5 right-6 md:right-8 text-3xl text-gray-500 hover:text-black transition"
                onClick={() => setEditingMenu(null)}
                aria-label="Close editor"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold mb-6 pr-10">
                Edit Menu: {editingMenu.name}
              </h2>

              <MenusEditorClient
                siteId={siteId}
                urlMode={urlMode}
                activeMenuIdFor={editingMenu._id}
                initialMenu={{
                  id: editingMenu._id,
                  name: editingMenu.name,
                  tree: editingMenu.draft_tree || [],
                  slot: editingMenu.slot ?? undefined,
                }}
                onSave={() => {
                  refreshMenus();
                  // You can choose to keep editor open:
                  // setEditingMenu(null);   ← add if you want auto-close after save
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
