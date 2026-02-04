"use client";

import { INDUSTRY_TEMPLATES } from "@acme/db-mysql/industryTemplate";
import { useEffect, useMemo, useState } from "react";

type Attribute = {
  id: string;
  code: string;
  name: string;
  type: string;
};

type Store = {
  id: string;
  name: string;
  industry: string | null;
};

type VariantTemplate = {
  code: string;
  name: string;
  type: string;
  is_variant: boolean;
  required?: boolean;
  options?: string[];
};

type Variant = {
  sku: string;
  price_cents: number;
  inventory_qty: number;
  attributes: { attribute_id: string; value: string | number | boolean }[];
};

type ImageInfo = {
  id: string;
  url: string;
};

type Step = 1 | 2 | 3 | 4 | 5;

interface ProductWizardProps {
  siteId: string;
}

export default function ProductWizard({ siteId }: ProductWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stores, setStores] = useState<Store[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [storeId, setStoreId] = useState<string>("");
  const [storeIndustry, setStoreIndustry] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);

  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [variants, setVariants] = useState<Variant[]>([]);

  const [productId, setProductId] = useState<string | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [uploading, setUploading] = useState(false);

  // ────────────────────────────────────────────────
  //  Data fetching
  // ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        setError(null);

        const [attrRes, storeRes] = await Promise.all([
          fetch("/api/admin/attributes"),
          fetch("/api/admin/stores"),
        ]);

        if (!attrRes.ok || !storeRes.ok) throw new Error("Failed to load data");

        const [attrData, storeData] = await Promise.all([
          attrRes.json(),
          storeRes.json(),
        ]);

        setAttributes(attrData.attributes ?? []);
        setStores(storeData.stores ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to load initial data");
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // ────────────────────────────────────────────────
  //  Derived values
  // ────────────────────────────────────────────────
  const industryTemplate = useMemo<VariantTemplate[]>(() => {
    if (!storeIndustry) return [];
    return (
      (INDUSTRY_TEMPLATES[storeIndustry as keyof typeof INDUSTRY_TEMPLATES] as
        | VariantTemplate[]
        | undefined) ?? []
    );
  }, [storeIndustry]);

  const productAttributes = useMemo(
    () => industryTemplate.filter((t) => !t.is_variant),
    [industryTemplate],
  );

  const variantTemplates = useMemo(
    () => industryTemplate.filter((t) => t.is_variant),
    [industryTemplate],
  );

  // ────────────────────────────────────────────────
  //  Handlers
  // ────────────────────────────────────────────────
  function selectStore(id: string) {
    setStoreId(id);
    const selected = stores.find((s) => s.id === id);
    setStoreIndustry(selected?.industry ?? null);
    // Reset dependent fields
    setAttrValues({});
    setVariants([]);
    setError(null);
  }

  function validateRequiredProductAttributes(): boolean {
    const missing = productAttributes
      .filter((t) => t.required)
      .filter((t) => attrValues[t.code] == null || attrValues[t.code] === "");

    if (missing.length > 0) {
      setError(
        `Required fields missing: ${missing.map((m) => m.name).join(", ")}`,
      );
      return false;
    }

    setError(null);
    return true;
  }

  function generateVariantsFromTemplates() {
    if (variantTemplates.length === 0) return;

    const optionSets = variantTemplates.map((t) => t.options ?? []);

    if (optionSets.some((opts) => opts.length === 0)) {
      setError("Some variant options are empty");
      return;
    }

    const cartesianProduct = optionSets.reduce<string[][]>(
      (acc, opts) => acc.flatMap((prev) => opts.map((val) => [...prev, val])),
      [[]],
    );

    const newVariants: Variant[] = cartesianProduct.map((combination) => {
      const attrs = combination
        .map((value, idx) => {
          const tpl = variantTemplates[idx];
          const attr = attributes.find((a) => a.code === tpl.code);
          return attr ? { attribute_id: attr.id, value } : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x);

      return {
        sku: "",
        price_cents: basePrice,
        inventory_qty: 0,
        attributes: attrs,
      };
    });

    setVariants(newVariants);
    setError(null);
  }

  async function createProductHandler() {
    if (!validateRequiredProductAttributes()) return;

    try {
      setError(null);

      const attrs = Object.entries(attrValues)
        .map(([code, value]) => {
          const attr = attributes.find((a) => a.code === code);
          return attr ? { attribute_id: attr.id, value } : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x);

      const payload = {
        site_id: siteId,
        store_id: storeId,
        title: title.trim(),
        base_price_cents: basePrice * 100, // assuming input in dollars → cents
        category_ids: [],
        attributes: attrs,
        variants,
      };

      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Product creation failed");

      const data = await res.json();
      const newProductId = data.product_id;

      setProductId(newProductId);
      setStep(5);
      await loadProductImages(newProductId);
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    }
  }

  async function uploadImage(file: File) {
    if (!productId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("file", file);

      const res = await fetch(
        `/api/admin/products/images/upload?site_id=${encodeURIComponent(siteId)}`,
        {
        method: "POST",
        body: formData,
        },
      );

      if (!res.ok) throw new Error("Image upload failed");

      await loadProductImages(productId);
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(imageId: string) {
    try {
      const res = await fetch(
        `/api/admin/products/images/delete?site_id=${encodeURIComponent(siteId)}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId }),
        },
      );

      if (!res.ok) throw new Error("Delete failed");

      if (productId) await loadProductImages(productId);
    } catch (err: any) {
      setError(err.message || "Failed to delete image");
    }
  }

  async function loadProductImages(pid: string) {
    try {
      const res = await fetch(
        `/api/admin/products/images/list?product_id=${pid}&site_id=${encodeURIComponent(siteId)}`,
      );
      if (!res.ok) throw new Error("Failed to load images");
      const data = await res.json();
      setImages(data.images ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load images");
    }
  }

  // ────────────────────────────────────────────────
  //  Render helpers
  // ────────────────────────────────────────────────
  function renderAttributeField(tpl: VariantTemplate) {
    const value = attrValues[tpl.code] ?? (tpl.type === "boolean" ? false : "");

    const handleChange = (newValue: any) => {
      setAttrValues((prev) => ({ ...prev, [tpl.code]: newValue }));
      setError(null);
    };

    return (
      <div key={tpl.code} className="space-y-1">
        <label className="block text-sm font-medium">
          {tpl.name}
          {tpl.required && <span className="text-red-600 ml-1">*</span>}
        </label>

        {tpl.type === "select" ? (
          <select
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Select...</option>
            {tpl.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : tpl.type === "boolean" ? (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(e.target.checked)}
            className="h-5 w-5"
          />
        ) : tpl.type === "number" ? (
          <input
            type="number"
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value || ""}
            onChange={(e) => handleChange(Number(e.target.value) || 0)}
          />
        ) : (
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading wizard...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-xl shadow-sm space-y-8">
      {error && step !== 5 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step 1 – Store Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Select Store</h2>
          <select
            className="border border-gray-300 rounded px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={storeId}
            onChange={(e) => selectStore(e.target.value)}
          >
            <option value="">Choose a store...</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button
              disabled={!storeId}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 – Basic Info */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">2. Product Basics</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Title <span className="text-red-600">*</span>
              </label>
              <input
                className="border border-gray-300 rounded px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Base Price <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="border border-gray-300 rounded px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="19.99"
                value={basePrice || ""}
                onChange={(e) => {
                  setBasePrice(Number(e.target.value) || 0);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              disabled={!title.trim() || basePrice <= 0}
              onClick={() => setStep(3)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 – Product Attributes */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">3. Product Attributes</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {productAttributes.map(renderAttributeField)}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => validateRequiredProductAttributes() && setStep(4)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4 – Variants */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">4. Variants</h2>

          {variantTemplates.length > 0 ? (
            <div>
              <button
                onClick={generateVariantsFromTemplates}
                className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mb-4"
              >
                Generate Variants Automatically
              </button>

              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded p-4 bg-gray-50"
                    >
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm mb-1">SKU</label>
                          <input
                            className="border rounded px-3 py-2 w-full"
                            value={variant.sku}
                            onChange={(e) => {
                              setVariants((prev) =>
                                prev.map((v, i) =>
                                  i === index
                                    ? { ...v, sku: e.target.value }
                                    : v,
                                ),
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">
                            Price (cents)
                          </label>
                          <input
                            type="number"
                            className="border rounded px-3 py-2 w-full"
                            value={variant.price_cents}
                            onChange={(e) => {
                              setVariants((prev) =>
                                prev.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        price_cents:
                                          Number(e.target.value) ||
                                          basePrice * 100,
                                      }
                                    : v,
                                ),
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Stock</label>
                          <input
                            type="number"
                            min="0"
                            className="border rounded px-3 py-2 w-full"
                            value={variant.inventory_qty}
                            onChange={(e) => {
                              setVariants((prev) =>
                                prev.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        inventory_qty:
                                          Number(e.target.value) || 0,
                                      }
                                    : v,
                                ),
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No variants generated yet. Click the button above to create
                  them.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              This product has no variant attributes.
            </p>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={createProductHandler}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Create Product
            </button>
          </div>
        </div>
      )}

      {/* Step 5 – Images */}
      {step === 5 && productId && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">5. Product Images</h2>

          <div>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = ""; // reset input
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-blue-600 mt-2">Uploading...</p>}
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt="Product"
                    className="w-full h-32 object-cover rounded border"
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No images uploaded yet.</p>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => alert("Product created successfully!")}
              className="px-8 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
