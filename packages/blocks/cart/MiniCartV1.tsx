"use client";

import React from "react";
import { useCartOptional } from "./cart-context";

type Props = {
  title?: string;
  viewCartText?: string;
  viewCartHref?: string;
  checkoutText?: string;
  checkoutHref?: string;
  __editor?: boolean;
};

export default function MiniCartV1({
  title = "Cart",
  viewCartText = "View cart",
  viewCartHref = "/cart",
  checkoutText = "Checkout",
  checkoutHref = "/checkout",
  __editor,
}: Props) {
  const cart = useCartOptional();
  const open = __editor ? true : cart?.isOpen;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal_cents || 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => cart?.closeCart()}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="text-lg font-semibold text-slate-900">{title}</div>
          <button
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={() => cart?.closeCart()}
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-sm text-slate-500">Your cart is empty.</div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product_id}-${item.variant_id || ""}`}
                className="flex items-center gap-3"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-slate-100" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    Qty {item.qty} · ${(item.price_cents / 100).toFixed(2)}
                  </div>
                </div>
                {cart ? (
                  <button
                    className="text-xs text-slate-500 hover:text-slate-700"
                    onClick={() =>
                      cart.removeItem(item.product_id, item.variant_id)
                    }
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="border-t p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-900">
              ${(subtotal / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex gap-3">
            <a
              href={viewCartHref}
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
            >
              {viewCartText}
            </a>
            <a
              href={checkoutHref}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {checkoutText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
