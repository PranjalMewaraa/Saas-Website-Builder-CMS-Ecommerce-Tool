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
        if (!bRes.ok || !cRes.ok) throw new Error("v2 read failed");
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
      }
    })();
  }, [siteId, storeId]);

  useEffect(() => {
    if (!categoryId) {
      setAttrs([]);
      setAttrValues({});
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
      setAttrValues({});
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
          title: String(fd.get("title") || ""),
          description: String(fd.get("description") || "") || null,
          sku: String(fd.get("sku") || "") || null,
          base_price_cents: Math.round(Number(fd.get("price") || 0) * 100),
          inventory_quantity: Math.max(0, Number(fd.get("inventory_quantity") || 0)),
          status: String(fd.get("status") || "draft"),
          brand_id: String(fd.get("brand_id") || "") || null,
          store_category_id: categoryId,
          attributes: attrValues,
          image_urls: [],
        };

        if (!payload.store_category_id) {
          setError("Select category");
          return;
        }
        if (requiredMissing) {
          setError(`Missing required attribute: ${requiredMissing}`);
          return;
        }

        let createdProductId = "";
        try {
          const v2 = await fetch(
            `/api/admin/v2/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          if (!v2.ok) {
            const text = await v2.text();
            throw new Error(text || "v2 create failed");
          }
          const v2Data = await v2.json().catch(() => ({}));
          createdProductId =
            String(v2Data?.product?.product_id || v2Data?.product_id || "");
        } catch {
          const legacy = await fetch(
            `/api/admin/products?site_id=${encodeURIComponent(siteId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: payload.title,
                sku: payload.sku || undefined,
                base_price_cents: payload.base_price_cents,
                status: payload.status,
                brand_id: payload.brand_id,
                category_ids: payload.store_category_id
                  ? [payload.store_category_id]
                  : [],
                store_id: payload.store_id,
              }),
            },
          );
          if (!legacy.ok) {
            const data = await legacy.json().catch(() => ({}));
            setError(data.error || "Create failed");
            return;
          }
          const legacyData = await legacy.json().catch(() => ({}));
          createdProductId = String(
            legacyData?.product?.id ||
              legacyData?.product_id ||
              legacyData?.product?.product_id ||
              "",
          );
        }

        if (imageFiles.length && createdProductId) {
          setUploading(true);
          for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("product_id", createdProductId);
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
              setUploading(false);
              setError(upData?.error || "Image upload failed");
              return;
            }
          }
          setUploading(false);
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
        required
      />
      <textarea
        name="description"
        className="border p-2 rounded w-full"
        placeholder="Description"
      />
      <select
        name="brand_id"
        className="border p-2 rounded w-full"
        defaultValue=""
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
        required
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
      />
      <div className="space-y-1">
        <label className="text-sm font-medium block">Product Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="border p-2 rounded w-full"
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
        />
        {imageFiles.length ? (
          <div className="text-xs text-gray-500">
            {imageFiles.length} image(s) selected
          </div>
        ) : null}
      </div>
      <input
        name="price"
        type="number"
        step="0.01"
        className="border p-2 rounded w-full"
        placeholder="Price (e.g. 99.99)"
        defaultValue="0"
        required
      />
      <input
        name="inventory_quantity"
        type="number"
        min={0}
        className="border p-2 rounded w-full"
        placeholder="Inventory"
        defaultValue="0"
        required
      />
      <select
        name="status"
        className="border p-2 rounded w-full"
        defaultValue="draft"
      >
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <button className="bg-black text-white px-3 py-2 rounded" disabled={uploading}>
        {uploading ? "Uploading Images..." : "Create"}
      </button>
    </form>
  );
}
