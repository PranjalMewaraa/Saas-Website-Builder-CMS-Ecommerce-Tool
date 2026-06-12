"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Badge,
  EmptyState,
  Skeleton,
  ConfirmDialog,
  controlClass,
  buttonClass,
  cn,
} from "@acme/ui";
import ProductPublishToggleClient from "./ProductPublishToggleClient";
import ProductActionsClient from "./ProductActionsClient";
import ProductStatusToggleClient from "./ProductStatusToggleClient";

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

  function updateProductRow(
    productId: string,
    patch: Partial<{ status: "draft" | "active" | "archived"; is_published: boolean }>,
  ) {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...patch } : p)),
    );
  }

  const bulkCopy = bulkConfirm
    ? {
        delete: {
          title: "Delete products?",
          desc: `Permanently delete ${bulkConfirm.count} product${bulkConfirm.count > 1 ? "s" : ""}. This cannot be undone.`,
          label: "Delete",
        },
        archive: {
          title: "Archive products?",
          desc: `Archive ${bulkConfirm.count} product${bulkConfirm.count > 1 ? "s" : ""}. They’ll be hidden from listings.`,
          label: "Archive",
        },
        restore: {
          title: "Restore products?",
          desc: `Restore ${bulkConfirm.count} product${bulkConfirm.count > 1 ? "s" : ""} to draft.`,
          label: "Restore",
        },
      }[bulkConfirm.action]
    : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total" value={stats.total} />
        <MetricCard label="Active" value={stats.active} />
        <MetricCard label="Draft" value={stats.draft} />
        <MetricCard label="Published" value={stats.published} />
        <MetricCard
          label="Avg price"
          value={`₹${(stats.avgPrice / 100).toFixed(2)}`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 py-2 shadow-rest">
        <div
          role="tablist"
          aria-label="Product status"
          className="inline-flex rounded-control border border-line bg-canvas p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "active"}
            onClick={() => setTab("active")}
            className={cn(
              "rounded-control px-4 py-1.5 text-sm font-medium transition-colors",
              tab === "active"
                ? "bg-surface text-ink shadow-rest"
                : "text-muted hover:text-ink",
            )}
          >
            Active / Draft
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "archived"}
            onClick={() => setTab("archived")}
            className={cn(
              "inline-flex items-center gap-2 rounded-control px-4 py-1.5 text-sm font-medium transition-colors",
              tab === "archived"
                ? "bg-surface text-ink shadow-rest"
                : "text-muted hover:text-ink",
            )}
          >
            Archived
            {archivedCount > 0 && (
              <Badge tone="neutral">{archivedCount}</Badge>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug, SKU…"
            aria-label="Search products"
            className={cn(controlClass(), "h-9 w-64 max-w-[50vw]")}
          />
          <button
            type="button"
            className={buttonClass({ variant: "secondary", size: "sm" })}
            onClick={() => toggleAllExpanded(true)}
          >
            Expand all
          </button>
          <button
            type="button"
            className={buttonClass({ variant: "secondary", size: "sm" })}
            onClick={() => toggleAllExpanded(false)}
          >
            Collapse all
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            {tab === "active" ? (
              <button
                type="button"
                className={buttonClass({ variant: "secondary", size: "sm" })}
                onClick={() => bulk("archive")}
              >
                Archive selected
              </button>
            ) : (
              <button
                type="button"
                className={buttonClass({ variant: "secondary", size: "sm" })}
                onClick={() => bulk("restore")}
              >
                Restore selected
              </button>
            )}
            <button
              type="button"
              className={buttonClass({ variant: "danger", size: "sm" })}
              onClick={() => bulk("delete")}
            >
              Delete selected
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-7 w-40" />
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            title={query ? "No matches" : "No products yet"}
            description={
              query
                ? "Try a different search or clear the filter."
                : tab === "archived"
                  ? "Nothing has been archived."
                  : "Add your first product to start selling."
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          <label className="flex w-fit items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="accent-accent"
              checked={allSelected}
              onChange={(e) => {
                const next: Record<string, boolean> = {};
                for (const p of filteredProducts) next[p.id] = e.target.checked;
                setSelected(next);
              }}
            />
            Select all
          </label>

          {filteredProducts.map((p: any) => {
            const isOpen = !!expanded[p.id];
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-rest"
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        className="accent-accent"
                        aria-label={`Select ${p.title || "product"}`}
                        checked={!!selected[p.id]}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [p.id]: e.target.checked,
                          }))
                        }
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">
                          {p.title || "Untitled product"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {tab === "active" ? (
                        <>
                          <ProductStatusToggleClient
                            siteId={siteId}
                            productId={p.id}
                            status={
                              String(p.status || "draft") as
                                | "draft"
                                | "active"
                                | "archived"
                            }
                            onChanged={(nextStatus) => {
                              updateProductRow(p.id, { status: nextStatus });
                            }}
                          />
                          <ProductPublishToggleClient
                            siteId={siteId}
                            storeId={storeId}
                            productId={p.id}
                            isPublished={!!p.is_published}
                            onChanged={(nextPublished) => {
                              updateProductRow(p.id, {
                                is_published: nextPublished,
                              });
                            }}
                          />
                        </>
                      ) : (
                        <Badge tone="neutral">Archived</Badge>
                      )}
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        className={buttonClass({
                          variant: "ghost",
                          size: "sm",
                        })}
                        onClick={() => {
                          const next = !isOpen;
                          setExpanded((prev) => ({ ...prev, [p.id]: next }));
                          if (next) loadProductDetail(p.id);
                        }}
                      >
                        {isOpen ? "Hide details" : "View details"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-medium text-ink">
                      ₹{Number(p.base_price_cents / 100).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
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
                  <div className="border-t border-line bg-canvas px-4 py-4">
                    {detailById[p.id]?.loading ? (
                      <p className="mb-3 text-sm text-muted">
                        Loading product details…
                      </p>
                    ) : null}
                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
                      <p className="mt-3 text-xs text-danger" role="alert">
                        {detailById[p.id]?.error}
                      </p>
                    ) : null}
                    {p.description ? (
                      <div className="mt-3 rounded-control border border-line bg-surface px-3 py-2">
                        <div className="mb-1 text-xs font-medium text-muted">
                          Description
                        </div>
                        <div className="line-clamp-4 whitespace-pre-wrap text-sm text-ink">
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

      <ConfirmDialog
        open={!!bulkConfirm}
        onClose={() => setBulkConfirm(null)}
        onConfirm={async () => {
          const action = bulkConfirm!.action;
          setBulkConfirm(null);
          await runBulk(action);
        }}
        title={bulkCopy?.title ?? "Confirm"}
        description={bulkCopy?.desc}
        confirmLabel={bulkCopy?.label ?? "Confirm"}
        destructive={bulkConfirm?.action === "delete"}
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padded={false} className="px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-ink">{value}</div>
    </Card>
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
    <div className="rounded-control border border-line bg-surface px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className={cn("text-sm text-ink", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function AttributeSection({ attributes }: { attributes: Record<string, any> }) {
  const entries = Object.entries(attributes || {}).filter(
    ([k, v]) => k && v != null && `${v}` !== "",
  );
  if (!entries.length) return null;
  return (
    <div className="mt-3 rounded-control border border-line bg-surface px-3 py-3">
      <div className="mb-2 text-xs font-medium text-muted">Attributes</div>
      <div className="flex flex-wrap gap-2">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs text-ink"
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
      <div className="mt-3 rounded-control border border-line bg-surface px-3 py-3 text-sm text-ink">
        Variants: {fallbackCount}
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-control border border-line bg-surface px-3 py-3">
      <div className="mb-2 text-xs font-medium text-muted">
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
              className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-line bg-canvas px-2.5 py-2 text-xs text-ink"
            >
              <div className="font-medium">
                {optsText || `Variant ${idx + 1}`}
              </div>
              <div>
                Qty {Number(v.inventory_qty || 0)} · ₹
                {(Number(v.price_cents || 0) / 100).toFixed(2)}
              </div>
            </div>
          );
        })}
        {variants.length > 6 ? (
          <div className="text-xs text-muted">+ {variants.length - 6} more</div>
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
