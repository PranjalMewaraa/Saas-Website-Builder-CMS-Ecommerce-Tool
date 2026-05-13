"use client";

import { useEffect, useState } from "react";

type Me = {
  id: string;
  email: string;
  name: string | null;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

type Props = {
  greeting?: string;
  showRecentOrders?: boolean;
  ordersHref?: string;
  ordersText?: string;
  logoutText?: string;
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

export default function AccountDashboardV1(props: Props) {
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/me");
        if (res.status === 401) {
          window.location.href = "/account/login";
          return;
        }
        const data = await res.json();
        if (!cancelled && data?.ok) setMe(data.user);

        if (props.showRecentOrders !== false) {
          const oRes = await fetch("/api/account/orders");
          if (oRes.ok) {
            const oData = await oRes.json();
            if (!cancelled && oData?.ok)
              setOrders((oData.orders || []).slice(0, 5));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.showRecentOrders]);

  const onLogout = async () => {
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken, callbackUrl: "/" }).toString(),
      });
    } finally {
      window.location.href = "/";
    }
  };

  if (loading) {
    return <div className="text-sm text-muted">Loading…</div>;
  }
  if (!me) {
    return (
      <div className="text-sm">
        Not signed in.{" "}
        <a href="/account/login" className="underline">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {props.greeting || "Hello"}, {me.name || me.email}
          </h1>
          <p className="text-sm text-muted">{me.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm border rounded px-3 py-1 hover:bg-muted"
        >
          {props.logoutText || "Sign out"}
        </button>
      </div>

      {props.showRecentOrders !== false ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent orders</h2>
            <a
              href={props.ordersHref || "/account/orders"}
              className="text-sm underline"
            >
              {props.ordersText || "View all orders"}
            </a>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="divide-y border rounded">
              {orders.map((o) => (
                <li key={o.id} className="px-4 py-3 flex justify-between text-sm">
                  <div>
                    <div className="font-mono">{o.order_number}</div>
                    <div className="text-muted">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatMoney(o.total_cents, o.currency)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
