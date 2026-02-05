"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [bRes, cRes] = await Promise.all([
        fetch(`/api/admin/brands?site_id=${encodeURIComponent(siteId)}`),
        fetch(`/api/admin/categories?site_id=${encodeURIComponent(siteId)}`),
      ]);
      const [bData, cData] = await Promise.all([bRes.json(), cRes.json()]);
      setBrands(bData.brands ?? []);
      setCategories(cData.categories ?? []);
      setLoading(false);
    })();
  }, [siteId]);

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
      className="border rounded p-4 space-y-3 max-w-lg"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);

        const title = String(fd.get("title") || "");
        const slug = String(fd.get("slug") || "");
        const sku = String(fd.get("sku") || "");
        const price = Number(fd.get("price") || 0);
        const brand_id = String(fd.get("brand_id") || "");
        const description = String(fd.get("description") || "");
        const status = String(fd.get("status") || "draft");
        const category_ids = fd.getAll("category_ids").map(String);

        await fetch(`/api/admin/products?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: product.id,
              title,
              slug: slug || undefined,
              sku: sku || undefined,
              description: description || null,
              base_price_cents: Math.round(price * 100),
              status,
              brand_id: brand_id || null,
              category_ids,
              store_id: storeId || undefined,
            }),
          }
        );

        window.location.href = `/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
      }}
    >
      <input
        name="title"
        className="border p-2 rounded w-full"
        placeholder="Title"
        defaultValue={product.title || ""}
        required
      />
      <select
        name="brand_id"
        className="border p-2 rounded w-full"
        defaultValue={product.brand_id || ""}
      >
        <option value="">(No brand)</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        name="category_ids"
        className="border p-2 rounded w-full"
        multiple
        defaultValue={product.category_ids || []}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <textarea
        name="description"
        className="border p-2 rounded w-full"
        placeholder="Description"
        defaultValue={product.description || ""}
      />
      <input
        name="slug"
        className="border p-2 rounded w-full"
        placeholder="Slug (optional)"
        defaultValue={product.slug || ""}
      />
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
        placeholder="Price (e.g. 99.99)"
        defaultValue={Number(product.base_price_cents || 0) / 100}
        required
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
