"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CartItem = {
  product_id: string;
  variant_id?: string;
  variant_label?: string;
  title: string;
  price_cents: number;
  image?: string;
  qty: number;
};

export type AppliedCoupon = {
  code: string;
  id?: string;
  name?: string;
  discount_cents: number;
};

type CartState = {
  items: CartItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon: AppliedCoupon | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (product_id: string, variant_id?: string) => void;
  updateQty: (product_id: string, variant_id: string | undefined, qty: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  applyCoupon: (
    code: string,
    siteHint?: { site_id?: string; handle?: string },
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "acme_cart_v1";
const COUPON_STORAGE_KEY = "acme_cart_coupon_v1";

function itemKey(item: { product_id: string; variant_id?: string }) {
  return `${item.product_id}:${item.variant_id || ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const couponRaw = localStorage.getItem(COUPON_STORAGE_KEY);
      if (couponRaw) {
        const parsed = JSON.parse(couponRaw);
        if (parsed && typeof parsed.code === "string") setCoupon(parsed);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  React.useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {}
  }, [coupon]);

  const addItem = useCallback((item: Omit<CartItem, "qty"> & { qty?: number }) => {
    const qty = item.qty ?? 1;
    setItems((prev) => {
      const next = [...prev];
      const key = itemKey(item);
      const idx = next.findIndex((i) => itemKey(i) === key);
      if (idx >= 0) {
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      } else {
        next.push({ ...item, qty });
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((product_id: string, variant_id?: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== itemKey({ product_id, variant_id })));
  }, []);

  const updateQty = useCallback(
    (product_id: string, variant_id: string | undefined, qty: number) => {
      setItems((prev) => {
        if (qty <= 0) {
          return prev.filter((i) => itemKey(i) !== itemKey({ product_id, variant_id }));
        }
        return prev.map((i) =>
          itemKey(i) === itemKey({ product_id, variant_id }) ? { ...i, qty } : i
        );
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const subtotal_cents = useMemo(
    () => items.reduce((acc, i) => acc + i.price_cents * i.qty, 0),
    [items]
  );
  const discount_cents = useMemo(
    () =>
      coupon ? Math.min(subtotal_cents, Math.max(0, coupon.discount_cents)) : 0,
    [coupon, subtotal_cents],
  );
  const total_cents = Math.max(0, subtotal_cents - discount_cents);

  const applyCoupon = useCallback(
    async (
      code: string,
      siteHint?: { site_id?: string; handle?: string },
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      const trimmed = String(code || "").trim();
      if (!trimmed) return { ok: false, error: "empty_code" };
      if (!items.length) return { ok: false, error: "empty_cart" };
      try {
        const res = await fetch("/api/v2/promotions/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coupon_code: trimmed,
            site_id: siteHint?.site_id,
            handle: siteHint?.handle,
            items: items.map((i) => ({
              product_id: i.product_id,
              variant_id: i.variant_id,
              qty: i.qty,
            })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok || !data?.applied) {
          return { ok: false, error: data?.error || "invalid_coupon" };
        }
        setCoupon({
          code: trimmed,
          id: data.applied.id,
          name: data.applied.name,
          discount_cents: Number(data.applied.discount_cents || 0),
        });
        return { ok: true };
      } catch {
        return { ok: false, error: "network_error" };
      }
    },
    [items],
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const value = useMemo(
    () => ({
      items,
      subtotal_cents,
      discount_cents,
      total_cents,
      coupon,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      setItems,
      applyCoupon,
      removeCoupon,
    }),
    [
      items,
      subtotal_cents,
      discount_cents,
      total_cents,
      coupon,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useCartOptional() {
  return useContext(CartContext);
}
