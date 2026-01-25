"use client";

import { INDUSTRY_TEMPLATES } from "@acme/db-mysql/industryTemplate";
import { useEffect, useState } from "react";

export default function ProductWizard({ siteId }: { siteId: string }) {
  const [step, setStep] = useState(1);

  const [attributes, setAttributes] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [storeIndustry, setStoreIndustry] = useState<string | null>(null);

  const [storeId, setStoreId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [variants, setVariants] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  /* Load stores + attributes */
  useEffect(() => {
    async function load() {
      const [attrRes, storeRes] = await Promise.all([
        fetch("/api/admin/attributes"),
        fetch("/api/admin/stores"),
      ]);

      const attrData = await attrRes.json();
      const storeData = await storeRes.json();

      setAttributes(attrData.attributes || []);
      setStores(storeData.stores || []);
      setLoading(false);
    }

    load();
  }, []);

  /* Filter attributes by industry template */
  const filteredAttributes = (() => {
    if (!storeIndustry) return [];
    const template = INDUSTRY_TEMPLATES[storeIndustry];
    if (!template) return [];
    const allowedCodes = new Set(template.map((t: any) => t.code));
    return attributes.filter((attr) => allowedCodes.has(attr.code));
  })();

  function getTemplateField(code: string) {
    if (!storeIndustry) return null;
    const template = INDUSTRY_TEMPLATES[storeIndustry];
    if (!template) return null;
    return template.find((t: any) => t.code === code) || null;
  }

  function renderAttributeInput(attr: any) {
    const templateField = getTemplateField(attr.code);
    const type = templateField?.type || attr.type || "text";
    const options = templateField?.options || [];
    const value = attrValues[attr.id] ?? "";

    switch (type) {
      case "select":
        return (
          <select
            className="border p-2 rounded w-full"
            value={value}
            onChange={(e) =>
              setAttrValues((prev) => ({
                ...prev,
                [attr.id]: e.target.value,
              }))
            }
          >
            <option value="">Select {attr.name}</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) =>
                setAttrValues((prev) => ({
                  ...prev,
                  [attr.id]: e.target.checked,
                }))
              }
            />
            <span>Yes</span>
          </label>
        );

      case "number":
        return (
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={value}
            onChange={(e) =>
              setAttrValues((prev) => ({
                ...prev,
                [attr.id]: Number(e.target.value),
              }))
            }
          />
        );

      case "date":
        return (
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={value}
            onChange={(e) =>
              setAttrValues((prev) => ({
                ...prev,
                [attr.id]: e.target.value,
              }))
            }
          />
        );

      default:
        return (
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={value}
            onChange={(e) =>
              setAttrValues((prev) => ({
                ...prev,
                [attr.id]: e.target.value,
              }))
            }
          />
        );
    }
  }

  async function createProduct() {
    await fetch("/api/admin/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_id: siteId,
        store_id: storeId,
        title,
        base_price_cents: price,
        category_ids: [],
        attributes: Object.entries(attrValues).map(([attribute_id, value]) => ({
          attribute_id,
          value,
        })),
        variants,
      }),
    });

    alert("Product created!");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Product</h1>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <h2>Select Store</h2>

          <select
            className="border p-2 rounded w-full"
            value={storeId}
            onChange={(e) => {
              const id = e.target.value;
              setStoreId(id);
              const store = stores.find((s) => s.id === id);
              setStoreIndustry(store?.industry || null);
            }}
          >
            <option value="">Choose</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            disabled={!storeId}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <h2>Product Info</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Price (cents)"
            type="number"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setStep(3)}
          >
            Next
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <h2>Attributes</h2>

          {filteredAttributes.map((attr) => (
            <div key={attr.id} className="space-y-1">
              <label className="font-medium">{attr.name}</label>
              {renderAttributeInput(attr)}
            </div>
          ))}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setStep(4)}
          >
            Next
          </button>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <h2>Variants</h2>

          <button
            className="bg-gray-700 text-white px-4 py-2 rounded"
            onClick={() =>
              setVariants((v) => [
                ...v,
                {
                  sku: "",
                  price_cents: price,
                  inventory_qty: 0,
                  attributes: [],
                },
              ])
            }
          >
            Add Variant
          </button>

          {variants.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="border p-2 rounded"
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => {
                  const copy = [...variants];
                  copy[i] = { ...copy[i], sku: e.target.value };
                  setVariants(copy);
                }}
              />

              <input
                className="border p-2 rounded"
                placeholder="Qty"
                type="number"
                value={v.inventory_qty}
                onChange={(e) => {
                  const copy = [...variants];
                  copy[i] = {
                    ...copy[i],
                    inventory_qty: +e.target.value,
                  };
                  setVariants(copy);
                }}
              />
            </div>
          ))}

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={createProduct}
          >
            Create Product
          </button>
        </div>
      )}
    </div>
  );
}
