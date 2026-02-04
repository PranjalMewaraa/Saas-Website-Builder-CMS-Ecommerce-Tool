"use client";

import ProductWizard from "@/app/_components/ProductWizard";
import { INDUSTRY_TEMPLATES } from "@acme/db-mysql/industryTemplate";
import Link from "next/link";
import { useState } from "react";

// Import the templates

// ↑ Adjust the import path to wherever you placed the INDUSTRY_TEMPLATES file

export default function StoreWizard({ siteId }: { siteId: string }) {
  const [step, setStep] = useState(1);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [industry, setIndustry] = useState("fashion");
  const [storeName, setStoreName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // Get the attribute templates for the selected industry
  const industryAttributes =
    INDUSTRY_TEMPLATES[industry as keyof typeof INDUSTRY_TEMPLATES] || [];

  async function next() {
    setStep((s) => s + 1);
  }

  async function createStore(type: string, name: string, industry: string) {
    try {
      const r = await fetch("/api/admin/store-setup/create-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
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
    try {
      const res = await fetch("/api/admin/store-setup/create-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, site_id: siteId }),
      });

      if (!res.ok) throw new Error("Brand creation failed");
      next();
    } catch (err) {
      console.error(err);
      alert("Failed to create brand");
    }
  }

  async function createCategory(name: string) {
    try {
      const res = await fetch("/api/admin/store-setup/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, site_id: siteId }),
      });

      if (!res.ok) throw new Error("Category creation failed");
      next();
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
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
            <option value="shoes">Shoes</option>
            <option value="jewelry">Jewelry</option>
            <option value="sports_outdoor">Sports & Outdoor</option>
            <option value="furniture_home_decor">Furniture & Home Decor</option>
            <option value="bags_luggage">Bags & Luggage</option>
            <option value="electronics">Electronics</option>
            <option value="mobile_phones">Mobile Phones</option>
            <option value="grocery">Grocery</option>
            <option value="beauty_personal_care">Beauty & Personal Care</option>
            <option value="home_kitchen">Home & Kitchen</option>
            <option value="toys_games">Toys & Games</option>
            <option value="books">Books</option>
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

      {/* STEP 4 - DONE + ProductWizard with industry templates */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Done!</h2>
            <p className="text-gray-700">
              Your {industry} store is ready.
              {industryAttributes.length > 0 && (
                <>
                  {" "}
                  We prepared {industryAttributes.length} common attributes for
                  you (size, color, material, etc.).
                </>
              )}
            </p>

            {/* Optional: show preview of attributes */}
            {industryAttributes.length > 0 && (
              <div className="border rounded p-4 bg-gray-50 text-sm">
                <p className="font-medium mb-2">
                  Recommended attributes for {industry}:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {industryAttributes.map((attr) => (
                    <li key={attr.code}>
                      <span className="font-medium">{attr.name}</span>
                      {" • "}
                      {attr.type}
                      {attr.is_variant && (
                        <span className="text-blue-600"> • variant</span>
                      )}
                      {attr.is_filterable && (
                        <span className="text-green-600"> • filter</span>
                      )}
                      {attr.options && <> • {attr.options.length} options</>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Link className="py-3 px-6 bg-blue-400 text-white" href={"/products"}>
            Create Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
