"use client";

export default function ProductCreateClient({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
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

        await fetch(
          `/api/admin/products?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              slug: slug || undefined,
              sku: sku || undefined,
              base_price_cents: Math.round(price * 100),
              status: "active",
            }),
          }
        );

        // After create, redirect back to product list
        window.location.href = `/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
      }}
    >
      <input
        name="title"
        className="border p-2 rounded w-full"
        placeholder="Title"
        required
      />
      <input
        name="slug"
        className="border p-2 rounded w-full"
        placeholder="Slug (optional)"
      />
      <input
        name="sku"
        className="border p-2 rounded w-full"
        placeholder="SKU (optional)"
      />
      <input
        name="price"
        type="number"
        step="0.01"
        className="border p-2 rounded w-full"
        placeholder="Price (e.g. 99.99)"
        required
      />
      <button className="bg-black text-white px-3 py-2 rounded">Create</button>
    </form>
  );
}
