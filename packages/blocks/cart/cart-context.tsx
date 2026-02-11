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

type CartState = {
  items: CartItem[];
  subtotal_cents: number;
  total_cents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (product_id: string, variant_id?: string) => void;
  updateQty: (product_id: string, variant_id: string | undefined, qty: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
};

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "acme_cart_v1";

function itemKey(item: { product_id: string; variant_id?: string }) {
  return `${item.product_id}:${item.variant_id || ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

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

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const subtotal_cents = useMemo(
    () => items.reduce((acc, i) => acc + i.price_cents * i.qty, 0),
    [items]
  );
  const total_cents = subtotal_cents;

  const value = useMemo(
    () => ({
      items,
      subtotal_cents,
      total_cents,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      setItems,
    }),
    [
      items,
      subtotal_cents,
      total_cents,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
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
