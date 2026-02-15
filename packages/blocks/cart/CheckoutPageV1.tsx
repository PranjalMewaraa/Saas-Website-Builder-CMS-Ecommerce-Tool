"use client";

import React, { useMemo, useState } from "react";
import { useCartOptional } from "./cart-context";

type Props = {
  title?: string;
  submitText?: string;
  successText?: string;
  orderPathPrefix?: string;
  __editor?: boolean;
};

export default function CheckoutPageV1({
  title = "Checkout",
  submitText = "Place order",
  successText = "Order placed successfully",
  orderPathPrefix = "/orders",
  __editor,
}: Props) {
  const cart = useCartOptional();
  const [creating, setCreating] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const siteHint = useMemo(() => getSiteHint(), []);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const items = cart?.items || [];
  const subtotal = cart?.subtotal_cents || 0;

  const isEmpty = !items.length;

  const orderUrl = useMemo(() => {
    if (!orderNumber) return "";
    const base = orderPathPrefix.endsWith("/")
      ? orderPathPrefix.slice(0, -1)
      : orderPathPrefix;
    return `${base}/${orderNumber}`;
  }, [orderNumber, orderPathPrefix]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>
        <div className="mt-3 grid gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Address line 1"
            value={form.address1}
            onChange={(e) => setForm({ ...form, address1: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Address line 2"
            value={form.address2}
            onChange={(e) => setForm({ ...form, address2: e.target.value })}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="ZIP"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-lg font-semibold text-slate-900">Order</div>
        {isEmpty ? (
          <div className="mt-4 text-sm text-slate-500">
            Your cart is empty.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.variant_id || ""}`}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  {item.variant_label ? (
                    <div className="text-xs text-slate-500">{item.variant_label}</div>
                  ) : null}
                  <div className="text-xs text-slate-500">Qty {item.qty}</div>
                </div>
                <div className="font-medium text-slate-900">
                  ${(item.price_cents / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-slate-200 pt-4 flex items-center justify-between">
          <span className="text-sm text-slate-600">Total</span>
          <span className="text-base font-semibold text-slate-900">
            ${(subtotal / 100).toFixed(2)}
          </span>
        </div>

        {orderNumber ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successText} —{" "}
            <a href={orderUrl} className="font-semibold underline">
              {orderNumber}
            </a>
          </div>
        ) : null}

        <button
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          disabled={creating || isEmpty || __editor}
          onClick={async () => {
            if (!cart) return;
            try {
              setCreating(true);
              const validateRes = await fetch("/api/v2/cart/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  site_id: siteHint.site_id,
                  handle: siteHint.handle,
                  items: cart.items,
                }),
              });
              if (validateRes.ok) {
                const vData = await validateRes.json();
                const invalid = (vData.items || []).find((i: any) => !i.ok);
                if (invalid) {
                  throw new Error("Some items are out of stock");
                }
              }
              let res = await fetch("/api/v2/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: cart.items,
                  subtotal_cents: cart.subtotal_cents,
                  total_cents: cart.total_cents,
                  site_id: siteHint.site_id,
                  handle: siteHint.handle,
                  customer: {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                  },
                  shipping_address: {
                    address1: form.address1,
                    address2: form.address2,
                    city: form.city,
                    state: form.state,
                    zip: form.zip,
                    country: form.country,
                  },
                }),
              });
              if (!res.ok) {
                res = await fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: cart.items,
                    subtotal_cents: cart.subtotal_cents,
                    total_cents: cart.total_cents,
                    site_id: siteHint.site_id,
                    handle: siteHint.handle,
                    customer: {
                      name: form.name,
                      email: form.email,
                      phone: form.phone,
                    },
                    shipping_address: {
                      address1: form.address1,
                      address2: form.address2,
                      city: form.city,
                      state: form.state,
                      zip: form.zip,
                      country: form.country,
                    },
                  }),
                });
              }
              const data = await res.json();
              if (data?.order_number) {
                setOrderNumber(data.order_number);
                cart.clearCart();
              }
            } finally {
              setCreating(false);
            }
          }}
        >
          {creating ? "Processing..." : submitText}
        </button>
      </div>
    </div>
  );
}

function getSiteHint() {
  if (typeof window === "undefined") return { site_id: "", handle: "" };
  const params = new URLSearchParams(window.location.search);
  const storedHandle = window.localStorage.getItem("storefront_handle") || "";
  return {
    site_id: params.get("site_id") || "",
    handle: params.get("handle") || storedHandle,
  };
}
