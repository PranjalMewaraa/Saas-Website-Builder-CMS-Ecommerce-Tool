"use client";

import ProductCreateClient from "../products/new/ProductCreateClient";
import { useUI } from "@/app/_components/ui/UiProvider";
import { useEffect, useMemo, useState } from "react";

type Preset = {
  key: string;
  label: string;
  categories: Array<{
    name: string;
    attributes: Array<{
      code: string;
      name: string;
      type: string;
      required?: boolean;
      options?: string[];
    }>;
  }>;
};

type DraftAttr = {
  code: string;
  name: string;
  type: string;
  is_required: boolean;
  optionsText: string;
};

type StoreCategory = {
  id: string;
  name: string;
  parent_id?: string | null;
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

export default function StoreWizard({ siteId }: { siteId?: string }) {
  const { toast } = useUI();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [storeId, setStoreId] = useState<string>("");
  const [storeType, setStoreType] = useState<"brand" | "distributor">("brand");
  const [storeName, setStoreName] = useState("");
  const [preset, setPreset] = useState("fashion");
  const [presets, setPresets] = useState<Preset[]>([]);

  const [brandName, setBrandName] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [attributes, setAttributes] = useState<DraftAttr[]>([]);
  const [isSubCategory, setIsSubCategory] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [effectiveSiteId, setEffectiveSiteId] = useState(siteId || "");

  useEffect(() => {
    if (siteId) {
      setEffectiveSiteId(siteId);
      return;
    }
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      setEffectiveSiteId(q.get("site_id") || "");
    }
  }, [siteId]);

  useEffect(() => {
    (async () => {
      if (!effectiveSiteId) return;
      const res = await fetch(
        `/api/admin/v2/store-types?site_id=${encodeURIComponent(effectiveSiteId)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPresets((data.presets || []) as Preset[]);
      }
    })();
  }, [effectiveSiteId]);

  useEffect(() => {
    (async () => {
      if (step !== 3) return;
      if (!effectiveSiteId || !storeId) return;
      setLoadingCategories(true);
      try {
        const res = await fetch(
          `/api/admin/v2/categories?site_id=${encodeURIComponent(effectiveSiteId)}&store_id=${encodeURIComponent(storeId)}`,
          { cache: "no-store" },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        setStoreCategories(Array.isArray(data?.categories) ? data.categories : []);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, [effectiveSiteId, step, storeId]);

  const presetSuggestions = useMemo(() => {
    const match = presets.find((p) => p.key === preset);
    if (!match) return [];
    const map = new Map<string, DraftAttr>();
    for (const c of match.categories || []) {
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
  }, [preset, presets]);

  async function createStore() {
    if (!effectiveSiteId) {
      toast({
        variant: "error",
        title: "Missing site",
        description: "site_id is required in URL",
      });
      return;
    }
    if (!storeName.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/admin/store-setup/create-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: effectiveSiteId,
          store_type: storeType,
          name: storeName.trim(),
          industry: preset,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.store_id) {
        throw new Error(d?.error || "Failed to create store");
      }
      setStoreId(d.store_id);
      setStep(2);
      toast({ variant: "success", title: "Store created" });
    } catch (e: any) {
      toast({
        variant: "error",
        title: "Store creation failed",
        description: e?.message || "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function createBrand() {
    if (!effectiveSiteId) {
      toast({
        variant: "error",
        title: "Missing site",
        description: "site_id is required in URL",
      });
      return;
    }
    if (!storeId) {
      toast({
        variant: "error",
        title: "Missing store",
        description: "Create store first",
      });
      return;
    }
    if (!brandName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/store-setup/create-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: effectiveSiteId,
          store_id: storeId,
          name: brandName.trim(),
          type: storeType === "brand" ? "brand" : "distributor",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Brand creation failed");
      setStep(3);
      toast({ variant: "success", title: "Brand created" });
    } catch (e: any) {
      toast({
        variant: "error",
        title: "Brand creation failed",
        description: e?.message || "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function createCategory() {
    if (!effectiveSiteId) {
      toast({
        variant: "error",
        title: "Missing site",
        description: "site_id is required in URL",
      });
      return;
    }
    if (!storeId) {
      toast({
        variant: "error",
        title: "Missing store",
        description: "Create store first",
      });
      return;
    }
    if (!categoryName.trim()) return;
    setSubmitting(true);
    try {
      const payloadAttrs = attributes
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
      const res = await fetch("/api/admin/store-setup/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: effectiveSiteId,
          store_id: storeId,
          name: categoryName.trim(),
          parent_id: isSubCategory ? parentCategoryId || null : null,
          attributes: payloadAttrs,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Category creation failed");
      setCategoryName("");
      setAttributes([]);
      setIsSubCategory(false);
      setParentCategoryId("");
      setStep(4);
      toast({ variant: "success", title: "Category created" });
    } catch (e: any) {
      toast({
        variant: "error",
        title: "Category creation failed",
        description: e?.message || "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Store Setup Wizard</h1>

      {step === 1 && (
        <div className="space-y-4 border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold">1. Create Store</h2>
          <input
            type="text"
            placeholder="Store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value as any)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="brand">Brand Store</option>
              <option value="distributor">Distributor Store</option>
            </select>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              {(presets.length
                ? presets.map((p) => ({ key: p.key, label: p.label }))
                : [
                    { key: "fashion", label: "Fashion" },
                    { key: "electronics", label: "Electronics" },
                    { key: "grocery", label: "Grocery" },
                    { key: "beauty_cosmetics", label: "Beauty & Cosmetics" },
                    { key: "home_furniture", label: "Home & Furniture" },
                    { key: "sports_fitness", label: "Sports & Fitness" },
                    { key: "automotive", label: "Automotive" },
                    { key: "books_stationery", label: "Books & Stationery" },
                    { key: "jewelry", label: "Jewelry" },
                    { key: "toys", label: "Toys" },
                    { key: "pet_supplies", label: "Pet Supplies" },
                    { key: "digital_products", label: "Digital Products" },
                    { key: "handmade_crafts", label: "Handmade & Crafts" },
                    { key: "pharmacy", label: "Pharmacy" },
                    { key: "hardware_tools", label: "Hardware & Tools" },
                  ]
              ).map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={!storeName.trim() || submitting}
            onClick={createStore}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold">2. Create Brand</h2>
          <input
            type="text"
            placeholder="Brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <p className="text-xs text-gray-500">
            Store type: <b>{storeType}</b> · This step will create{" "}
            <b>{storeType === "brand" ? "brand" : "distributor"}</b>.
          </p>
          <button
            disabled={!brandName.trim() || submitting}
            onClick={createBrand}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold">3. Create Category + Attributes</h2>
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSubCategory}
              onChange={(e) => {
                setIsSubCategory(e.target.checked);
                if (!e.target.checked) setParentCategoryId("");
              }}
            />
            Create as subcategory
          </label>
          {isSubCategory ? (
            <select
              className="border px-3 py-2 rounded w-full"
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
            >
              <option value="">
                {loadingCategories ? "Loading parent categories..." : "Select parent category"}
              </option>
              {storeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : null}

          <div className="space-y-2">
            <div className="text-sm font-medium">Suggested attributes from preset</div>
            <div className="flex flex-wrap gap-2">
              {presetSuggestions.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  className="px-2 py-1 text-xs rounded border bg-gray-50"
                  onClick={() => {
                    setAttributes((prev) => {
                      if (prev.some((a) => a.code === s.code)) return prev;
                      return [...prev, { ...s }];
                    });
                  }}
                >
                  + {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {attributes.map((a, idx) => (
              <div key={`attr-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <input
                  className="border p-2 rounded md:col-span-3"
                  placeholder="Attribute name"
                  value={a.name}
                  onChange={(e) =>
                    setAttributes((prev) =>
                      prev.map((x, i) =>
                        i === idx
                          ? { ...x, name: e.target.value, code: x.code || toCode(e.target.value) }
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
                      prev.map((x, i) => (i === idx ? { ...x, code: toCode(e.target.value) } : x)),
                    )
                  }
                />
                <select
                  className="border p-2 rounded md:col-span-2"
                  value={a.type}
                  onChange={(e) =>
                    setAttributes((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x)),
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
                  placeholder="Options (comma-separated)"
                  value={a.optionsText}
                  onChange={(e) =>
                    setAttributes((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, optionsText: e.target.value } : x)),
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
                  className="md:col-span-1 px-2 py-2 border rounded"
                  onClick={() => setAttributes((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="px-3 py-2 border rounded"
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

          <div>
            <button
              disabled={
                !categoryName.trim() || submitting || (isSubCategory && !parentCategoryId)
              }
              onClick={createCategory}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              Continue To Product Wizard
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">4. Add Products</h2>
          <ProductCreateClient siteId={effectiveSiteId} storeId={storeId} />
        </div>
      )}
    </div>
  );
}
