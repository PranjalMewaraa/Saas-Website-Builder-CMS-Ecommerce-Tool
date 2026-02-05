"use client";

import { useEffect, useMemo, useState } from "react";
import ProductPublishToggleClient from "./ProductPublishToggleClient";
import ProductActionsClient from "./ProductActionsClient";

type Tab = "active" | "archived";

export default function ProductsClient({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function fetchList() {
    setLoading(true);
    const url =
      tab === "archived"
        ? `/api/admin/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&status=archived`
        : `/api/admin/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const list = data.products ?? [];
    setProducts(tab === "archived" ? list : list.filter((p: any) => p.status !== "archived"));
    setSelected({});
    setLoading(false);
  }

  useEffect(() => {
    fetchList();
  }, [siteId, storeId, tab]);

  const allSelected = useMemo(() => {
    if (!products.length) return false;
    return products.every((p) => selected[p.id]);
  }, [products, selected]);

  const selectedIds = useMemo(
    () => products.filter((p) => selected[p.id]).map((p) => p.id),
    [products, selected],
  );

  async function bulk(action: "archive" | "restore" | "delete") {
    if (!selectedIds.length) return;
    const ok =
      action === "delete"
        ? confirm("Permanently delete selected products?")
        : action === "archive"
          ? confirm("Archive selected products?")
          : confirm("Restore selected products to Draft?");
    if (!ok) return;

    await fetch(`/api/admin/products/bulk?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, product_ids: selectedIds }),
      }
    );
    await fetchList();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "active"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Active / Draft
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "archived"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Archived
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            {tab === "active" ? (
              <button
                className="px-3 py-2 rounded border text-sm"
                onClick={() => bulk("archive")}
              >
                Archive Selected
              </button>
            ) : (
              <button
                className="px-3 py-2 rounded border text-sm"
                onClick={() => bulk("restore")}
              >
                Restore Selected
              </button>
            )}
            <button
              className="px-3 py-2 rounded border border-red-200 text-red-600 text-sm"
              onClick={() => bulk("delete")}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="border rounded p-4 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : products.length === 0 ? (
        <div className="border rounded p-4 text-sm text-muted-foreground">
          No products.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                const next: Record<string, boolean> = {};
                for (const p of products) next[p.id] = e.target.checked;
                setSelected(next);
              }}
            />
            Select all
          </div>

          {products.map((p: any) => (
            <div
              key={p.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!selected[p.id]}
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [p.id]: e.target.checked,
                    }))
                  }
                />
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm opacity-70">
                    {p.slug} · ${Number(p.base_price_cents / 100).toFixed(2)} ·{" "}
                    {p.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tab === "active" && (
                  <ProductPublishToggleClient
                    siteId={siteId}
                    storeId={storeId}
                    productId={p.id}
                    isPublished={!!p.is_published}
                  />
                )}
                <ProductActionsClient
                  siteId={siteId}
                  storeId={storeId}
                  productId={p.id}
                  status={p.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
