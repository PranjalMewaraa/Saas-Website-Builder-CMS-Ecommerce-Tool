"use client";

import { useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { useRouter, useSearchParams } from "next/navigation";

export default function BrandCreateClient({
  siteId,
  storeId,
  storeType,
  initialBrands,
  stores,
}: {
  siteId: string;
  storeId: string;
  storeType: "brand" | "distributor";
  initialBrands: any[];
  stores: Array<{ id: string; name: string; store_type: string }>;
}) {
  const { toast } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [brands, setBrands] = useState<any[]>(initialBrands || []);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const primaryBrandCount = brands.filter((b) => b.type === "brand").length;
  const limitReached = storeType === "brand" && primaryBrandCount >= 1;
  const derivedType = storeType === "brand" ? "brand" : "distributor";

  async function refresh() {
    if (!storeId) return;
    const res = await fetch(
      `/api/admin/v2/brands?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) setBrands(data.brands || []);
  }

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-white space-y-2">
        <div className="text-sm font-medium">Select Store</div>
        <select
          className="border p-2 rounded w-full"
          value={storeId}
          onChange={(e) => {
            const nextStoreId = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            params.set("site_id", siteId);
            if (nextStoreId) params.set("store_id", nextStoreId);
            router.replace(`/brands?${params.toString()}`);
          }}
        >
          <option value="">Select a store</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.store_type})
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded p-4 bg-white">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!storeId) return;
            if (limitReached) {
              toast({
                variant: "error",
                title: "Limit reached",
                description: "Brand store supports only one primary brand.",
              });
              return;
            }
            setLoading(true);
            const res = await fetch("/api/admin/store-setup/create-brand", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                site_id: siteId,
                store_id: storeId,
                name: name.trim(),
                type: derivedType,
              }),
            });
            const data = await res.json().catch(() => ({}));
            setLoading(false);
            if (!res.ok) {
              toast({
                variant: "error",
                title: "Failed",
                description: data?.error || "Could not create brand",
              });
              return;
            }
            setName("");
            await refresh();
            toast({ variant: "success", title: "Saved" });
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brand / Distributor name"
              className="border p-2 rounded md:col-span-3"
              required
            />
            <button
              className="bg-black text-white px-3 rounded disabled:opacity-50"
              disabled={loading || !name.trim() || !storeId || limitReached}
            >
              Add
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Store type: <b>{storeType}</b> · Created entity type:{" "}
            <b>{derivedType}</b>
            {storeType === "brand" ? " · One primary brand allowed." : ""}
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {brands.map((b: any) => (
          <div
            key={b.id}
            className="border rounded p-3 flex justify-between items-center bg-white"
          >
            <div>
              <div className="font-medium">{b.name}</div>
              <div className="text-xs opacity-70">{b.type || "brand"}</div>
            </div>
          </div>
        ))}
        {brands.length === 0 ? (
          <div className="opacity-70 text-sm">No brands yet.</div>
        ) : null}
      </div>
    </div>
  );
}
