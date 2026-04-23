"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import MenusEditorClient from "./menusEditorClient";
import {
  Plus,
  Navigation,
  Settings,
  Trash2,
  X,
  Layout,
  Loader2,
} from "lucide-react";

export type MenuDoc = {
  _id: string;
  name: string;
  draft_tree: any[];
  published_tree: any[];
  slot?: "header" | "footer" | null;
};

type Props = {
  siteId: string;
  urlMode: string;
};

export default function MenusListClient({ siteId, urlMode }: Props) {
  const { toast, confirm } = useUI();
  const [menus, setMenus] = useState<MenuDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<MenuDoc | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newMenuName, setNewMenuName] = useState("");

  const refreshMenus = async () => {
    try {
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch menus");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshMenus().finally(() => setLoading(false));
  }, [siteId]);

  const handleCreate = async () => {
    const name = newMenuName.trim();
    if (!name) return;
    setActionLoading("create");
    try {
      const tempId = `temp_${Date.now()}`;
      const res = await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_id: tempId, name }),
      });
      const { menu } = await res.json();
      setMenus((prev) => [...prev.filter((m) => m._id !== tempId), menu]);
      setEditingMenu(menu);
      setNewMenuName("");
    } catch (err) {
      toast({ variant: "error", title: "Failed to create menu" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (menu: MenuDoc) => {
    const ok = await confirm({
      title: "Delete menu?",
      description: `Delete "${menu.name}"? This cannot be undone.`,
      confirmText: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setActionLoading(menu._id);
    try {
      await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_id: menu._id }),
      });
      setMenus((prev) => prev.filter((m) => m._id !== menu._id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignSlot = async (menuId: string, slotValue: string) => {
    const slot = slotValue === "" ? null : (slotValue as "header" | "footer");
    setActionLoading(menuId);
    try {
      await fetch(`/api/admin/menus?site_id=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", menu_id: menuId, slot }),
      });
      setMenus((prev) =>
        prev.map((m) =>
          m._id === menuId ? { ...m, slot: slot ?? undefined } : m,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  // --- UI Styles ---
  const glassCard =
    "bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#fff] text-[#1D1D1F] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Navigation
            </h1>
            <p className="text-gray-500 font-medium">
              Design and assign menus for your site.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm w-full md:w-auto">
            <input
              type="text"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              placeholder="Menu Name"
              className="bg-transparent px-4 py-2 text-sm outline-none font-medium flex-1 md:w-48"
            />
            <button
              onClick={handleCreate}
              disabled={!newMenuName.trim() || actionLoading === "create"}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition active:scale-95 disabled:opacity-30"
            >
              {actionLoading === "create" ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 stroke-[1.5]" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <div key={menu._id} className={glassCard}>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${menu.slot ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-gray-100 text-gray-400"}`}
                  >
                    {menu.slot || "Unassigned"}
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-bold tracking-tight truncate">
                    {menu.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    {menu.draft_tree?.length || 0} nodes defined
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative group">
                    <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Placement
                    </label>
                    <select
                      value={menu.slot || ""}
                      onChange={(e) =>
                        handleAssignSlot(menu._id, e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold appearance-none outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      <option value="">No Global Slot</option>
                      <option value="header">Header Navigation</option>
                      <option value="footer">Footer Links</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setEditingMenu(menu)}
                      className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </button>
                    <button
                      onClick={() => handleDelete(menu)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Side Drawer - Futuristic Apple Style */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 flex justify-end transition-all">
          <div
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm animate-in fade-in"
            onClick={() => setEditingMenu(null)}
          />
          <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl h-full shadow-[-20px_0_60px_rgba(0,0,0,0.1)] border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <div>
                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                  Editor Mode
                </span>
                <h2 className="text-2xl font-bold tracking-tight">
                  {editingMenu.name}
                </h2>
              </div>
              <button
                className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMenu(null)}
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                onSave={() => refreshMenus()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
