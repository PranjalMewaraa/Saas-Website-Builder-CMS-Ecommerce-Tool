"use client";

import { useEffect, useState } from "react";
import StoreActionsClient from "./storeActionsClient";

type Tab = "active" | "archived";

type Store = {
  id: string;
  name: string;
  store_type: string;
  status: string;
};

export default function StoresClient({ siteId }: { siteId: string }) {
  const [tab, setTab] = useState<Tab>("active");
  const [stores, setStores] = useState<Store[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [switchingStoreId, setSwitchingStoreId] = useState<string>("");

  async function fetchStores() {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/stores?site_id=${encodeURIComponent(siteId)}`,
        {
          cache: "no-store",
        },
      );
      if (!res.ok) throw new Error("Failed to load stores");
      const data = await res.json();
      const allStores: Store[] = data.stores ?? [];

      const archived = allStores.filter((s) => s.status === "archived");
      setArchivedCount(archived.length);

      const filtered =
        tab === "archived"
          ? archived
          : allStores.filter((s) => s.status !== "archived");

      setStores(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStores();
  }, [siteId, tab]);

  const handleOpenCatalog = (storeId: string) => {
    setSwitchingStoreId(storeId);
    window.location.href = `/products?site_id=${encodeURIComponent(siteId)}&catalog_id=${encodeURIComponent(storeId)}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Stores
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            Manage product catalogs and inventory logistics.
          </p>
        </div>

        <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab("active")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === "active"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              tab === "archived"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Archived
            {archivedCount > 0 && (
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px]">
                {archivedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100"
            />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
          <p className="text-gray-400 font-medium">
            No stores found in this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => {
            const isSwitching = switchingStoreId === store.id;
            const isArchived = store.status === "archived";

            return (
              <div
                key={store.id}
                className={`group relative bg-white border border-gray-200 rounded-2xl p-5 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 ${
                  isArchived ? "bg-gray-50/50 opacity-80" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Info Section */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                      {store.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {store.name}
                        </h3>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                            isArchived
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}
                        >
                          {store.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-medium">
                          {store.store_type}
                        </span>
                        <span className="hidden sm:inline text-gray-300">
                          •
                        </span>
                        <span className="text-xs text-gray-400 truncate max-w-[150px]">
                          Ref: {store.id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-3 ml-auto lg:ml-0">
                    <button
                      onClick={() => handleOpenCatalog(store.id)}
                      disabled={isSwitching}
                      className={`
                        relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                        ${
                          isSwitching
                            ? "bg-gray-100 text-gray-400 cursor-wait"
                            : "bg-gray-900 text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        }
                      `}
                    >
                      {isSwitching ? (
                        <>
                          <div className="h-3 w-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                          Opening...
                        </>
                      ) : (
                        "Catalog"
                      )}
                    </button>

                    <div className="h-9 w-px bg-gray-100 mx-1 hidden sm:block" />

                    <StoreActionsClient
                      siteId={siteId}
                      storeId={store.id}
                      status={store.status}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
