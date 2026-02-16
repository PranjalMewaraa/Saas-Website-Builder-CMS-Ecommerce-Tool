"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";

type Preset = {
  key: string;
  label: string;
};

export default function CommerceV2Client({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
  const { toast } = useUI();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [attributes, setAttributes] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const [brandForm, setBrandForm] = useState({
    name: "",
    type: "brand",
    logo: "",
    description: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [attrForm, setAttrForm] = useState({
    code: "",
    name: "",
    type: "text",
    is_required: false,
    options: "",
  });
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    base_price_cents: 0,
    sku: "",
    inventory_quantity: 0,
    brand_id: "",
    status: "draft",
  });
  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const validStore = Boolean(siteId && storeId);

  async function refreshPresets() {
    const res = await fetch(`/api/admin/v2/store-types?site_id=${encodeURIComponent(siteId)}`);
    const data = await res.json();
    setPresets((data.presets || []).map((p: any) => ({ key: p.key, label: p.label })));
  }

  async function refreshBrands() {
    if (!validStore) return;
    const res = await fetch(
      `/api/admin/v2/brands?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
    );
    const data = await res.json();
    setBrands(data.brands || []);
  }

  async function refreshCategories() {
    if (!validStore) return;
    const res = await fetch(
      `/api/admin/v2/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
    );
    const data = await res.json();
    setCategories(data.categories || []);
    if (!categoryId && data.categories?.length) setCategoryId(data.categories[0].id);
  }

  async function refreshAttributes(nextCategoryId?: string) {
    const cid = nextCategoryId || categoryId;
    if (!validStore || !cid) return;
    const res = await fetch(
      `/api/admin/v2/category-attributes?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&category_id=${encodeURIComponent(cid)}&include_inherited=1`,
    );
    const data = await res.json();
    setAttributes(data.attributes || []);
  }

  async function refreshInventory() {
    if (!validStore) return;
    const res = await fetch(
      `/api/admin/v2/inventory?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
    );
    const data = await res.json();
    setInventory(data.items || []);
  }

  useEffect(() => {
    if (!siteId) return;
    refreshPresets();
  }, [siteId]);

  useEffect(() => {
    if (!validStore) return;
    refreshBrands();
    refreshCategories();
    refreshInventory();
  }, [validStore, siteId, storeId]);

  useEffect(() => {
    if (!categoryId) return;
    refreshAttributes(categoryId);
  }, [categoryId]);

  const attributeInputs = useMemo(() => {
    return attributes.map((a) => {
      const value = attrValues[a.code] ?? "";
      const options = a.options || [];
      if (a.type === "select") {
        return (
          <select
            key={a.id}
            className="border rounded p-2 w-full"
            value={value}
            onChange={(e) => setAttrValues((prev) => ({ ...prev, [a.code]: e.target.value }))}
          >
            <option value="">Select {a.name}</option>
            {options.map((o: any) => (
              <option key={o.id} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      }
      if (a.type === "boolean") {
        return (
          <label key={a.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) =>
                setAttrValues((prev) => ({ ...prev, [a.code]: e.target.checked }))
              }
            />
            {a.name}
          </label>
        );
      }
      return (
        <input
          key={a.id}
          className="border rounded p-2 w-full"
          placeholder={a.name}
          type={a.type === "number" ? "number" : a.type === "date" ? "date" : "text"}
          value={value}
          onChange={(e) => setAttrValues((prev) => ({ ...prev, [a.code]: e.target.value }))}
        />
      );
    });
  }, [attributes, attrValues]);

  if (!validStore) {
    return (
      <div className="border rounded p-4 text-sm text-gray-600">
        `site_id` and `store_id` are required in URL.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Commerce V2</h1>
        <div className="text-sm text-gray-500">
          Store scoped categories, attributes, strict product validation, and inventory controls.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border rounded-xl bg-white p-4 space-y-3">
          <h2 className="font-semibold">1. Apply Store Preset</h2>
          <select
            className="border rounded p-2 w-full"
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
          >
            <option value="">Choose preset</option>
            {presets.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={async () => {
              if (!selectedPreset) return;
              setLoading(true);
              const res = await fetch("/api/admin/v2/stores/seed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  site_id: siteId,
                  store_id: storeId,
                  preset: selectedPreset,
                }),
              });
              const data = await res.json();
              setLoading(false);
              if (!res.ok || !data.ok) {
                toast({ variant: "error", title: "Preset seed failed", description: data.error || "Failed" });
                return;
              }
              toast({ variant: "success", title: "Preset applied" });
              refreshCategories();
            }}
            disabled={!selectedPreset || loading}
          >
            Apply Preset
          </button>
        </section>

        <section className="border rounded-xl bg-white p-4 space-y-3">
          <h2 className="font-semibold">2. Create Brand/Distributor</h2>
          <input
            className="border rounded p-2 w-full"
            placeholder="Name"
            value={brandForm.name}
            onChange={(e) => setBrandForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="border rounded p-2 w-full"
            value={brandForm.type}
            onChange={(e) => setBrandForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="brand">Brand</option>
            <option value="distributor">Distributor</option>
          </select>
          <input
            className="border rounded p-2 w-full"
            placeholder="Logo URL"
            value={brandForm.logo}
            onChange={(e) => setBrandForm((prev) => ({ ...prev, logo: e.target.value }))}
          />
          <textarea
            className="border rounded p-2 w-full"
            placeholder="Description"
            value={brandForm.description}
            onChange={(e) => setBrandForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={async () => {
              if (!brandForm.name.trim()) return;
              const res = await fetch("/api/admin/v2/brands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  site_id: siteId,
                  store_id: storeId,
                  ...brandForm,
                }),
              });
              const data = await res.json();
              if (!res.ok || !data.ok) {
                toast({ variant: "error", title: "Brand create failed", description: data.error || "Failed" });
                return;
              }
              toast({ variant: "success", title: "Brand created" });
              setBrandForm({ name: "", type: "brand", logo: "", description: "" });
              refreshBrands();
            }}
          >
            Add Brand
          </button>
          <div className="text-xs text-gray-500">
            {brands.length} brands/distributors configured.
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border rounded-xl bg-white p-4 space-y-3">
          <h2 className="font-semibold">3. Categories</h2>
          <input
            className="border rounded p-2 w-full"
            placeholder="Category name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="border rounded p-2 w-full"
            placeholder="Slug (optional)"
            value={categoryForm.slug}
            onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={async () => {
              if (!categoryForm.name.trim()) return;
              const res = await fetch("/api/admin/v2/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  site_id: siteId,
                  store_id: storeId,
                  ...categoryForm,
                }),
              });
              const data = await res.json();
              if (!res.ok || !data.ok) {
                toast({ variant: "error", title: "Category create failed", description: data.error || "Failed" });
                return;
              }
              toast({ variant: "success", title: "Category created" });
              setCategoryForm({ name: "", slug: "" });
              refreshCategories();
            }}
          >
            Add Category
          </button>
          <select
            className="border rounded p-2 w-full"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </section>

        <section className="border rounded-xl bg-white p-4 space-y-3">
          <h2 className="font-semibold">4. Category Attributes</h2>
          <input
            className="border rounded p-2 w-full"
            placeholder="Code (e.g. size)"
            value={attrForm.code}
            onChange={(e) => setAttrForm((prev) => ({ ...prev, code: e.target.value }))}
          />
          <input
            className="border rounded p-2 w-full"
            placeholder="Label"
            value={attrForm.name}
            onChange={(e) => setAttrForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="border rounded p-2 w-full"
            value={attrForm.type}
            onChange={(e) => setAttrForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            {["text", "textarea", "select", "multi_select", "number", "boolean", "color", "date"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="border rounded p-2 w-full"
            placeholder="Options (comma separated for select/multi_select)"
            value={attrForm.options}
            onChange={(e) => setAttrForm((prev) => ({ ...prev, options: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={attrForm.is_required}
              onChange={(e) => setAttrForm((prev) => ({ ...prev, is_required: e.target.checked }))}
            />
            Required
          </label>
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={async () => {
              if (!categoryId) return;
              const res = await fetch("/api/admin/v2/category-attributes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  site_id: siteId,
                  store_id: storeId,
                  category_id: categoryId,
                  code: attrForm.code,
                  name: attrForm.name,
                  type: attrForm.type,
                  is_required: attrForm.is_required,
                  options: attrForm.options
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                }),
              });
              const data = await res.json();
              if (!res.ok || !data.ok) {
                toast({ variant: "error", title: "Attribute create failed", description: data.error || "Failed" });
                return;
              }
              toast({ variant: "success", title: "Attribute created" });
              setAttrForm({
                code: "",
                name: "",
                type: "text",
                is_required: false,
                options: "",
              });
              refreshAttributes();
            }}
            disabled={!categoryId}
          >
            Add Attribute
          </button>
        </section>
      </div>

      <section className="border rounded-xl bg-white p-4 space-y-3">
        <h2 className="font-semibold">5. Create Product (Strict Validation)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded p-2"
            placeholder="Title"
            value={productForm.title}
            onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className="border rounded p-2"
            placeholder="SKU"
            value={productForm.sku}
            onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Base price cents"
            value={productForm.base_price_cents || ""}
            onChange={(e) =>
              setProductForm((prev) => ({
                ...prev,
                base_price_cents: Number(e.target.value || 0),
              }))
            }
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Inventory quantity"
            value={productForm.inventory_quantity || ""}
            onChange={(e) =>
              setProductForm((prev) => ({
                ...prev,
                inventory_quantity: Number(e.target.value || 0),
              }))
            }
          />
          <select
            className="border rounded p-2"
            value={productForm.brand_id}
            onChange={(e) => setProductForm((prev) => ({ ...prev, brand_id: e.target.value }))}
          >
            <option value="">Auto Legacy Brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.type})
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={productForm.status}
            onChange={(e) => setProductForm((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <textarea
          className="border rounded p-2 w-full"
          placeholder="Description"
          value={productForm.description}
          onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <div className="grid md:grid-cols-2 gap-3">{attributeInputs}</div>
        <button
          className="px-3 py-2 rounded bg-black text-white"
          onClick={async () => {
            if (!categoryId) {
              toast({ variant: "error", title: "Choose category first" });
              return;
            }
            const res = await fetch("/api/admin/v2/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                site_id: siteId,
                store_id: storeId,
                store_category_id: categoryId,
                title: productForm.title,
                description: productForm.description,
                base_price_cents: productForm.base_price_cents,
                sku: productForm.sku || null,
                inventory_quantity: productForm.inventory_quantity,
                brand_id: productForm.brand_id || null,
                status: productForm.status,
                attributes: attrValues,
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
              toast({ variant: "error", title: "Product create failed", description: data.error || "Failed" });
              return;
            }
            toast({ variant: "success", title: "Product created" });
            refreshInventory();
          }}
        >
          Create Product
        </button>
      </section>

      <section className="border rounded-xl bg-white p-4 space-y-3">
        <h2 className="font-semibold">6. Inventory Management</h2>
        <div className="space-y-2">
          {inventory.map((row) => (
            <InventoryRow
              key={row.variant_id || row.product_id}
              row={row}
              onAdjust={async (delta) => {
                const res = await fetch("/api/admin/v2/inventory", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    site_id: siteId,
                    store_id: storeId,
                    product_id: row.product_id,
                    variant_id: row.variant_id,
                    delta_quantity: delta,
                    change_type: delta >= 0 ? "restock" : "manual_adjustment",
                    reason: delta >= 0 ? "Restock" : "Manual decrement",
                  }),
                });
                const data = await res.json();
                if (!res.ok || !data.ok) {
                  toast({ variant: "error", title: "Inventory update failed", description: data.error || "Failed" });
                  return;
                }
                refreshInventory();
              }}
            />
          ))}
          {!inventory.length ? (
            <div className="text-sm text-gray-500">No inventory rows yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function InventoryRow({
  row,
  onAdjust,
}: {
  row: any;
  onAdjust: (delta: number) => void;
}) {
  const [n, setN] = useState(0);
  const isLow = Number(row.inventory_qty || 0) > 0 && Number(row.inventory_qty || 0) <= 5;
  const isOut = Number(row.inventory_qty || 0) <= 0;
  return (
    <div className="border rounded p-3 flex items-center justify-between gap-3">
      <div>
        <div className="font-medium">{row.title}</div>
        <div className="text-xs text-gray-500">
          SKU: {row.sku || "-"} | Qty: {row.inventory_qty}
          {isOut ? " | Out of stock" : isLow ? " | Low stock" : " | In stock"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="border rounded p-1 w-24"
          value={n}
          onChange={(e) => setN(Number(e.target.value || 0))}
        />
        <button className="px-2 py-1 border rounded" onClick={() => onAdjust(n)}>
          Apply
        </button>
      </div>
    </div>
  );
}
