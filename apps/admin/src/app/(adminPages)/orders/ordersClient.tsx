"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Badge,
  EmptyState,
  Skeleton,
  Dialog,
  buttonClass,
  controlClass,
  cn,
} from "@acme/ui";
import { useUI } from "@/app/_components/ui/UiProvider";

type Order = {
  _id: string;
  order_number: string;
  status: string;
  total_cents: number;
  customer?: { name?: string; email?: string; phone?: string };
  shipping_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  created_at?: string;
  items?: any[];
};

const STATUS_OPTIONS = [
  "",
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function statusTone(
  status: string,
): "neutral" | "accent" | "draft" | "danger" | "live" {
  switch (status) {
    case "new":
    case "shipped":
      return "accent";
    case "processing":
      return "draft";
    case "delivered":
      return "live";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export default function OrdersClient({ siteId }: { siteId: string }) {
  const { toast } = useUI();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  async function loadOrderDetail(orderId: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}?site_id=${encodeURIComponent(siteId)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok || !data?.order) {
        throw new Error(data?.error || "Failed to load order detail");
      }
      setSelected(data.order);
    } catch {
      toast({ title: "Failed to load order details", variant: "error" });
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadOrders() {
    if (!siteId) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ site_id: siteId });
      if (statusFilter) qs.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${qs.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast({ title: "Failed to load orders", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [siteId, statusFilter]);

  const totalCount = orders.length;
  const selectedItems = selected?.items || [];

  const filtered = orders.filter((o) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  if (!siteId) {
    return (
      <Card className="mt-6">
        <EmptyState
          title="No site selected"
          description="Pick a site from the switcher to view its orders."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track and resolve orders for this site.
          </p>
        </div>
        <span className="text-sm text-muted">
          {loading ? "Loading…" : `${totalCount} orders`}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          aria-label="Filter by status"
          className={cn(controlClass(), "h-10 w-full sm:w-48")}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s ? `Status: ${s}` : "All statuses"}
            </option>
          ))}
        </select>
        <input
          type="search"
          aria-label="Search orders"
          className={cn(controlClass(), "h-10 w-full sm:w-64")}
          placeholder="Search order, name, email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query || statusFilter ? "No matching orders" : "No orders yet"}
            description={
              query || statusFilter
                ? "Try a different search or status filter."
                : "Orders placed on your storefront will show up here."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-canvas">
                    <td className="px-4 py-3 font-medium text-ink">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {order.customer?.name || order.customer?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      ₹{((order.total_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-accent hover:underline"
                        onClick={() => loadOrderDetail(order._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.order_number ?? "Order"}
        description={selected?.customer?.email || "No customer email"}
        className="max-w-2xl"
        footer={
          <button
            type="button"
            className={buttonClass({ variant: "secondary" })}
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="order-status"
                className="text-sm font-medium text-ink"
              >
                Status
              </label>
              <select
                id="order-status"
                className={cn(controlClass(), "h-10 w-48")}
                value={selected.status}
                onChange={async (e) => {
                  const nextStatus = e.target.value;
                  try {
                    await fetch(
                      `/api/admin/orders/${selected._id}?site_id=${siteId}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: nextStatus }),
                      },
                    );
                    toast({ title: "Order status updated" });
                    await loadOrderDetail(selected._id);
                    await loadOrders();
                  } catch {
                    toast({
                      title: "Failed to update order",
                      variant: "error",
                    });
                  }
                }}
              >
                {STATUS_OPTIONS.filter(Boolean).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-control border border-line p-3 text-sm">
                <div className="font-medium text-ink">Customer</div>
                <div className="mt-1 text-muted">
                  {selected.customer?.name || "—"}
                </div>
                <div className="text-muted">{selected.customer?.email || "—"}</div>
                <div className="text-muted">{selected.customer?.phone || "—"}</div>
              </div>

              <div className="rounded-control border border-line p-3 text-sm">
                <div className="font-medium text-ink">Shipping</div>
                <div className="mt-1 text-muted">
                  {selected.shipping_address?.address1 || "—"}
                </div>
                {selected.shipping_address?.address2 ? (
                  <div className="text-muted">
                    {selected.shipping_address.address2}
                  </div>
                ) : null}
                <div className="text-muted">
                  {[
                    selected.shipping_address?.city,
                    selected.shipping_address?.state,
                    selected.shipping_address?.zip,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
                <div className="text-muted">
                  {selected.shipping_address?.country || "—"}
                </div>
              </div>
            </div>

            <div className="divide-y divide-line rounded-control border border-line">
              {detailLoading ? (
                <div className="p-3 text-sm text-muted">Loading details…</div>
              ) : null}
              {selectedItems.map((item: any, i: number) => {
                const lineTotal =
                  item.line_total_cents != null
                    ? Number(item.line_total_cents)
                    : Number(item.price_cents || 0) * Number(item.qty || 0);
                return (
                  <div
                    key={`${item.id || item.product_id}-${i}`}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.title || "Product"}
                          className="h-14 w-14 shrink-0 rounded-control border border-line object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 shrink-0 rounded-control border border-line bg-canvas" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted">
                          SKU: {item.sku || "—"} · Qty {item.qty}
                        </div>
                        {item.slug ? (
                          <div className="truncate text-xs text-muted">
                            /{item.slug}
                          </div>
                        ) : null}
                        {item.brand_name ||
                        (item.category_names || []).length ? (
                          <div className="truncate text-xs text-muted">
                            {item.brand_name ? `Brand: ${item.brand_name}` : ""}
                            {item.brand_name && (item.category_names || []).length
                              ? " · "
                              : ""}
                            {(item.category_names || []).length
                              ? `Category: ${(item.category_names || []).join(", ")}`
                              : ""}
                          </div>
                        ) : null}
                        {item.variant_label ? (
                          <div className="truncate text-xs text-muted">
                            {item.variant_label}
                          </div>
                        ) : null}
                        {item.variant_options &&
                        typeof item.variant_options === "object" &&
                        Object.keys(item.variant_options).length &&
                        !item.variant_label ? (
                          <div className="truncate text-xs text-muted">
                            {Object.entries(item.variant_options)
                              .map(([k, v]) => `${k}: ${String(v)}`)
                              .join(" · ")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-sm font-semibold text-ink">
                      <div>₹{(lineTotal / 100).toFixed(2)}</div>
                      <div className="text-xs font-normal text-muted">
                        ₹{((item.price_cents || 0) / 100).toFixed(2)} each
                      </div>
                    </div>
                  </div>
                );
              })}
              {!selectedItems.length && !detailLoading && (
                <div className="p-3 text-sm text-muted">No items</div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
