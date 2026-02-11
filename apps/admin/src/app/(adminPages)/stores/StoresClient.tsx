"use client";

import { useEffect, useState } from "react";
import StoreActionsClient from "./storeActionsClient";

type Tab = "active" | "archived";

export default function StoresClient({ siteId }: { siteId: string }) {
  const [tab, setTab] = useState<Tab>("active");
  const [stores, setStores] = useState<any[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [switchingStoreId, setSwitchingStoreId] = useState<string>("");

  async function fetchList() {
    setLoading(true);
    const res = await fetch(`/api/admin/stores?site_id=${encodeURIComponent(siteId)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    const list = data.stores ?? [];
    const archived = list.filter((s: any) => s.status === "archived");
    setArchivedCount(archived.length);
    setStores(tab === "archived" ? archived : list.filter((s: any) => s.status !== "archived"));
    setLoading(false);
  }

  useEffect(() => {
    fetchList();
  }, [siteId, tab]);

  async function openStoreCatalog(storeId: string) {
    setSwitchingStoreId(storeId);
    window.location.href = `/products?site_id=${encodeURIComponent(siteId)}&catalog_id=${encodeURIComponent(storeId)}`;
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
            Active
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "archived"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              Archived
              {archivedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
                  {archivedCount}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="border rounded p-4 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : stores.length === 0 ? (
        <div className="border rounded p-4 text-sm text-muted-foreground">
          No stores.
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          {stores.map((s: any) => (
            <div
              key={s.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm opacity-70">
                  Type: {s.store_type} · Status: {s.status} · ID: {s.id}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-black text-white disabled:opacity-60"
                  onClick={() => openStoreCatalog(s.id)}
                  disabled={switchingStoreId === s.id}
                >
                  {switchingStoreId === s.id
                    ? "Opening..."
                    : "Manage Catalog"}
                </button>
                <StoreActionsClient
                  siteId={siteId}
                  storeId={s.id}
                  status={s.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
