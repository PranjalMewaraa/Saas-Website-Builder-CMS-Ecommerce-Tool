"use client";

import { useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Store, Tag, Info, Loader2 } from "lucide-react"; // Assuming lucide-react for icons

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
    <div className="w-full mx-auto space-y-8 p-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Store Selector - Styled as a floating card */}
        <div className="relative group min-w-60">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative flex items-center bg-white border border-slate-200/80 rounded-xl px-3 py-1 shadow-sm">
            <Store className="w-4 h-4 text-slate-400 mr-2" />
            <select
              className="bg-transparent text-sm font-medium py-2 focus:outline-none w-full cursor-pointer appearance-none"
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
        </div>
      </div>

      {/* Input Section - Apple Glass style */}
      <section className="relative overflow-hidden bg-white/60 backdrop-blur-md border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 transition-all">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!storeId || limitReached) return;
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
            toast({ variant: "success", title: "Saved successfully" });
          }}
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter brand or distributor name..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                required
              />
            </div>
            <button
              className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95"
              disabled={loading || !name.trim() || !storeId || limitReached}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Entity
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>
              Store: <span className="text-slate-700">{storeType}</span>
            </span>
            <span className="mx-1 opacity-30">|</span>
            <span>
              Policy:{" "}
              <span className="text-slate-700">
                {storeType === "brand" ? "Single Entry Only" : "Unlimited"}
              </span>
            </span>
          </div>
        </form>
      </section>

      {/* Brands List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {brands.map((b: any) => (
          <div
            key={b.id}
            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                {b.type === "brand" ? (
                  <Tag className="w-5 h-5" />
                ) : (
                  <Store className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {b.name}
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  {b.type || "brand"}
                </div>
              </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
        ))}

        {brands.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-60">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Plus className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              No entities found for this store.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
