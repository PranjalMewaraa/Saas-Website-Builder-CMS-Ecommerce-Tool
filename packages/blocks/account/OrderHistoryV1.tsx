"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

type Props = {
  title?: string;
  emptyText?: string;
};

function formatMoney(cents: number, currency: string) {
  const amount = (cents || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default function OrderHistoryV1(props: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/account/orders");
      if (res.status === 401) {
        if (!cancelled) {
          setUnauthorized(true);
          setLoading(false);
        }
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!cancelled) {
        if (data?.ok) setOrders(data.orders || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-sm text-muted">Loading…</div>;

  if (unauthorized) {
    return (
      <div className="text-sm">
        Please{" "}
        <a href="/account/login" className="underline">
          sign in
        </a>{" "}
        to view your orders.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">{props.title || "Your orders"}</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-muted">
          {props.emptyText || "You haven't placed any orders yet."}
        </p>
      ) : (
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2 font-mono">{o.order_number}</td>
                <td className="px-3 py-2">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 capitalize">{o.status}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatMoney(o.total_cents, o.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
