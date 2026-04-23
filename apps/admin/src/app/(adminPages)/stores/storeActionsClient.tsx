"use client";

import { useState } from "react";

export default function StoreActionsClient({
  siteId,
  storeId,
  status,
}: {
  siteId: string;
  storeId: string;
  status: "active" | "suspended" | "archived";
}) {
  const [busy, setBusy] = useState(false);

  async function setStatus(next: "active" | "suspended" | "archived") {
    setBusy(true);
    await fetch(`/api/admin/stores?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_id: storeId, status: next }),
    });
    setBusy(false);
    window.location.reload();
  }

  async function hardDelete() {
    const ok = confirm(
      "Permanently delete this store? This will remove store mappings, products links, and orders for this store. This cannot be undone.",
    );
    if (!ok) return;
    setBusy(true);
    await fetch(
      `/api/admin/stores?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
      { method: "DELETE" },
    );
    setBusy(false);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      {status === "active" ? (
        <button
          className="px-3 py-2 rounded border text-sm"
          disabled={busy}
          onClick={() => setStatus("archived")}
        >
          Archive
        </button>
      ) : (
        <button
          className="px-3 py-2 rounded border text-sm"
          disabled={busy}
          onClick={() => setStatus("active")}
        >
          Restore
        </button>
      )}
      <button
        className="px-3 py-2 rounded border border-red-200 text-red-600 text-sm"
        disabled={busy}
        onClick={hardDelete}
      >
        Delete
      </button>
    </div>
  );
}
