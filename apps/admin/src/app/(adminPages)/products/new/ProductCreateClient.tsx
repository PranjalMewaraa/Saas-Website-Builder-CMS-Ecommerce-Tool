"use client";

import { useEffect, useMemo, useState } from "react";

// ─── Types & Helpers ────────────────────────────────────────────────
type CategoryAttr = {
  id: string;
  code: string;
  name: string;
  type: string;
  is_required?: number | boolean;
  options?: Array<{ label: string; value: string }>;
};

type VariantDraft = {
  id: string;
  sku: string;
  price: string;
  inventory: string;
  options: Array<{ name: string; value: string }>;
};

function newVariantId() {
  return `var_${Math.random().toString(36).slice(2, 18)}`.slice(0, 26);
}

function emptyVariant(): VariantDraft {
  return {
    id: newVariantId(),
    sku: "",
    price: "",
    inventory: "",
    options: [{ name: "", value: "" }],
  };
}

function buildCategoryOptions(
  categories: Array<{ id: string; name: string; parent_id?: string | null }>,
) {
  const byParent: Record<string, Array<{ id: string; name: string }>> = {};
  const roots: Array<{ id: string; name: string; parent_id?: string | null }> = [];
  for (const c of categories || []) {
    const parent = c.parent_id || "";
    if (!parent) roots.push(c);
    if (!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(c);
  }
  for (const k of Object.keys(byParent)) {
    byParent[k].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }
  const out: Array<{ id: string; label: string }> = [];
  function walk(nodes: Array<{ id: string; name: string }>, depth: number) {
    for (const n of nodes) {
      out.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
      const children = byParent[n.id] || [];
      if (children.length) walk(children, depth + 1);
    }
  }
  walk(roots, 0);
  return out;
}

export default function ProductCreateClient({
  siteId,
  storeId,
  catalogId,
}: {
  siteId: string;
  storeId: string;
  catalogId?: string;
}) {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [attrs, setAttrs] = useState<CategoryAttr[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [variantImageFiles, setVariantImageFiles] = useState<
    Record<string, File[]>
  >({});

  // ─── Load Brands & Categories ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch(
            `/api/admin/v2/brands?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          ),
          fetch(
            `/api/admin/v2/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          ),
        ]);

        if (!bRes.ok || !cRes.ok) throw new Error("v2 fetch failed");

        const [bData, cData] = await Promise.all([bRes.json(), cRes.json()]);
        setBrands(bData.brands ?? []);
        setCategories(cData.categories ?? []);
      } catch {
        // legacy fallback
        const [bRes, cRes] = await Promise.all([
          fetch(
            `/api/admin/brands?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          ),
          fetch(
            `/api/admin/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          ),
        ]);
        const [bData, cData] = await Promise.all([bRes.json(), cRes.json()]);
        setBrands(bData.brands ?? []);
        setCategories(cData.categories ?? []);
      }
    })();
  }, [siteId, storeId]);

  // ─── Load Category Attributes ───────────────────────────────────────
  useEffect(() => {
    if (!categoryId) {
      setAttrs([]);
      setAttrValues({});
      return;
    }

    (async () => {
      const res = await fetch(
        `/api/admin/v2/category-attributes?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&category_id=${encodeURIComponent(categoryId)}&include_inherited=1`,
      );
      if (!res.ok) {
        setAttrs([]);
        return;
      }
      const data = await res.json();
      setAttrs(data.attributes ?? []);
      setAttrValues({});
    })();
  }, [siteId, storeId, categoryId]);

  const requiredMissing = useMemo(() => {
    for (const a of attrs) {
      const required =
        Number(a.is_required || 0) === 1 || a.is_required === true;
      if (!required) continue;
      const v = attrValues[a.code];
      if (v == null || v === "" || (Array.isArray(v) && v.length === 0))
        return a.name;
    }
    return null;
  }, [attrs, attrValues]);

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories || []),
    [categories],
  );

  // ─── Form Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const basePayload = {
      site_id: siteId,
      store_id: storeId,
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "") || null,
      sku: String(fd.get("sku") || "").trim() || null,
      base_price_cents: Math.round(Number(fd.get("price") || 0) * 100),
      inventory_quantity: Math.max(
        0,
        Number(fd.get("inventory_quantity") || 0),
      ),
      status: String(fd.get("status") || "draft"),
      brand_id: String(fd.get("brand_id") || "").trim() || null,
      store_category_id: categoryId,
      attributes: attrValues,
      image_urls: [] as string[],
      variants: [] as any[],
    };

    if (!basePayload.title) {
      setError("Product title is required");
      return;
    }

    if (!basePayload.store_category_id) {
      setError("Please select a category");
      return;
    }

    if (requiredMissing) {
      setError(`Required attribute missing: ${requiredMissing}`);
      return;
    }

    let variantPayload: any[] = [];

    if (useVariants) {
      const cleaned = variants
        .map((v) => {
          const options: Record<string, string> = {};
          for (const { name, value } of v.options || []) {
            const k = String(name || "").trim();
            const val = String(value || "").trim();
            if (k && val) options[k] = val;
          }
          return {
            id: v.id,
            sku: String(v.sku || "").trim() || null,
            price_cents: Math.round(Number(v.price || 0) * 100),
            inventory_qty: Math.max(0, Number(v.inventory || 0)),
            options,
          };
        })
        .filter((v) => Number.isFinite(v.price_cents) && v.price_cents >= 0);

      if (cleaned.length === 0) {
        setError(
          "At least one valid variant is required when variants are enabled",
        );
        return;
      }

      variantPayload = cleaned;
      basePayload.variants = cleaned;
    }

    setUploading(true);

    try {
      let productId = "";

      // Try v2 endpoint first
      try {
        const res = await fetch(
          `/api/admin/v2/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basePayload),
          },
        );

        if (res.ok) {
          const data = await res.json();
          productId = String(
            data?.product?.product_id || data?.product_id || "",
          );
        } else {
          throw new Error(await res.text());
        }
      } catch (err) {
        // fallback to legacy endpoint
        const legacyPayload = {
          title: basePayload.title,
          sku: basePayload.sku || undefined,
          base_price_cents: basePayload.base_price_cents,
          status: basePayload.status,
          brand_id: basePayload.brand_id,
          category_ids: basePayload.store_category_id
            ? [basePayload.store_category_id]
            : [],
          store_id: basePayload.store_id,
        };

        const res = await fetch(
          `/api/admin/products?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(legacyPayload),
          },
        );

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        productId = String(
          data?.product?.id ||
            data?.product_id ||
            data?.product?.product_id ||
            "",
        );
      }

      if (!productId)
        throw new Error("Could not retrieve product ID after creation");

      // ─── Upload Product Images ──────────────────────────────────────
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("product_id", productId);
          formData.append("file", file);

          const up = await fetch(
            `/api/admin/products/images/upload?site_id=${encodeURIComponent(siteId)}`,
            { method: "POST", body: formData },
          );

          if (!up.ok) {
            const errData = await up.json().catch(() => ({}));
            throw new Error(errData?.error || "Product image upload failed");
          }
        }
      }

      // ─── Upload Variant Images ──────────────────────────────────────
      if (useVariants && variantPayload.length > 0) {
        for (const variant of variantPayload) {
          const files = variantImageFiles[variant.id] || [];
          for (const file of files) {
            const formData = new FormData();
            formData.append("product_id", productId);
            formData.append("variant_id", variant.id);
            formData.append("file", file);

            const up = await fetch(
              `/api/admin/products/images/upload?site_id=${encodeURIComponent(siteId)}`,
              { method: "POST", body: formData },
            );

            if (!up.ok) {
              const errData = await up.json().catch(() => ({}));
              throw new Error(errData?.error || "Variant image upload failed");
            }
          }
        }
      }

      // Success → redirect
      window.location.href = catalogId
        ? `/products?site_id=${encodeURIComponent(siteId)}&catalog_id=${encodeURIComponent(catalogId)}`
        : `/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
    } catch (err: any) {
      setError(err.message || "Product creation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="max-w-5xl mx-auto p-4 space-y-6 pb-32"
      onSubmit={handleSubmit}
    >
      {/* Header + Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            New Product
          </h1>
          <p className="text-slate-500 font-medium italic">
            Pricing set in Indian Rupee (INR)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            name="status"
            className="bg-white border border-slate-200 text-sm font-bold rounded-xl px-4 py-2 outline-none shadow-sm"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary Info */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <label className="text-xs font-black uppercase text-slate-400 mb-2 block">
            General Information
          </label>
          <div className="space-y-4">
            <input
              name="title"
              className="w-full text-xl font-bold border-none p-0 focus:ring-0 placeholder-slate-300"
              placeholder="Product Title..."
              required
            />
            <textarea
              name="description"
              rows={4}
              className="w-full border-slate-100 rounded-xl text-sm focus:border-slate-300 transition-all outline-none bg-slate-50/50 p-4"
              placeholder="Detailed description..."
            />
          </div>
        </div>

        {/* Media Upload Tile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center text-center group">
          <label className="text-xs font-black uppercase text-slate-500 mb-4 block">
            Product Gallery
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="image-upload"
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
              🖼️
            </div>
            <p className="text-white text-sm font-bold">Upload Media</p>
            <p className="text-slate-500 text-[10px] mt-1">
              {imageFiles.length} file{imageFiles.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </label>
        </div>

        {/* Brand & SKU */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <label className="text-xs font-black uppercase text-slate-400 mb-4 block">
            Logistics
          </label>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 mb-1">BRAND</p>
              <select
                name="brand_id"
                className="w-full text-sm border-slate-100 rounded-lg outline-none"
              >
                <option value="">Auto Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 mb-1">
                IDENTIFIER (SKU)
              </p>
              <input
                name="sku"
                className="w-full text-sm border-slate-100 rounded-lg outline-none"
                placeholder="SKU-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Category + Attributes */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <label className="text-xs font-black uppercase text-slate-400 mb-4 block">
            Organization & Attributes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-slate-500 mb-1">
                CATEGORY *
              </p>
              <select
                className="w-full border-slate-100 rounded-lg text-sm bg-slate-50/50 p-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {attrs.map((a) => (
              <div
                key={a.id}
                className="bg-slate-50 p-3 rounded-xl border border-slate-100"
              >
                <p className="text-[10px] font-bold text-slate-500 mb-1">
                  {a.name.toUpperCase()} {Number(a.is_required) === 1 && "*"}
                </p>

                {a.type === "select" ? (
                  <select
                    className="w-full text-xs border-none bg-transparent outline-none p-0"
                    value={attrValues[a.code] ?? ""}
                    onChange={(e) =>
                      setAttrValues((p) => ({ ...p, [a.code]: e.target.value }))
                    }
                  >
                    <option value="">Choose...</option>
                    {a.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : a.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={!!attrValues[a.code]}
                    onChange={(e) =>
                      setAttrValues((p) => ({
                        ...p,
                        [a.code]: e.target.checked,
                      }))
                    }
                  />
                ) : (
                  <input
                    type={
                      a.type === "number"
                        ? "number"
                        : a.type === "date"
                          ? "date"
                          : "text"
                    }
                    className="w-full text-xs border-none bg-transparent outline-none p-0 placeholder-slate-400"
                    placeholder={`Enter ${a.name}...`}
                    value={attrValues[a.code] ?? ""}
                    onChange={(e) =>
                      setAttrValues((p) => ({ ...p, [a.code]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Single Product Pricing (only shown when !useVariants) */}
        {!useVariants && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <label className="text-xs font-black uppercase text-emerald-600 block">
              Single Item Pricing
            </label>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-700">
                  ₹
                </span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  className="w-full pl-8 border-emerald-200 bg-white rounded-xl text-lg font-bold outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <input
                name="inventory_quantity"
                type="number"
                min={0}
                className="w-full border-emerald-200 bg-white rounded-xl text-sm p-2 outline-none"
                placeholder="Stock Level"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Variants Section ──────────────────────────────────────────────── */}
      <div
        className={`bg-white border rounded-3xl p-6 transition-all ${
          useVariants
            ? "border-blue-200 bg-blue-50/10 shadow-lg"
            : "border-slate-100"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Variants
              {useVariants && (
                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Enabled
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Enable if this product has multiple sizes or colors
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseVariants(!useVariants)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              useVariants ? "bg-blue-500" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                useVariants ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {useVariants && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {variants.map((v, idx) => (
              <div
                key={v.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative group"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-300 uppercase">
                    #Var {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVariants((p) => p.filter((_, i) => i !== idx));
                      setVariantImageFiles((prev) => {
                        const copy = { ...prev };
                        delete copy[v.id];
                        return copy;
                      });
                    }}
                    className="text-slate-300 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400">
                      PRICE
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full pt-5 pb-2 px-2 text-sm border-slate-100 rounded-lg bg-slate-50/50"
                      value={v.price}
                      placeholder="₹ 0.00"
                      onChange={(e) =>
                        setVariants((p) =>
                          p.map((curr, i) =>
                            i === idx
                              ? { ...curr, price: e.target.value }
                              : curr,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400">
                      STOCK
                    </span>
                    <input
                      type="number"
                      min={0}
                      className="w-full pt-5 pb-2 px-2 text-sm border-slate-100 rounded-lg bg-slate-50/50"
                      value={v.inventory}
                      placeholder="0"
                      onChange={(e) =>
                        setVariants((p) =>
                          p.map((curr, i) =>
                            i === idx
                              ? { ...curr, inventory: e.target.value }
                              : curr,
                          ),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {v.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex gap-2 items-center">
                      <input
                        className="flex-1 text-[11px] p-2 border-slate-100 rounded-md bg-slate-50"
                        placeholder="e.g. Size"
                        value={opt.name}
                        onChange={(e) =>
                          setVariants((p) =>
                            p.map((curr, i) =>
                              i === idx
                                ? {
                                    ...curr,
                                    options: curr.options.map((o, j) =>
                                      j === optIdx
                                        ? { ...o, name: e.target.value }
                                        : o,
                                    ),
                                  }
                                : curr,
                            ),
                          )
                        }
                      />
                      <input
                        className="flex-1 text-[11px] p-2 border-slate-100 rounded-md bg-slate-50"
                        placeholder="e.g. XL"
                        value={opt.value}
                        onChange={(e) =>
                          setVariants((p) =>
                            p.map((curr, i) =>
                              i === idx
                                ? {
                                    ...curr,
                                    options: curr.options.map((o, j) =>
                                      j === optIdx
                                        ? { ...o, value: e.target.value }
                                        : o,
                                    ),
                                  }
                                : curr,
                            ),
                          )
                        }
                      />
                      {v.options.length > 1 && (
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600 text-xs"
                          onClick={() =>
                            setVariants((p) =>
                              p.map((curr, i) =>
                                i === idx
                                  ? {
                                      ...curr,
                                      options: curr.options.filter(
                                        (_, j) => j !== optIdx,
                                      ),
                                    }
                                  : curr,
                              ),
                            )
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1"
                    onClick={() =>
                      setVariants((p) =>
                        p.map((curr, i) =>
                          i === idx
                            ? {
                                ...curr,
                                options: [
                                  ...curr.options,
                                  { name: "", value: "" },
                                ],
                              }
                            : curr,
                        ),
                      )
                    }
                  >
                    + Add Option Pair
                  </button>
                </div>

                {/* Variant Images */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-2">
                    VARIANT IMAGES
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="text-sm text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) =>
                      setVariantImageFiles((prev) => ({
                        ...prev,
                        [v.id]: Array.from(e.target.files || []),
                      }))
                    }
                  />
                  {(variantImageFiles[v.id]?.length || 0) > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {variantImageFiles[v.id].length} image(s) selected
                    </p>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="lg:col-span-2 py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-all"
              onClick={() => setVariants((p) => [...p, emptyVariant()])}
            >
              + Create New Variant Card
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-4 rounded-2xl font-black text-white shadow-2xl transition-all active:scale-95 ${
            uploading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>CREATING PRODUCT...</span>
            </div>
          ) : (
            "CREATE & SYNC PRODUCT"
          )}
        </button>
      </div>
    </form>
  );
}
