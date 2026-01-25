"use client";

import ProductWizard from "@/app/_components/ProductWizard";
import { useState } from "react";

export default function StoreWizard({ siteId }: { siteId: string }) {
  const [step, setStep] = useState(1);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [industry, setIndustry] = useState("fashion");
  const [storeName, setStoreName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");

  async function next() {
    setStep((s) => s + 1);
  }

  async function createStore(type: string, name: string, industry: string) {
    try {
      const r = await fetch("/api/admin/store-setup/create-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_type: type,
          name,
          industry,
        }),
      });

      if (!r.ok) throw new Error("Failed to create store");

      const d = await r.json();
      setStoreId(d.store_id);
      next();
    } catch (err) {
      console.error("createStore failed:", err);
      alert("Failed to create store. Check console.");
    }
  }

  async function createBrand(name: string) {
    await fetch("/api/admin/store-setup/create-brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    next();
  }

  async function createCategory(name: string) {
    await fetch("/api/admin/store-setup/create-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    next();
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Store Setup Wizard</h1>

      {/* STEP 1 - STORE + INDUSTRY */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create Store</h2>

          <input
            type="text"
            placeholder="Enter store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="grocery">Grocery</option>
          </select>

          <div className="flex gap-4">
            <button
              disabled={!storeName.trim()}
              onClick={() => createStore("brand", storeName, industry)}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Brand Store
            </button>

            <button
              disabled={!storeName.trim()}
              onClick={() => createStore("distributor", storeName, industry)}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Distributor Store
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 - BRAND */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create Brand</h2>

          <input
            type="text"
            placeholder="Enter brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

          <button
            disabled={!brandName.trim()}
            onClick={() => createBrand(brandName)}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            Create Brand
          </button>
        </div>
      )}

      {/* STEP 3 - CATEGORY */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create Category</h2>

          <input
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

          <button
            disabled={!categoryName.trim()}
            onClick={() => createCategory(categoryName)}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
          >
            Create Category
          </button>
        </div>
      )}

      {/* STEP 4 - DONE */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Done</h2>
          <p>Your store is ready.</p>
          <ProductWizard siteId={siteId} />
        </div>
      )}
    </div>
  );
}
