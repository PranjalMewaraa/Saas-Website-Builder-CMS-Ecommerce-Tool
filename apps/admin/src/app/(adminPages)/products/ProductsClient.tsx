"use client";

import { useEffect, useMemo, useState } from "react";
import ProductPublishToggleClient from "./ProductPublishToggleClient";
import ProductActionsClient from "./ProductActionsClient";

type Tab = "active" | "archived";

export default function ProductsClient({
  siteId,
  storeId,
  catalogId,
}: {
  siteId: string;
  storeId: string;
  catalogId?: string;
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [products, setProducts] = useState<any[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detailById, setDetailById] = useState<
    Record<string, { loading?: boolean; product?: any; error?: string }>
  >({});
  const [query, setQuery] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState<null | {
    action: "archive" | "restore" | "delete";
    count: number;
  }>(null);

  async function fetchArchivedCount() {
    const res = await fetch(
      `/api/admin/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&status=archived`,
      { cache: "no-store" },
    );
    const data = await res.json();
    setArchivedCount((data.products ?? []).length);
  }

  async function fetchList() {
    setLoading(true);
    const url =
      tab === "archived"
        ? `/api/admin/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&status=archived`
        : `/api/admin/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const list = data.products ?? [];
    setProducts(tab === "archived" ? list : list.filter((p: any) => p.status !== "archived"));
    setSelected({});
    setExpanded({});
    setLoading(false);
  }

  useEffect(() => {
    fetchList();
    fetchArchivedCount();
  }, [siteId, storeId, tab]);

  const selectedIds = useMemo(
    () => products.filter((p) => selected[p.id]).map((p) => p.id),
    [products, selected],
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p: any) => {
      const hay = [
        p.title,
        p.slug,
        p.sku,
        p.id,
        p.status,
        p.brand_name,
        p.category_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, query]);

  const allSelected = useMemo(() => {
    if (!filteredProducts.length) return false;
    return filteredProducts.every((p) => selected[p.id]);
  }, [filteredProducts, selected]);

  const stats = useMemo(() => {
    const total = products.length;
    const draft = products.filter((p: any) => p.status === "draft").length;
    const active = products.filter((p: any) => p.status === "active").length;
    const published = products.filter((p: any) => !!p.is_published).length;
    const avgPrice = total
      ? Math.round(
          products.reduce(
            (sum: number, p: any) => sum + Number(p.base_price_cents || 0),
            0,
          ) / total,
        )
      : 0;
    return { total, draft, active, published, avgPrice };
  }, [products]);

  function toggleAllExpanded(next: boolean) {
    const map: Record<string, boolean> = {};
    for (const p of filteredProducts) map[p.id] = next;
    setExpanded(map);
  }

  async function loadProductDetail(productId: string) {
    if (!productId) return;
    const existing = detailById[productId];
    if (existing?.loading || existing?.product) return;
    setDetailById((prev) => ({ ...prev, [productId]: { loading: true } }));
    try {
      const res = await fetch(
        `/api/admin/v2/products?site_id=${encodeURIComponent(siteId)}&store_id=${encodeURIComponent(storeId)}&product_id=${encodeURIComponent(productId)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setDetailById((prev) => ({
        ...prev,
        [productId]: {
          loading: false,
          product: data?.ok ? data.product : null,
          error: data?.ok ? undefined : data?.error || "Failed to load details",
        },
      }));
    } catch (e: any) {
      setDetailById((prev) => ({
        ...prev,
        [productId]: {
          loading: false,
          product: null,
          error: e?.message || "Failed to load details",
        },
      }));
    }
  }

  async function bulk(action: "archive" | "restore" | "delete") {
    if (!selectedIds.length) return;
    setBulkConfirm({ action, count: selectedIds.length });
  }

  async function runBulk(action: "archive" | "restore" | "delete") {
    await fetch(`/api/admin/products/bulk?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, product_ids: selectedIds }),
      }
    );
    await fetchList();
    await fetchArchivedCount();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total" value={stats.total} />
        <MetricCard label="Active" value={stats.active} />
        <MetricCard label="Draft" value={stats.draft} />
        <MetricCard label="Published" value={stats.published} />
        <MetricCard
          label="Avg Price"
          value={`$${(stats.avgPrice / 100).toFixed(2)}`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 shadow-sm">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "active"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Active / Draft
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "archived"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              Archived
              {archivedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
                  {archivedCount}
                </span>
              )}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug, SKU…"
            className="w-64 max-w-[50vw] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            className="px-3 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50"
            onClick={() => toggleAllExpanded(true)}
          >
            Expand all
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50"
            onClick={() => toggleAllExpanded(false)}
          >
            Collapse all
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            {tab === "active" ? (
              <button
                className="px-3 py-2 rounded border text-sm"
                onClick={() => bulk("archive")}
              >
                Archive Selected
              </button>
            ) : (
              <button
                className="px-3 py-2 rounded border text-sm"
                onClick={() => bulk("restore")}
              >
                Restore Selected
              </button>
            )}
            <button
              className="px-3 py-2 rounded border border-red-200 text-red-600 text-sm"
              onClick={() => bulk("delete")}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="border rounded p-4 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border rounded p-4 text-sm text-muted-foreground">
          No products found for this filter/search.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                const next: Record<string, boolean> = {};
                for (const p of filteredProducts) next[p.id] = e.target.checked;
                setSelected(next);
              }}
            />
            Select all
          </div>

          {filteredProducts.map((p: any) => {
            const isOpen = !!expanded[p.id];
            return (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-200 bg-white/90 shadow-sm overflow-hidden"
            >
              <div className="p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={!!selected[p.id]}
                      onChange={(e) =>
                        setSelected((prev) => ({
                          ...prev,
                          [p.id]: e.target.checked,
                        }))
                      }
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {p.title || "Untitled Product"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={String(p.status || "draft")}
                      tone={
                        p.status === "active"
                          ? "green"
                          : p.status === "archived"
                            ? "slate"
                            : "amber"
                      }
                    />
                    <StatusPill
                      label={p.is_published ? "Published" : "Unpublished"}
                      tone={p.is_published ? "blue" : "slate"}
                    />
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-gray-50"
                      onClick={() => {
                        const next = !isOpen;
                        setExpanded((prev) => ({ ...prev, [p.id]: next }));
                        if (next) loadProductDetail(p.id);
                      }}
                    >
                      {isOpen ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">
                      ${Number(p.base_price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab === "active" && (
                      <ProductPublishToggleClient
                        siteId={siteId}
                        storeId={storeId}
                        productId={p.id}
                        isPublished={!!p.is_published}
                      />
                    )}
                    <ProductActionsClient
                      siteId={siteId}
                      storeId={storeId}
                      catalogId={catalogId}
                      productId={p.id}
                      status={p.status}
                    />
                  </div>
                </div>
              </div>

              {isOpen ? (
                <div className="border-t border-gray-100 bg-gradient-to-b from-slate-50/70 to-white px-4 py-4">
                  {detailById[p.id]?.loading ? (
                    <div className="text-sm text-gray-500 mb-3">
                      Loading product details...
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <InfoItem
                      label="Inventory"
                      value={String(
                        Number(
                          detailById[p.id]?.product?.inventory_qty ??
                            p.inventory_qty ??
                            0,
                        ),
                      )}
                    />
                    <InfoItem
                      label="Brand"
                      value={
                        detailById[p.id]?.product?.brand_name ||
                        p.brand_name ||
                        "Not assigned"
                      }
                    />
                    <InfoItem
                      label="Category"
                      value={
                        detailById[p.id]?.product?.category_name ||
                        p.category_name ||
                        "Not assigned"
                      }
                    />
                  </div>
                  <AttributeSection
                    attributes={detailById[p.id]?.product?.attributes || {}}
                  />
                  <VariantsSection
                    variants={detailById[p.id]?.product?.variants || []}
                    fallbackCount={Number(p.variant_count || 0)}
                  />
                  {detailById[p.id]?.error ? (
                    <div className="mt-3 text-xs text-red-600">
                      {detailById[p.id]?.error}
                    </div>
                  ) : null}
                  {p.description ? (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Description
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                        {String(p.description)}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            );
          })}
        </div>
      )}

      {bulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/70 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="text-lg font-semibold">Confirm Bulk Action</div>
              <div className="text-sm text-gray-600">
                {bulkConfirm.action === "delete" && (
                  <>
                    Permanently delete <b>{bulkConfirm.count}</b> product
                    {bulkConfirm.count > 1 ? "s" : ""}? This cannot be undone.
                  </>
                )}
                {bulkConfirm.action === "archive" && (
                  <>
                    Archive <b>{bulkConfirm.count}</b> product
                    {bulkConfirm.count > 1 ? "s" : ""}?
                  </>
                )}
                {bulkConfirm.action === "restore" && (
                  <>
                    Restore <b>{bulkConfirm.count}</b> product
                    {bulkConfirm.count > 1 ? "s" : ""} to Draft?
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50/70 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setBulkConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  bulkConfirm.action === "delete"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
                onClick={async () => {
                  const action = bulkConfirm.action;
                  setBulkConfirm(null);
                  await runBulk(action);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "amber" | "blue" | "slate";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : tone === "blue"
          ? "bg-sky-50 text-sky-700 border-sky-200"
          : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`px-2 py-1 rounded-full text-xs border ${cls}`}>
      {label}
    </span>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function AttributeSection({ attributes }: { attributes: Record<string, any> }) {
  const entries = Object.entries(attributes || {}).filter(
    ([k, v]) => k && v != null && `${v}` !== "",
  );
  if (!entries.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
      <div className="text-xs font-medium text-gray-500 mb-2">Attributes</div>
      <div className="flex flex-wrap gap-2">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
          >
            <span className="font-medium">{humanizeKey(k)}:</span>
            <span>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function VariantsSection({
  variants,
  fallbackCount,
}: {
  variants: any[];
  fallbackCount?: number;
}) {
  if (!variants?.length) {
    if (!fallbackCount) return null;
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700">
        Variants: {fallbackCount}
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
      <div className="text-xs font-medium text-gray-500 mb-2">
        Variants ({variants.length})
      </div>
      <div className="space-y-2">
        {variants.slice(0, 6).map((v: any, idx: number) => {
          const opts = v?.options_json || {};
          const optsText = Object.entries(opts)
            .map(([k, val]) => `${humanizeKey(k)}: ${String(val)}`)
            .join(" · ");
          return (
            <div
              key={v.id || idx}
              className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="font-medium">
                {optsText || `Variant ${idx + 1}`}
              </div>
              <div>
                Qty {Number(v.inventory_qty || 0)} · $
                {(Number(v.price_cents || 0) / 100).toFixed(2)}
              </div>
            </div>
          );
        })}
        {variants.length > 6 ? (
          <div className="text-xs text-gray-500">+ {variants.length - 6} more</div>
        ) : null}
      </div>
    </div>
  );
}

function humanizeKey(input: string) {
  return String(input || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
