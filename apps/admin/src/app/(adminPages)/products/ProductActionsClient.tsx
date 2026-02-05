"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProductActionsClient({
  siteId,
  storeId,
  productId,
  status,
}: {
  siteId: string;
  storeId: string;
  productId: string;
  status: "draft" | "active" | "archived";
}) {
  const [busy, setBusy] = useState(false);

  async function archiveProduct() {
    const ok = confirm("Archive this product? It will be hidden from listings.");
    if (!ok) return;
    setBusy(true);
    await fetch(
      `/api/admin/products?site_id=${encodeURIComponent(siteId)}&product_id=${encodeURIComponent(productId)}&mode=soft`,
      { method: "DELETE" },
    );
    setBusy(false);
    window.location.reload();
  }

  async function hardDelete() {
    const ok = confirm(
      "Permanently delete this product? This cannot be undone.",
    );
    if (!ok) return;
    setBusy(true);
    await fetch(
      `/api/admin/products?site_id=${encodeURIComponent(siteId)}&product_id=${encodeURIComponent(productId)}&mode=hard`,
      { method: "DELETE" },
    );
    setBusy(false);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        className="px-3 py-2 rounded border text-sm"
        href={`/products/${encodeURIComponent(productId)}?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`}
      >
        Edit
      </Link>
      {status !== "archived" ? (
        <button
          className="px-3 py-2 rounded border text-sm"
          disabled={busy}
          onClick={archiveProduct}
        >
          Archive
        </button>
      ) : (
        <button
          className="px-3 py-2 rounded border text-sm"
          disabled={busy}
          onClick={async () => {
            const ok = confirm("Restore this product to Draft?");
            if (!ok) return;
            setBusy(true);
            await fetch(
              `/api/admin/products/bulk?site_id=${encodeURIComponent(siteId)}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "restore",
                  product_ids: [productId],
                }),
              },
            );
            setBusy(false);
            window.location.reload();
          }}
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
