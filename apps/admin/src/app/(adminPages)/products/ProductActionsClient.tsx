"use client";

import { useState } from "react";
import Link from "next/link";
import { useUI } from "@/app/_components/ui/UiProvider";

export default function ProductActionsClient({
  siteId,
  storeId,
  catalogId,
  productId,
  status,
}: {
  siteId: string;
  storeId: string;
  catalogId?: string;
  productId: string;
  status: "draft" | "active" | "archived";
}) {
  const { confirm, toast } = useUI();
  const [busy, setBusy] = useState(false);

  async function archiveProduct() {
    const ok = await confirm({
      title: "Archive product?",
      description: "It will be hidden from listings.",
      confirmText: "Archive",
      tone: "danger",
    });
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
    const ok = await confirm({
      title: "Delete product?",
      description: "This cannot be undone.",
      confirmText: "Delete",
      tone: "danger",
    });
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
        href={
          catalogId
            ? `/products/${encodeURIComponent(productId)}?site_id=${encodeURIComponent(siteId)}&catalog_id=${encodeURIComponent(catalogId)}`
            : `/products/${encodeURIComponent(productId)}?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`
        }
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
            const ok = await confirm({
              title: "Restore product?",
              description: "Restore this product to Draft.",
              confirmText: "Restore",
            });
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
