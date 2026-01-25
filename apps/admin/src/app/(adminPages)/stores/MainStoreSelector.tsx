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
    setSaving(true);
    setValue(storeId);

    await fetch("/api/admin/sites/set-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_id: siteId,
        store_id: storeId,
      }),
    });

    setSaving(false);
  }

  return (
    <div className="border rounded p-4 bg-gray-50 space-y-2">
      <div className="font-medium">Main Store for this Site</div>

      <select
        className="border p-2 rounded w-full max-w-md"
        value={value}
        onChange={(e) => save(e.target.value)}
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.store_type})
          </option>
        ))}
      </select>

      {saving && <div className="text-sm text-gray-500">Saving...</div>}
    </div>
  );
}
