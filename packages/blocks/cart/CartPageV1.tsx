"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCartOptional } from "./cart-context";
import type { CartItem } from "./cart-context";
import { normalizeImageUrl } from "../commerce/image-utils";

type Props = {
  title?: string;
  emptyTitle?: string;
  emptyCtaText?: string;
  emptyCtaHref?: string;
  checkoutText?: string;
  checkoutMode?: "link" | "create-order";
  checkoutHref?: string;
  __editor?: boolean;
};

const DEMO_ITEMS: CartItem[] = [
  {
    product_id: "p_1",
    variant_id: undefined,
    title: "Everyday Backpack",
    price_cents: 12900,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    qty: 1,
  },
  {
    product_id: "p_2",
    variant_id: undefined,
    title: "Stoneware Mug",
    price_cents: 2400,
    image:
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop",
    qty: 2,
  },
];

export default function CartPageV1({
  title = "Your cart",
  emptyTitle = "Your cart is empty",
  emptyCtaText = "Browse products",
  emptyCtaHref = "/products",
  checkoutText = "Checkout",
  checkoutMode = "create-order",
  checkoutHref = "/checkout",
  __editor,
}: Props) {
  const cart = useCartOptional();
  const [creating, setCreating] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<any | null>(null);
  const [suggestedPromos, setSuggestedPromos] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const siteHint = useMemo(() => getSiteHint(), []);
  const [showDialog, setShowDialog] = useState(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("cart_customer_info");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {}
  }, []);

  const items = cart?.items?.length ? cart.items : __editor ? DEMO_ITEMS : [];
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.price_cents * i.qty, 0),
    [items]
  );
  const itemsKey = useMemo(
    () =>
      JSON.stringify(
        items.map((i) => ({
          p: i.product_id,
          v: i.variant_id || "",
          q: i.qty,
        })),
      ),
    [items],
  );
  const discount = Number(appliedPromotion?.discount_cents || 0);
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (!items.length || __editor) return;
    let cancelled = false;
    (async () => {
      setPromoLoading(true);
      try {
        const res = await fetch("/api/v2/promotions/suggested", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_id: siteHint.site_id,
            handle: siteHint.handle,
            items,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const next = Array.isArray(data?.promotions) ? data.promotions : [];
        setSuggestedPromos((prev) => {
          const prevKey = JSON.stringify((prev || []).map((p: any) => p?.id));
          const nextKey = JSON.stringify((next || []).map((p: any) => p?.id));
          return prevKey === nextKey ? prev : next;
        });
      } finally {
        if (!cancelled) setPromoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemsKey, siteHint.handle, siteHint.site_id, __editor]);

  async function applyCoupon(code: string) {
    if (!code.trim()) {
      setAppliedPromotion(null);
      setCouponError("");
      return;
    }
    const res = await fetch("/api/v2/promotions/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_id: siteHint.site_id,
        handle: siteHint.handle,
        coupon_code: code.trim(),
        items,
        customer: {
          email: form.email,
          phone: form.phone,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.applied) {
      setAppliedPromotion(null);
      setCouponError(data?.error || "Invalid coupon");
      return;
    }
    setCouponError("");
    setAppliedPromotion(data.applied);
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="text-lg font-semibold text-slate-900">{emptyTitle}</div>
        <a
          href={emptyCtaHref}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          {emptyCtaText}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.variant_id || ""}`}
              className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"
            >
              {item.image ? (
                <img
                  src={normalizeImageUrl(item.image)}
                  alt={item.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-slate-100" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">
                  {item.title}
                </div>
                {item.variant_label ? (
                  <div className="mt-0.5 text-xs text-slate-500">{item.variant_label}</div>
                ) : null}
                <div className="mt-1 text-xs text-slate-500">
                  ₹{(item.price_cents / 100).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cart ? (
                  <>
                    <button
                      className="h-8 w-8 rounded-md border border-slate-200 text-sm"
                      onClick={() =>
                        cart.updateQty(
                          item.product_id,
                          item.variant_id,
                          item.qty - 1
                        )
                      }
                    >
                      -
                    </button>
                    <div className="min-w-[32px] text-center text-sm">
                      {item.qty}
                    </div>
                    <button
                      className="h-8 w-8 rounded-md border border-slate-200 text-sm"
                      onClick={() =>
                        cart.updateQty(
                          item.product_id,
                          item.variant_id,
                          item.qty + 1
                        )
                      }
                    >
                      +
                    </button>
                    <button
                      className="ml-2 text-xs text-slate-500 hover:text-slate-700"
                      onClick={() =>
                        cart.removeItem(item.product_id, item.variant_id)
                      }
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-slate-400">Qty {item.qty}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-lg font-semibold text-slate-900">Summary</div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">
            ₹{(subtotal / 100).toFixed(2)}
          </span>
        </div>
        {appliedPromotion ? (
          <div className="mt-3 flex items-center justify-between text-sm text-emerald-700">
            <span>
              Discount ({appliedPromotion.code || appliedPromotion.name || "Promo"})
            </span>
            <span className="font-medium">-₹{(discount / 100).toFixed(2)}</span>
          </div>
        ) : null}
        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <div className="text-xs font-medium text-slate-600">Coupon code</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={() => applyCoupon(couponCode)}
              type="button"
            >
              Apply
            </button>
          </div>
          {couponError ? (
            <div className="mt-2 text-xs text-red-600">{couponError}</div>
          ) : null}
          {promoLoading ? (
            <div className="mt-2 text-xs text-slate-500">Loading offers…</div>
          ) : suggestedPromos.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestedPromos.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setCouponCode(String(p.code || ""));
                    if (p.code) applyCoupon(String(p.code));
                  }}
                >
                  {p.code || p.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4 flex items-center justify-between">
          <span className="text-base font-medium text-slate-900">Total</span>
          <span className="text-base font-semibold text-slate-900">
            ₹{(total / 100).toFixed(2)}
          </span>
        </div>

        {orderNumber ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Order created: <span className="font-semibold">{orderNumber}</span>
          </div>
        ) : null}

        <button
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          disabled={creating}
          onClick={async () => {
            if (__editor) return;
            if (checkoutMode === "link") {
              window.location.href = checkoutHref;
              return;
            }
            if (!cart) return;
            setShowDialog(true);
          }}
        >
          {creating ? "Processing..." : checkoutText}
        </button>
      </div>

      {showDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-slate-900">
              Customer details
            </div>
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

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setShowDialog(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={creating}
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
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "cart_customer_info",
                        JSON.stringify(form)
                      );
                    }
                    let res = await fetch("/api/v2/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        items: cart.items,
                        subtotal_cents: cart.subtotal_cents,
                        total_cents: total,
                        site_id: siteHint.site_id,
                        handle: siteHint.handle,
                        coupon_code: appliedPromotion?.code || couponCode || undefined,
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
                      // Legacy fallback path
                      res = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          items: cart.items,
                          subtotal_cents: cart.subtotal_cents,
                          total_cents: total,
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
                      setShowDialog(false);
                    }
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? "Processing..." : "Place order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
