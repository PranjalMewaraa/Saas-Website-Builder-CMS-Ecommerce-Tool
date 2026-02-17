"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Tag,
  Settings2,
  ChevronDown,
  ChevronRight,
  Calendar,
  EyeOff,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react"; // Optional: assumes lucide-react is installed

type TargetType = "store" | "brand" | "category" | "product";

export default function PromotionsClient({
  siteId,
  storeId,
}: {
  siteId: string;
  storeId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    is_secret: false,
    is_active: true,
    discount_type: "percent",
    discount_scope: "order",
    discount_value: "10",
    min_order_cents: "0",
    max_discount_cents: "",
    usage_limit_total: "",
    usage_limit_per_customer: "",
    first_n_customers: "",
    starts_at: "",
    ends_at: "",
  });

  const [targetType, setTargetType] = useState<TargetType>("store");
  const [targetIds, setTargetIds] = useState<string[]>([]);

  const targetOptions = useMemo(() => {
    if (targetType === "brand") return brands;
    if (targetType === "category") return categories;
    if (targetType === "product") return products;
    return [];
  }, [targetType, brands, categories, products]);

  async function refresh() {
    if (!siteId || !storeId) return;
    setLoading(true);
    try {
      const [pRes, bRes, cRes, prRes] = await Promise.all([
        fetch(
          `/api/admin/v2/promotions?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          { cache: "no-store" },
        ),
        fetch(
          `/api/admin/v2/brands?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          { cache: "no-store" },
        ),
        fetch(
          `/api/admin/v2/categories?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          { cache: "no-store" },
        ),
        fetch(
          `/api/admin/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`,
          { cache: "no-store" },
        ),
      ]);
      const [pData, bData, cData, prData] = await Promise.all([
        pRes.json().catch(() => ({})),
        bRes.json().catch(() => ({})),
        cRes.json().catch(() => ({})),
        prRes.json().catch(() => ({})),
      ]);
      setPromotions(Array.isArray(pData?.promotions) ? pData.promotions : []);
      setBrands(Array.isArray(bData?.brands) ? bData.brands : []);
      setCategories(Array.isArray(cData?.categories) ? cData.categories : []);
      setProducts(Array.isArray(prData?.products) ? prData.products : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [siteId, storeId]);

  if (!siteId || !storeId) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500">
        Please select a Site and Store to manage promotions.
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Marketing & Promotions
        </h1>
        <p className="mt-2 text-slate-600">
          Create discount codes and automatic price rules to boost your sales.
        </p>
      </div>

      {/* Creation Form */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen((p) => !p)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <Plus className="h-4 w-4" /> Create New Offer
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
              {isCreateOpen ? "Collapse" : "Expand"}
              {isCreateOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          </button>
        </div>

        {isCreateOpen ? (
          <div className="p-6 space-y-6">
            {/* Section 1: Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Display Name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Summer Flash Sale"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Promo Code (Optional)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Discount Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Offer Type
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discount_type: e.target.value }))
                  }
                >
                  <option value="">Select Offer Type</option>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Flat Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Applies To
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
                  value={form.discount_scope}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discount_scope: e.target.value }))
                  }
                >
                  {" "}
                  <option value="">Select Offer Scope</option>
                  <option value="order">Entire Checkout Value</option>
                  <option value="items">Individual Items Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Discount Value
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
                  placeholder={
                    form.discount_type === "percent"
                      ? "e.g. 20 (%)"
                      : "e.g. 500 (₹)"
                  }
                  value={form.discount_value}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discount_value: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Section 3: Restrictions */}
            <div className="grid gap-4 md:grid-cols-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Min. Order Amount (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="0"
                  value={form.min_order_cents}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, min_order_cents: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Max. Discount (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="No limit"
                  value={form.max_discount_cents}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      max_discount_cents: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Total Usage Limit
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Unlimited"
                  value={form.usage_limit_total}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      usage_limit_total: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Section 4: Targeting & Schedule */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Settings2 className="h-3 w-3" /> Target Products
                </div>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value as TargetType);
                    setTargetIds([]);
                  }}
                >
                  <option value="">Select Offer Target</option>
                  <option value="store">Whole Store</option>
                  <option value="brand">Specific Brands</option>
                  <option value="category">Specific Categories</option>
                  <option value="product">Selected Products</option>
                </select>
                {targetType !== "store" && (
                  <div className="max-h-32 overflow-auto rounded-lg border border-slate-200 bg-white p-2 text-sm">
                    {targetOptions.map((t: any) => (
                      <label
                        key={t.id}
                        className="flex cursor-pointer items-center gap-2 p-1 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-blue-600"
                          checked={targetIds.includes(String(t.id))}
                          onChange={(e) => {
                            const id = String(t.id);
                            setTargetIds((prev) =>
                              e.target.checked
                                ? Array.from(new Set([...prev, id]))
                                : prev.filter((x) => x !== id),
                            );
                          }}
                        />
                        <span>{t.name || t.title || t.id}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="h-3 w-3" /> Schedule
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Starts At
                    </span>
                    <input
                      type="datetime-local"
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      value={form.starts_at}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, starts_at: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Ends At
                    </span>
                    <input
                      type="datetime-local"
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      value={form.ends_at}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, ends_at: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      checked={form.is_secret}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, is_secret: e.target.checked }))
                      }
                    />
                    <span>Secret (Hidden from public)</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-green-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-green-600"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, is_active: e.target.checked }))
                      }
                    />
                    <span>Active Now</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await fetch("/api/admin/v2/promotions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      site_id: siteId,
                      store_id: storeId,
                      ...form,
                      discount_value:
                        form.discount_type === "fixed"
                          ? Math.round(Number(form.discount_value || 0) * 100)
                          : Number(form.discount_value || 0),
                      min_order_cents: Math.round(
                        Number(form.min_order_cents || 0) * 100,
                      ),
                      max_discount_cents: form.max_discount_cents
                        ? Math.round(Number(form.max_discount_cents) * 100)
                        : null,
                      usage_limit_total: form.usage_limit_total
                        ? Number(form.usage_limit_total)
                        : null,
                      usage_limit_per_customer: form.usage_limit_per_customer
                        ? Number(form.usage_limit_per_customer)
                        : null,
                      first_n_customers: form.first_n_customers
                        ? Number(form.first_n_customers)
                        : null,
                      starts_at: form.starts_at
                        ? new Date(form.starts_at)
                            .toISOString()
                            .slice(0, 19)
                            .replace("T", " ")
                        : null,
                      ends_at: form.ends_at
                        ? new Date(form.ends_at)
                            .toISOString()
                            .slice(0, 19)
                            .replace("T", " ")
                        : null,
                      targets:
                        targetType === "store"
                          ? [{ type: "store", id: null }]
                          : targetIds.map((id) => ({ type: targetType, id })),
                    }),
                  });
                  await refresh();
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? "Creating Promotion..." : "Create Promotion Now"}
            </button>
          </div>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-600">
            Configure discount type, scope, targeting, and schedule. Expand to
            create a new promotion.
          </div>
        )}
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-800">
            Active Promotions{" "}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 font-normal">
              {promotions.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="flex h-20 items-center justify-center text-sm text-slate-500">
            Updating list...
          </div>
        ) : promotions.length ? (
          <div className="grid gap-3">
            {promotions.map((p) => {
              const isActive = Number(p.is_active || 0) === 1;
              return (
                <div
                  key={p.id}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4 transition-all ${
                    isActive
                      ? "border-slate-200"
                      : "border-slate-100 opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 rounded-full p-2 ${isActive ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"}`}
                    >
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {p.name}
                        </span>
                        {p.is_secret && (
                          <span className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                            <EyeOff className="h-3 w-3" /> Secret
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-700">
                          {p.code || "Automatic (No Code)"}
                        </span>
                        <span>•</span>
                        <span>
                          {p.discount_type === "percent"
                            ? `${p.discount_value}% Off`
                            : `₹${p.discount_value} Off`}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {p.discount_scope.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                      onClick={async () => {
                        await fetch("/api/admin/v2/promotions", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            site_id: siteId,
                            store_id: storeId,
                            promotion_id: p.id,
                            is_active: !isActive,
                          }),
                        });
                        await refresh();
                      }}
                    >
                      {isActive ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      className="group rounded-lg border border-red-100 p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Archive Promotion"
                      onClick={async () => {
                        if (
                          confirm(
                            "Are you sure you want to archive this promotion?",
                          )
                        ) {
                          await fetch(
                            `/api/admin/v2/promotions?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&promotion_id=${encodeURIComponent(String(p.id))}`,
                            { method: "DELETE" },
                          );
                          await refresh();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-900">
              No promotions found
            </p>
            <p className="text-xs text-slate-500">
              Create your first discount rule above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
