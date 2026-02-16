"use client";

import { useEffect, useState, useCallback } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";

type InventoryItem = {
  product_id: string;
  variant_id?: string;
  title: string;
  sku?: string;
  product_sku?: string;
  variant_sku?: string;
  variant_options_json?: unknown;
  inventory_qty: number | string;
};

export default function InventoryManagementClient({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
  const { toast } = useUI();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track pending changes
  const [changes, setChanges] = useState<Record<string, number>>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchInventory = useCallback(
    async (search: string) => {
      if (!siteId || !storeId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/v2/inventory?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&q=${encodeURIComponent(search)}`,
          { cache: "no-store" },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load inventory");
        }

        setItems(data.items || []);
      } catch (err: any) {
        setError(err.message || "Could not load inventory");
        toast({
          variant: "error",
          title: "Error",
          description: err.message || "Failed to load inventory",
        });
      } finally {
        setLoading(false);
      }
    },
    [siteId, storeId, toast],
  );

  useEffect(() => {
    fetchInventory(debouncedQuery);
  }, [debouncedQuery, fetchInventory]);

  // Initial load
  useEffect(() => {
    if (siteId && storeId) {
      fetchInventory("");
    }
  }, [siteId, storeId, fetchInventory]);

  const getRowKey = (item: InventoryItem) => item.variant_id || item.product_id;

  const updateDelta = (key: string, value: number) => {
    setChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyChange = async (item: InventoryItem) => {
    const key = getRowKey(item);
    const delta = changes[key] ?? 0;

    if (delta === 0) return;

    // Optional: warn on large changes
    if (Math.abs(delta) > 100) {
      if (
        !confirm(
          `Apply large change of ${delta > 0 ? "+" : ""}${delta} to ${item.title}?`,
        )
      ) {
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/v2/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          store_id: storeId,
          product_id: item.product_id,
          variant_id: item.variant_id,
          delta_quantity: delta,
          change_type: delta > 0 ? "restock" : "manual_adjustment",
          reason:
            delta > 0
              ? "Restock from Manage/Inventory"
              : "Manual adjustment / correction",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Update failed");

      toast({
        variant: "success",
        title: "Updated",
        description: `${Math.abs(delta)} unit${Math.abs(delta) !== 1 ? "s" : ""} ${delta > 0 ? "added" : "removed"}`,
      });

      // Clear change & refresh
      setChanges((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      fetchInventory(debouncedQuery);
    } catch (err: any) {
      toast({
        variant: "error",
        title: "Failed to update",
        description: err.message || "Unknown error",
      });
    }
  };

  const isDirty = Object.keys(changes).length > 0;

  if (!siteId || !storeId) {
    return (
      <div className="p-6 text-center text-gray-500">
        Please select a site and store to manage inventory.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Update stock levels for the currently active store
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm">
        <div className="font-medium text-blue-800 mb-1">
          How to adjust stock:
        </div>
        <ul className="text-blue-700 space-y-0.5 text-xs leading-relaxed">
          <li>
            • Enter <span className="font-bold text-green-700">+number</span> to
            add stock (restock)
          </li>
          <li>
            • Enter <span className="font-bold text-red-700">-number</span> to
            remove stock (damage, loss, sale correction)
          </li>
          <li>
            • Click <span className="font-medium">Apply</span> to save the
            change
          </li>
        </ul>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchInventory(query)}
            placeholder="Search by product name or SKU..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => fetchInventory(query)}
          disabled={loading}
          className={`
            px-5 py-2.5 rounded-lg font-medium text-sm transition
            ${
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }
          `}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Adjustment
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No products found {query ? `for "${query}"` : ""}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const key = getRowKey(item);
                  const delta = changes[key] ?? 0;
                  const hasChange = delta !== 0;

                  return (
                    <tr
                      key={key}
                      className={`
                        hover:bg-blue-50/40 transition-colors
                        ${hasChange ? "bg-yellow-50/60" : ""}
                      `}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <VariantInfo item={item} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.variant_sku || item.sku || item.product_sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {Number(item.inventory_qty) || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={delta}
                            onChange={(e) =>
                              updateDelta(key, Number(e.target.value))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") applyChange(item);
                            }}
                            step="1"
                            className={`
                              w-28 rounded border px-3 py-1.5 text-center text-sm
                              focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none
                              ${
                                delta > 0
                                  ? "border-green-400 bg-green-50"
                                  : delta < 0
                                    ? "border-red-400 bg-red-50"
                                    : "border-gray-300"
                              }
                            `}
                          />
                          {hasChange && (
                            <span className="text-xs font-medium whitespace-nowrap">
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => applyChange(item)}
                          disabled={!hasChange}
                          className={`
                            px-4 py-1.5 rounded-md text-sm font-medium transition
                            ${
                              hasChange
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }
                          `}
                        >
                          Apply
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer hint */}
      {isDirty && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          You have unsaved changes. Click <strong>Apply</strong> on each row to
          save.
        </div>
      )}
    </div>
  );
}

function VariantInfo({ item }: { item: InventoryItem }) {
  const raw = item.variant_options_json;
  if (raw == null || raw === "") {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
        Default
      </span>
    );
  }

  try {
    const parsed =
      typeof raw === "string"
        ? JSON.parse(raw)
        : typeof raw === "object"
          ? raw
          : null;
    const pairs =
      parsed && typeof parsed === "object"
        ? Object.entries(parsed as Record<string, unknown>)
            .map(([k, v]) => ({ k: humanize(k), v: String(v ?? "").trim() }))
            .filter(({ k, v }) => !!k && !!v && v.toLowerCase() !== "default")
            .map(({ k, v }) => `${k}: ${v}`)
            .filter(Boolean)
        : [];

    if (!pairs.length) {
      return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
          {item.variant_id ? `Variant ${String(item.variant_id).slice(-6)}` : "Default"}
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {pairs.map((label) => (
          <span
            key={label}
            className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
          >
            {label}
          </span>
        ))}
      </div>
    );
  } catch {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
        {item.variant_id ? `Variant ${String(item.variant_id).slice(-6)}` : "Default"}
      </span>
    );
  }
}

function humanize(input: string) {
  return String(input || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
