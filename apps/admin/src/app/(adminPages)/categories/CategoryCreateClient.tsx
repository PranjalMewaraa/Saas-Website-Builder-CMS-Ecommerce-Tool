"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  X,
  Store,
  FolderPlus,
  Layers,
  ChevronDown,
  Pencil,
  Sparkles,
} from "lucide-react";
type Category = {
  id: string;
  name: string;
  slug: string;
  attributes?: any[];
};

type DraftAttr = {
  code: string;
  name: string;
  type: string;
  is_required: boolean;
  optionsText: string;
};

type Preset = {
  key: string;
  categories: Array<{
    attributes: Array<{
      code: string;
      name: string;
      type: string;
      required?: boolean;
      options?: string[];
    }>;
  }>;
};

const ATTR_TYPES = [
  "text",
  "textarea",
  "select",
  "multi_select",
  "number",
  "boolean",
  "color",
  "date",
];

function toCode(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function mapCategoryAttrsToDraft(attributes: any[] = []): DraftAttr[] {
  return (attributes || []).map((a: any) => ({
    code: String(a.code || ""),
    name: String(a.name || ""),
    type: String(a.type || "text"),
    is_required: Boolean(a.is_required),
    optionsText: Array.isArray(a.options)
      ? a.options
          .map((o: any) => String(o?.value || o?.label || "").trim())
          .filter(Boolean)
          .join(", ")
      : "",
  }));
}
// ... (Types and toCode remain unchanged)

export default function CategoryCreateClient({
  siteId,
  storeId,
  storePreset,
  initialCategories,
  stores,
}: {
  siteId: string;
  storeId: string;
  storePreset: string;
  initialCategories: Category[];
  stores: Array<{ id: string; name: string; store_type: string }>;
}) {
  const { toast } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>(
    initialCategories || [],
  );
  const [name, setName] = useState("");
  const [attributes, setAttributes] = useState<DraftAttr[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editName, setEditName] = useState("");
  const [editAttributes, setEditAttributes] = useState<DraftAttr[]>([]);

  // ... (useEffect and refresh logic remain the same)

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/admin/v2/store-types?site_id=${encodeURIComponent(siteId)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) setPresets(data.presets || []);
    })();
  }, [siteId]);

  const suggestions = useMemo(() => {
    const preset = presets.find((p) => p.key === storePreset);
    if (!preset) return [];
    const map = new Map<string, DraftAttr>();
    for (const c of preset.categories || []) {
      for (const a of c.attributes || []) {
        if (!map.has(a.code)) {
          map.set(a.code, {
            code: a.code,
            name: a.name,
            type: a.type || "text",
            is_required: Boolean(a.required),
            optionsText: Array.isArray(a.options) ? a.options.join(", ") : "",
          });
        }
      }
    }
    return Array.from(map.values());
  }, [presets, storePreset]);

  async function refresh() {
    const cRes = await fetch(
      `/api/admin/v2/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
      { cache: "no-store" },
    );
    if (!cRes.ok) return;
    const cData = await cRes.json().catch(() => ({}));
    const cats = cData.categories || [];
    const next = await Promise.all(
      cats.map(async (c: any) => {
        const aRes = await fetch(
          `/api/admin/v2/category-attributes?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&category_id=${encodeURIComponent(c.id)}`,
          { cache: "no-store" },
        );
        const aData = await aRes.json().catch(() => ({}));
        return { ...c, attributes: aData.attributes || [] };
      }),
    );
    setCategories(next);
  }

  function buildPayloadAttributes(list: DraftAttr[]) {
    return list
      .filter((a) => a.name.trim())
      .map((a, idx) => ({
        code: a.code.trim() || toCode(a.name),
        name: a.name.trim(),
        type: a.type,
        is_required: a.is_required,
        is_filterable: true,
        sort_order: idx,
        options:
          a.type === "select" || a.type === "multi_select"
            ? a.optionsText
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
      }));
  }

  function openEditModal(category: Category) {
    setEditingCategoryId(category.id);
    setEditName(category.name || "");
    setEditAttributes(mapCategoryAttrsToDraft(category.attributes || []));
    setEditOpen(true);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Store Selection Section */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 transition-all hover:bg-white">
        <div className="flex items-center gap-2 mb-4 text-[#1D1D1F]">
          <Store size={18} className="text-blue-500" />
          <span className="text-sm font-bold tracking-tight uppercase">
            Select Context
          </span>
        </div>
        <div className="relative">
          <select
            className="appearance-none w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
            value={storeId}
            onChange={(e) => {
              const nextStoreId = e.target.value;
              const params = new URLSearchParams(searchParams.toString());
              params.set("site_id", siteId);
              if (nextStoreId) params.set("store_id", nextStoreId);
              router.replace(`/categories?${params.toString()}`);
            }}
          >
            <option value="">Select a store...</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.store_type}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* 2. Creation Form */}
      <div className="bg-white border border-gray-200/60 rounded-[32px] p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <FolderPlus size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Create New Category
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[#86868B] ml-1 uppercase tracking-wider">
              Category Identity
            </label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mens Footwear"
              className="w-full text-lg font-medium bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#86868B] ml-1 uppercase tracking-wider">
                Custom Attributes
              </label>
              {suggestions.length > 0 && (
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  Presets Available
                </span>
              )}
            </div>

            {/* Presets Grid */}
            <div className="flex flex-wrap gap-2 pb-2">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s.code}
                  className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-full bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                  onClick={() =>
                    setAttributes((prev) => {
                      if (prev.some((x) => x.code === s.code)) return prev;
                      return [...prev, { ...s }];
                    })
                  }
                >
                  + {s.name}
                </button>
              ))}
            </div>

            {/* Attributes List */}
            <div className="space-y-3">
              {attributes.map((a, idx) => (
                <div
                  key={`attr-${idx}`}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all"
                >
                  <div className="md:col-span-3">
                    <input
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      placeholder="Display Name"
                      value={a.name}
                      onChange={(e) =>
                        setAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  name: e.target.value,
                                  code: x.code || toCode(e.target.value),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-mono text-gray-500 outline-none"
                      placeholder="code_name"
                      value={a.code}
                      onChange={(e) =>
                        setAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? { ...x, code: toCode(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm outline-none"
                      value={a.type}
                      onChange={(e) =>
                        setAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, type: e.target.value } : x,
                          ),
                        )
                      }
                    >
                      {ATTR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <input
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm outline-none"
                      placeholder="Options (comma separated)"
                      value={a.optionsText}
                      onChange={(e) =>
                        setAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? { ...x, optionsText: e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300 transition-all"
                        checked={a.is_required}
                        onChange={(e) =>
                          setAttributes((prev) =>
                            prev.map((x, i) =>
                              i === idx
                                ? { ...x, is_required: e.target.checked }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() =>
                        setAttributes((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-95 transition-all"
                onClick={() =>
                  setAttributes((prev) => [
                    ...prev,
                    {
                      code: "",
                      name: "",
                      type: "text",
                      is_required: false,
                      optionsText: "",
                    },
                  ])
                }
              >
                <Plus size={16} />
                Add Attribute
              </button>

              <button
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1D1D1F] text-white px-8 py-2.5 rounded-full font-semibold text-[14px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all shadow-md active:scale-[0.98]"
                disabled={loading || !name.trim() || !storeId}
                onClick={async () => {
                  setLoading(true);
                  const payload = {
                    site_id: siteId,
                    store_id: storeId,
                    name: name.trim(),
                    attributes: buildPayloadAttributes(attributes),
                  };
                  const res = await fetch("/api/admin/store-setup/create-category", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json().catch(() => ({}));
                  setLoading(false);
                  if (!res.ok) {
                    toast({
                      variant: "error",
                      title: "Failed",
                      description: data?.error || "Could not create category",
                    });
                    return;
                  }
                  setName("");
                  setAttributes([]);
                  await refresh();
                  toast({ variant: "success", title: "Category created" });
                }}
              >
                {loading ? "Processing..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Existing Categories List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-1 text-[#86868B]">
          <Layers size={16} />
          <span className="text-[13px] font-bold uppercase tracking-widest">
            Live Schema
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="group bg-white border border-gray-200/60 p-5 rounded-3xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="font-bold text-[17px] text-[#1D1D1F] mb-1 group-hover:text-blue-600 transition-colors">
                {c.name}
              </div>
              <div className="text-[12px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded inline-block">
                /{c.slug}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-500">
                  {(c.attributes || []).length} Attributes
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium italic">
              No categories defined for this store.
            </div>
          )}
        </div>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/45 backdrop-blur-xl p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[34px] border border-white/70 bg-white/95 shadow-[0_30px_100px_-30px_rgba(15,23,42,0.45)]">
            <div className="relative border-b border-gray-100 px-7 py-6">
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                    <Sparkles size={12} />
                    Edit Category
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
                    {editName || "Untitled Category"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update category name and attribute schema.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-gray-900"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-7 py-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Attributes
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditAttributes((prev) => [
                        ...prev,
                        {
                          code: "",
                          name: "",
                          type: "text",
                          is_required: false,
                          optionsText: "",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    <Plus size={12} />
                    Add Attribute
                  </button>
                </div>

                {editAttributes.map((a, idx) => (
                  <div
                    key={`edit-attr-${idx}`}
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3 md:grid-cols-12"
                  >
                    <input
                      className="md:col-span-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) =>
                        setEditAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  name: e.target.value,
                                  code: x.code || toCode(e.target.value),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                    <input
                      className="md:col-span-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-400"
                      placeholder="code_name"
                      value={a.code}
                      onChange={(e) =>
                        setEditAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? { ...x, code: toCode(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                    <select
                      className="md:col-span-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                      value={a.type}
                      onChange={(e) =>
                        setEditAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, type: e.target.value } : x,
                          ),
                        )
                      }
                    >
                      {ATTR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      className="md:col-span-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                      placeholder="Options (comma separated)"
                      value={a.optionsText}
                      onChange={(e) =>
                        setEditAttributes((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? { ...x, optionsText: e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                    <label className="md:col-span-1 flex items-center justify-center rounded-xl border border-gray-200 bg-white">
                      <input
                        type="checkbox"
                        checked={a.is_required}
                        onChange={(e) =>
                          setEditAttributes((prev) =>
                            prev.map((x, i) =>
                              i === idx
                                ? { ...x, is_required: e.target.checked }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="md:col-span-1 rounded-xl border border-red-200 bg-white px-2 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      onClick={() =>
                        setEditAttributes((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <X size={14} className="mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white/80 px-7 py-5">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editLoading || !editName.trim() || !editingCategoryId}
                onClick={async () => {
                  setEditLoading(true);
                  const res = await fetch("/api/admin/v2/categories", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      site_id: siteId,
                      store_id: storeId,
                      category_id: editingCategoryId,
                      name: editName.trim(),
                      attributes: buildPayloadAttributes(editAttributes),
                    }),
                  });
                  const data = await res.json().catch(() => ({}));
                  setEditLoading(false);
                  if (!res.ok) {
                    toast({
                      variant: "error",
                      title: "Update failed",
                      description: data?.error || "Could not update category",
                    });
                    return;
                  }
                  await refresh();
                  setEditOpen(false);
                  toast({ variant: "success", title: "Category updated" });
                }}
                className="rounded-full bg-[#111827] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-40"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function CategoryCreateClient2({
  siteId,
  storeId,
  storePreset,
  initialCategories,
  stores,
}: {
  siteId: string;
  storeId: string;
  storePreset: string;
  initialCategories: Category[];
  stores: Array<{ id: string; name: string; store_type: string }>;
}) {
  const { toast } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>(
    initialCategories || [],
  );
  const [name, setName] = useState("");
  const [attributes, setAttributes] = useState<DraftAttr[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/admin/v2/store-types?site_id=${encodeURIComponent(siteId)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) setPresets(data.presets || []);
    })();
  }, [siteId]);

  const suggestions = useMemo(() => {
    const preset = presets.find((p) => p.key === storePreset);
    if (!preset) return [];
    const map = new Map<string, DraftAttr>();
    for (const c of preset.categories || []) {
      for (const a of c.attributes || []) {
        if (!map.has(a.code)) {
          map.set(a.code, {
            code: a.code,
            name: a.name,
            type: a.type || "text",
            is_required: Boolean(a.required),
            optionsText: Array.isArray(a.options) ? a.options.join(", ") : "",
          });
        }
      }
    }
    return Array.from(map.values());
  }, [presets, storePreset]);

  async function refresh() {
    const cRes = await fetch(
      `/api/admin/v2/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
      { cache: "no-store" },
    );
    if (!cRes.ok) return;
    const cData = await cRes.json().catch(() => ({}));
    const cats = cData.categories || [];
    const next = await Promise.all(
      cats.map(async (c: any) => {
        const aRes = await fetch(
          `/api/admin/v2/category-attributes?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&category_id=${encodeURIComponent(c.id)}`,
          { cache: "no-store" },
        );
        const aData = await aRes.json().catch(() => ({}));
        return { ...c, attributes: aData.attributes || [] };
      }),
    );
    setCategories(next);
  }

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-white space-y-2">
        <div className="text-sm font-medium">Select Store</div>
        <select
          className="border p-2 rounded w-full"
          value={storeId}
          onChange={(e) => {
            const nextStoreId = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            params.set("site_id", siteId);
            if (nextStoreId) params.set("store_id", nextStoreId);
            router.replace(`/categories?${params.toString()}`);
          }}
        >
          <option value="">Select a store</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.store_type})
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded p-4 bg-white space-y-3">
        <div className="text-sm font-medium">Create Category</div>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="border p-2 rounded w-full"
          required
        />

        <div className="space-y-2">
          <div className="text-xs text-gray-600">Preset suggestions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                type="button"
                key={s.code}
                className="px-2 py-1 text-xs border rounded bg-gray-50"
                onClick={() =>
                  setAttributes((prev) => {
                    if (prev.some((x) => x.code === s.code)) return prev;
                    return [...prev, { ...s }];
                  })
                }
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>

        {attributes.map((a, idx) => (
          <div
            key={`attr-legacy-${idx}`}
            className="grid grid-cols-1 md:grid-cols-12 gap-2"
          >
            <input
              className="border p-2 rounded md:col-span-3"
              placeholder="Name"
              value={a.name}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) =>
                    i === idx
                      ? {
                          ...x,
                          name: e.target.value,
                          code: x.code || toCode(e.target.value),
                        }
                      : x,
                  ),
                )
              }
            />
            <input
              className="border p-2 rounded md:col-span-2"
              placeholder="Code"
              value={a.code}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) =>
                    i === idx ? { ...x, code: toCode(e.target.value) } : x,
                  ),
                )
              }
            />
            <select
              className="border p-2 rounded md:col-span-2"
              value={a.type}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) =>
                    i === idx ? { ...x, type: e.target.value } : x,
                  ),
                )
              }
            >
              {ATTR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="border p-2 rounded md:col-span-3"
              placeholder="Options: S, M, L"
              value={a.optionsText}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((x, i) =>
                    i === idx ? { ...x, optionsText: e.target.value } : x,
                  ),
                )
              }
            />
            <label className="md:col-span-1 text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={a.is_required}
                onChange={(e) =>
                  setAttributes((prev) =>
                    prev.map((x, i) =>
                      i === idx ? { ...x, is_required: e.target.checked } : x,
                    ),
                  )
                }
              />
              Req
            </label>
            <button
              type="button"
              className="md:col-span-1 border rounded"
              onClick={() =>
                setAttributes((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() =>
              setAttributes((prev) => [
                ...prev,
                {
                  code: "",
                  name: "",
                  type: "text",
                  is_required: false,
                  optionsText: "",
                },
              ])
            }
          >
            + Add Attribute
          </button>
          <button
            className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
            disabled={loading || !name.trim() || !storeId}
            onClick={async () => {
              setLoading(true);
              const payload = {
                site_id: siteId,
                store_id: storeId,
                name: name.trim(),
                attributes: attributes
                  .filter((a) => a.name.trim())
                  .map((a, idx) => ({
                    code: a.code.trim() || toCode(a.name),
                    name: a.name.trim(),
                    type: a.type,
                    is_required: a.is_required,
                    is_filterable: true,
                    sort_order: idx,
                    options:
                      a.type === "select" || a.type === "multi_select"
                        ? a.optionsText
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean)
                        : [],
                  })),
              };
              const res = await fetch(
                "/api/admin/store-setup/create-category",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                },
              );
              const data = await res.json().catch(() => ({}));
              setLoading(false);
              if (!res.ok) {
                toast({
                  variant: "error",
                  title: "Failed",
                  description: data?.error || "Could not create category",
                });
                return;
              }
              setName("");
              setAttributes([]);
              await refresh();
              toast({ variant: "success", title: "Category created" });
            }}
          >
            Add Category
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="border rounded p-3 bg-white">
            <div className="font-medium">{c.name}</div>
            <div className="text-xs opacity-70">slug: {c.slug}</div>
            <div className="text-xs mt-1">
              {(c.attributes || []).length} attributes
            </div>
          </div>
        ))}
        {categories.length === 0 ? (
          <div className="opacity-70 text-sm">No categories yet.</div>
        ) : null}
      </div>
    </div>
  );
}
