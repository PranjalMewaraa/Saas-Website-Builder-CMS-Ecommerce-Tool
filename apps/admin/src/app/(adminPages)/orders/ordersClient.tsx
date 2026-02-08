"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function OrdersClient({ siteId }: { siteId: string }) {
  const { toast } = useUI();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  async function loadOrders() {
    if (!siteId) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ site_id: siteId });
      if (statusFilter) qs.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${qs.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      if (selected) {
        const next = (data.orders || []).find((o: Order) => o._id === selected._id);
        setSelected(next || null);
      }
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

  const statusOptions = [
    "",
    "new",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

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
      <div className="min-h-[60vh] p-6">
        <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
          Select a site to view orders.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-500">
            Track and resolve orders for this site.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {loading ? "Loading..." : `${totalCount} orders`}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s ? `Status: ${s}` : "All statuses"}
            </option>
          ))}
        </select>
        <input
          className="border rounded-lg px-3 py-2 text-sm w-full sm:w-[260px]"
          placeholder="Search order, name, email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-6 gap-2 px-4 py-3 text-xs font-semibold uppercase text-gray-500 border-b">
          <div>Order</div>
          <div>Customer</div>
          <div>Total</div>
          <div>Status</div>
          <div>Date</div>
          <div className="text-right">Action</div>
        </div>
        <div className="divide-y">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-6 gap-2 px-4 py-3 text-sm"
            >
              <div className="font-medium">{order.order_number}</div>
              <div className="text-gray-600">
                {order.customer?.name || order.customer?.email || "-"}
              </div>
              <div>${((order.total_cents || 0) / 100).toFixed(2)}</div>
              <div className="capitalize">{order.status}</div>
              <div className="text-gray-500">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-right">
                <button
                  className="text-sm font-medium text-blue-600 hover:underline"
                  onClick={() => setSelected(order)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="px-4 py-8 text-sm text-gray-500 text-center">
              No orders yet.
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{selected.order_number}</div>
                <div className="text-xs text-gray-500">
                  {selected.customer?.email || "No customer email"}
                </div>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Status</div>
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={selected.status}
                onChange={async (e) => {
                  const nextStatus = e.target.value;
                  try {
                    await fetch(`/api/admin/orders/${selected._id}?site_id=${siteId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: nextStatus }),
                    });
                    toast({ title: "Order status updated" });
                    setSelected({ ...selected, status: nextStatus });
                  } catch {
                    toast({ title: "Failed to update order", variant: "error" });
                  }
                }}
              >
                {statusOptions
                  .filter(Boolean)
                  .map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3 text-sm">
                <div className="font-medium text-slate-900">Customer</div>
                <div className="mt-1 text-slate-600">
                  {selected.customer?.name || "-"}
                </div>
                <div className="text-slate-500">
                  {selected.customer?.email || "-"}
                </div>
                <div className="text-slate-500">
                  {selected.customer?.phone || "-"}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 text-sm">
                <div className="font-medium text-slate-900">Shipping</div>
                <div className="mt-1 text-slate-600">
                  {selected.shipping_address?.address1 || "-"}
                </div>
                {selected.shipping_address?.address2 ? (
                  <div className="text-slate-600">
                    {selected.shipping_address.address2}
                  </div>
                ) : null}
                <div className="text-slate-500">
                  {[
                    selected.shipping_address?.city,
                    selected.shipping_address?.state,
                    selected.shipping_address?.zip,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </div>
                <div className="text-slate-500">
                  {selected.shipping_address?.country || "-"}
                </div>
              </div>
            </div>

            <div className="mt-4 border rounded-lg divide-y">
              {selectedItems.map((item: any, i: number) => (
                <div
                  key={`${item.product_id}-${i}`}
                  className="p-3 text-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">Qty {item.qty}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    ${((item.price_cents || 0) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
              {!selectedItems.length && (
                <div className="p-3 text-sm text-gray-500">No items</div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
