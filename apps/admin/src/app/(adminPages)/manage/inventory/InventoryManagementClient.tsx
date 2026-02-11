"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";

export default function InventoryManagementClient({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
  const { toast } = useUI();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [delta, setDelta] = useState<Record<string, number>>({});

  function rowKey(it: any) {
    return it.variant_id || it.product_id;
  }

  async function refresh(search = q) {
    if (!siteId || !storeId) return;
    setLoading(true);
    const res = await fetch(
      `/api/admin/v2/inventory?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&q=${encodeURIComponent(search)}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast({
        variant: "error",
        title: "Failed to load inventory",
        description: data?.error || "Unknown error",
      });
      return;
    }
    setItems(data.items || []);
  }

  useEffect(() => {
    refresh("");
  }, [siteId, storeId]);

  if (!siteId || !storeId) {
    return (
      <div className="text-sm text-gray-600">
        Select `site_id` and `store_id` to manage inventory.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Inventory Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage stock for the <b>active store</b> only.
        </p>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
        `Delta` means stock change amount:
        <b> +10</b> adds 10 units, <b>-3</b> removes 3 units, <b>0</b> makes no change.
      </div>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title / SKU"
          className="border rounded p-2 w-full max-w-md"
        />
        <button
          className="px-3 py-2 border rounded"
          onClick={() => refresh(q)}
          disabled={loading}
        >
          Search
        </button>
      </div>

      <div className="border rounded overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">Product</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Current</th>
              <th className="text-left p-2">Delta</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={rowKey(it)} className="border-b">
                <td className="p-2">{it.title}</td>
                <td className="p-2">{it.sku || "-"}</td>
                <td className="p-2">{Number(it.inventory_qty || 0)}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-1 w-24"
                    value={delta[rowKey(it)] ?? 0}
                    onChange={(e) =>
                      setDelta((prev) => ({
                        ...prev,
                        [rowKey(it)]: Number(e.target.value || 0),
                      }))
                    }
                  />
                </td>
                <td className="p-2">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={async () => {
                      const d = Number(delta[rowKey(it)] ?? 0);
                      if (!d) return;
                      const res = await fetch("/api/admin/v2/inventory", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          site_id: siteId,
                          store_id: storeId,
                          product_id: it.product_id,
                          variant_id: it.variant_id,
                          delta_quantity: d,
                          change_type: d > 0 ? "restock" : "manual_adjustment",
                          reason: d > 0 ? "Restock from Manage/Inventory" : "Manual adjustment",
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        toast({
                          variant: "error",
                          title: "Inventory update failed",
                          description: data?.error || "Unknown error",
                        });
                        return;
                      }
                      toast({ variant: "success", title: "Inventory updated" });
                      setDelta((prev) => ({ ...prev, [rowKey(it)]: 0 }));
                      refresh(q);
                    }}
                  >
                    Apply
                  </button>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Use + for restock, - for shrink/damage.
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={5}>
                  No inventory rows found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
