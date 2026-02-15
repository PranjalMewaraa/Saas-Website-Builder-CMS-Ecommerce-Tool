"use client";

import { useEffect, useMemo, useState } from "react";

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

function toVariantDraft(v: any): VariantDraft {
  const optionsObj =
    v?.options && typeof v.options === "object" && !Array.isArray(v.options)
      ? v.options
      : {};
  const options = Object.entries(optionsObj).map(([name, value]) => ({
    name: String(name || ""),
    value: String(value || ""),
  }));
  return {
    id: v?.id ? String(v.id) : newVariantId(),
    sku: String(v?.sku || ""),
    price:
      v?.price_cents == null ? "" : String((Number(v.price_cents || 0) / 100).toFixed(2)),
    inventory: v?.inventory_qty == null ? "" : String(Number(v.inventory_qty || 0)),
    options: options.length ? options : [{ name: "", value: "" }],
  };
}

export default function ProductEditClient({
  siteId,
  storeId,
  catalogId,
  product,
}: {
  siteId: string;
  storeId: string;
  catalogId?: string;
  product: any | null;
}) {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [attrs, setAttrs] = useState<CategoryAttr[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [attrValues, setAttrValues] = useState<Record<string, any>>(
    product?.attributes || {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [variantImageFiles, setVariantImageFiles] = useState<Record<string, File[]>>({});

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
        if (!bRes.ok || !cRes.ok) throw new Error("v2 list failed");
        const [bData, cData] = await Promise.all([bRes.json(), cRes.json()]);
        setBrands(bData.brands ?? []);
        setCategories(cData.categories ?? []);
      } catch {
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
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId, storeId]);

  useEffect(() => {
    const initialCategory =
      product?.store_category_id ||
      (Array.isArray(product?.category_ids) ? product.category_ids[0] : "");
    setCategoryId(initialCategory || "");
  }, [product]);

  useEffect(() => {
    const list = Array.isArray(product?.variants) ? product.variants : [];
    if (!list.length) {
      setUseVariants(false);
      setVariants([emptyVariant()]);
      return;
    }
    setVariants(list.map((v: any) => toVariantDraft(v)));
    setUseVariants(
      list.length > 1 ||
        list.some((v: any) => {
          const options = v?.options && typeof v.options === "object" ? v.options : {};
          return Object.keys(options).some((k) => k !== "default");
        }),
    );
  }, [product]);

  useEffect(() => {
    if (!categoryId) {
      setAttrs([]);
      return;
    }
    (async () => {
      const res = await fetch(
        `/api/admin/v2/category-attributes?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&category_id=${encodeURIComponent(categoryId)}`,
      );
      if (!res.ok) {
        setAttrs([]);
        return;
      }
      const data = await res.json();
      setAttrs(data.attributes ?? []);
    })();
  }, [siteId, storeId, categoryId]);

  const requiredMissing = useMemo(() => {
    for (const a of attrs) {
      const required = Number(a.is_required || 0) === 1 || a.is_required === true;
      if (!required) continue;
      const v = attrValues[a.code];
      if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) return a.name;
    }
    return null;
  }, [attrs, attrValues]);

  if (!product) {
    return (
      <div className="border rounded p-4 text-sm text-red-600">
        Product not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border rounded p-4 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <form
      className="border rounded p-4 space-y-3 max-w-xl"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);

        const payload = {
          site_id: siteId,
          store_id: storeId,
          product_id: product.id,
          title: String(fd.get("title") || ""),
          description: String(fd.get("description") || "") || null,
          sku: String(fd.get("sku") || "") || null,
          base_price_cents: Math.round(Number(fd.get("price") || 0) * 100),
          inventory_quantity: Math.max(0, Number(fd.get("inventory_quantity") || 0)),
          status: String(fd.get("status") || "draft"),
          brand_id: String(fd.get("brand_id") || "") || null,
          store_category_id: categoryId || null,
          attributes: attrValues,
          variants: undefined as
            | Array<{
                id: string;
                sku?: string | null;
                price_cents?: number;
                inventory_qty?: number;
                options?: Record<string, string>;
              }>
            | undefined,
        };
        let variantPayload: Array<{
          id: string;
          sku?: string | null;
          price_cents?: number;
          inventory_qty?: number;
          options?: Record<string, string>;
        }> = [];

        if (useVariants) {
          const cleaned = variants
            .map((v) => {
              const options: Record<string, string> = {};
              for (const pair of v.options || []) {
                const key = String(pair.name || "").trim();
                const value = String(pair.value || "").trim();
                if (!key || !value) continue;
                options[key] = value;
              }
              return {
                id: v.id,
                sku: String(v.sku || "").trim() || null,
                price_cents: Math.round(Number(v.price || 0) * 100),
                inventory_qty: Math.max(0, Number(v.inventory || 0)),
                options,
              };
            })
            .filter((v) => v.price_cents >= 0);
          if (!cleaned.length) {
            setError("Add at least one variant");
            return;
          }
          const invalid = cleaned.find(
            (v) => !Number.isFinite(v.price_cents) || !Number.isFinite(v.inventory_qty),
          );
          if (invalid) {
            setError("Variant price and inventory must be valid numbers");
            return;
          }
          variantPayload = cleaned;
          payload.variants = cleaned;
        }

        if (requiredMissing) {
          setError(`Missing required attribute: ${requiredMissing}`);
          return;
        }

        try {
          const v2 = await fetch(`/api/admin/v2/products`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!v2.ok) throw new Error("v2 update failed");
        } catch {
          const legacy = await fetch(
            `/api/admin/products?site_id=${encodeURIComponent(siteId)}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: product.id,
                title: payload.title,
                description: payload.description,
                sku: payload.sku || undefined,
                base_price_cents: payload.base_price_cents,
                status: payload.status,
                brand_id: payload.brand_id || null,
                category_ids: payload.store_category_id
                  ? [payload.store_category_id]
                  : [],
                store_id: storeId || undefined,
              }),
            },
          );
          if (!legacy.ok) {
            const data = await legacy.json().catch(() => ({}));
            setError(data.error || "Update failed");
            return;
          }
        }

        if (variantPayload.length) {
          for (const variant of variantPayload) {
            const files = variantImageFiles[variant.id] || [];
            for (const file of files) {
              const formData = new FormData();
              formData.append("product_id", product.id);
              formData.append("variant_id", variant.id);
              formData.append("file", file);
              const up = await fetch(
                `/api/admin/products/images/upload?site_id=${encodeURIComponent(siteId)}`,
                {
                  method: "POST",
                  body: formData,
                },
              );
              if (!up.ok) {
                const upData = await up.json().catch(() => ({}));
                setError(upData?.error || "Variant image upload failed");
                return;
              }
            }
          }
        }

        window.location.href = catalogId
          ? `/products?site_id=${encodeURIComponent(siteId)}&catalog_id=${encodeURIComponent(catalogId)}`
          : `/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
      }}
    >
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <input
        name="title"
        className="border p-2 rounded w-full"
        placeholder="Title"
        defaultValue={product.title || ""}
        required
      />
      <textarea
        name="description"
        className="border p-2 rounded w-full"
        placeholder="Description"
        defaultValue={product.description || ""}
      />
      <select
        name="brand_id"
        className="border p-2 rounded w-full"
        defaultValue={product.brand_id || ""}
      >
        <option value="">(Legacy Brand Auto)</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        name="store_category_id"
        className="border p-2 rounded w-full"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {attrs.map((a) => {
        const value = attrValues[a.code] ?? "";
        if (a.type === "select") {
          return (
            <select
              key={a.id}
              className="border p-2 rounded w-full"
              value={value}
              onChange={(e) =>
                setAttrValues((prev) => ({ ...prev, [a.code]: e.target.value }))
              }
            >
              <option value="">{a.name}</option>
              {(a.options || []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        }
        if (a.type === "boolean") {
          return (
            <label key={a.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(attrValues[a.code])}
                onChange={(e) =>
                  setAttrValues((prev) => ({ ...prev, [a.code]: e.target.checked }))
                }
              />
              {a.name}
            </label>
          );
        }
        return (
          <input
            key={a.id}
            type={a.type === "number" ? "number" : a.type === "date" ? "date" : "text"}
            className="border p-2 rounded w-full"
            placeholder={a.name}
            value={value}
            onChange={(e) =>
              setAttrValues((prev) => ({ ...prev, [a.code]: e.target.value }))
            }
          />
        );
      })}
      <input
        name="sku"
        className="border p-2 rounded w-full"
        placeholder="SKU (optional)"
        defaultValue={product.sku || ""}
      />
      <div className="rounded-lg border border-slate-200 p-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={useVariants}
            onChange={(e) => setUseVariants(e.target.checked)}
          />
          Use variants (size/color etc)
        </label>
        {useVariants ? (
          <div className="space-y-3">
            {variants.map((variant, idx) => (
              <div key={variant.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Variant {idx + 1}</div>
                  <button
                    type="button"
                    className="text-xs text-red-600 disabled:opacity-40"
                    disabled={variants.length <= 1}
                    onClick={() =>
                      setVariants((prev) => {
                        const next = prev.filter((_, i) => i !== idx);
                        setVariantImageFiles((imgPrev) => {
                          const copy = { ...imgPrev };
                          delete copy[variant.id];
                          return copy;
                        });
                        return next;
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Variant SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((v, i) => (i === idx ? { ...v, sku: e.target.value } : v)),
                      )
                    }
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="border p-2 rounded w-full"
                    placeholder="Price"
                    value={variant.price}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((v, i) => (i === idx ? { ...v, price: e.target.value } : v)),
                      )
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    className="border p-2 rounded w-full"
                    placeholder="Inventory"
                    value={variant.inventory}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((v, i) =>
                          i === idx ? { ...v, inventory: e.target.value } : v,
                        ),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  {(variant.options || []).map((opt, optIdx) => (
                    <div key={optIdx} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        className="border p-2 rounded w-full"
                        placeholder="Option name (e.g. Color)"
                        value={opt.name}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === idx
                                ? {
                                    ...v,
                                    options: v.options.map((o, j) =>
                                      j === optIdx ? { ...o, name: e.target.value } : o,
                                    ),
                                  }
                                : v,
                            ),
                          )
                        }
                      />
                      <input
                        className="border p-2 rounded w-full"
                        placeholder="Option value (e.g. Red)"
                        value={opt.value}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === idx
                                ? {
                                    ...v,
                                    options: v.options.map((o, j) =>
                                      j === optIdx ? { ...o, value: e.target.value } : o,
                                    ),
                                  }
                                : v,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-xs text-red-600 disabled:opacity-40 px-2"
                        disabled={(variant.options || []).length <= 1}
                        onClick={() =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === idx
                                ? {
                                    ...v,
                                    options: v.options.filter((_, j) => j !== optIdx),
                                  }
                                : v,
                            ),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-xs border rounded px-2 py-1"
                    onClick={() =>
                      setVariants((prev) =>
                        prev.map((v, i) =>
                          i === idx
                            ? { ...v, options: [...(v.options || []), { name: "", value: "" }] }
                            : v,
                        ),
                      )
                    }
                  >
                    + Add option
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium block">Variant Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="border p-2 rounded w-full"
                    onChange={(e) =>
                      setVariantImageFiles((prev) => ({
                        ...prev,
                        [variant.id]: Array.from(e.target.files || []),
                      }))
                    }
                  />
                  {(variantImageFiles[variant.id] || []).length ? (
                    <div className="text-xs text-gray-500">
                      {(variantImageFiles[variant.id] || []).length} image(s) selected
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm border rounded px-3 py-1.5"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            >
              + Add variant
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Leave off to keep single-variant behavior from base price and inventory.
          </p>
        )}
      </div>
      <input
        name="price"
        type="number"
        step="0.01"
        className="border p-2 rounded w-full"
        placeholder="Price"
        defaultValue={Number(product.base_price_cents || 0) / 100}
        required
      />
      <input
        name="inventory_quantity"
        type="number"
        min={0}
        className="border p-2 rounded w-full"
        placeholder="Inventory"
        defaultValue={Number(product.inventory_qty || 0)}
      />
      <select
        name="status"
        className="border p-2 rounded w-full"
        defaultValue={product.status || "draft"}
      >
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <button className="bg-black text-white px-3 py-2 rounded">Save</button>
    </form>
  );
}
