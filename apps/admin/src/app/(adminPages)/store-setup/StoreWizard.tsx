"use client";

import { useState } from "react";

export default function StoreWizard({ siteId }: { siteId: string }) {
  const [step, setStep] = useState(1);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [industry, setIndustry] = useState("fashion");

  async function next() {
    setStep((s) => s + 1);
  }

  async function createStore(type: string, name: string) {
    const r = await fetch("/api/admin/store-setup/create-store", {
      method: "POST",
      body: JSON.stringify({ store_type: type, name }),
    });
    const d = await r.json();
    setStoreId(d.store_id);
    next();
  }

  async function createBrand(name: string) {
    await fetch("/api/admin/store-setup/create-brand", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    next();
  }

  async function createCategory(name: string) {
    await fetch("/api/admin/store-setup/create-category", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    next();
  }

  async function setupAttributes() {
    await fetch("/api/admin/store-setup/setup-attributes", {
      method: "POST",
      body: JSON.stringify({ industry }),
    });
    next();
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Store Setup Wizard</h1>

      {step === 1 && (
        <div>
          <h2>Choose Store Type</h2>
          <button onClick={() => createStore("brand", "My Brand Store")}>
            Brand Store
          </button>
          <button
            onClick={() => createStore("distributor", "My Distributor Store")}
          >
            Distributor
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Create Brand</h2>
          <button onClick={() => createBrand("My Brand")}>
            Create Default Brand
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Create Category</h2>
          <button onClick={() => createCategory("General")}>
            Create Default Category
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Select Industry</h2>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="grocery">Grocery</option>
          </select>
          <button onClick={setupAttributes}>Setup Attributes</button>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2>Done</h2>
          <p>Your store is ready.</p>
          <a href={`/content/stores?site_id=${siteId}`}>Go to My Store</a>
        </div>
      )}
    </div>
  );
}
