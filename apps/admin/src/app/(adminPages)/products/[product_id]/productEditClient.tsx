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

export default function ProductEditClient({
  siteId,
  storeId,
  product,
}: {
  siteId: string;
  storeId: string;
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
        };

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

        window.location.href = `/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
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
