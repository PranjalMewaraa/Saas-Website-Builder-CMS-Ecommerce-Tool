"use client";

import { useState } from "react";

export default function MainStoreSelector({
  siteId,
  stores,
  currentStoreId,
}: {
  siteId: string;
  stores: any[];
  currentStoreId: string;
}) {
  const [value, setValue] = useState(currentStoreId);
  const [saving, setSaving] = useState(false);

  async function save(storeId: string) {
    if (saving || storeId === value) return;
    setSaving(true);
    setValue(storeId);

    try {
      await fetch("/api/admin/sites/set-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, store_id: storeId }),
      });
    } catch (err) {
      console.error(err);
      setValue(currentStoreId);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inline-flex flex-col min-w-[320px] max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Ultra-compact Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Set Main Store
        </span>
        {saving && (
          <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* List of Options */}
      <div className="p-1.5 space-y-1">
        {stores.map((store) => {
          const isSelected = value === store.id;
          return (
            <button
              key={store.id}
              onClick={() => save(store.id)}
              disabled={saving}
              className={`
                w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all
                ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
                    : "hover:bg-gray-50 text-gray-600"
                }
              `}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-blue-500" : "bg-gray-300"}`}
                />
                <span className="text-sm font-medium truncate">
                  {store.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-normal">
                  {store.store_type}
                </span>
              </div>

              {isSelected && (
                <svg
                  className="h-3.5 w-3.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
