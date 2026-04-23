"use client";

import React from "react";
import { useCartOptional } from "./cart-context";

type Props = {
  title?: string;
  checkoutHref?: string;
  checkoutText?: string;
  __editor?: boolean;
};

export default function CartSummaryV1({
  title = "Summary",
  checkoutHref = "/checkout",
  checkoutText = "Checkout",
  __editor,
}: Props) {
  const cart = useCartOptional();
  const subtotal = cart?.subtotal_cents ?? 0;
  const total = cart?.total_cents ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">
            ₹{(subtotal / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="text-slate-500">Calculated at checkout</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span className="text-slate-500">Calculated at checkout</span>
        </div>
      </div>
      <div className="mt-4 border-t border-slate-200 pt-4 flex items-center justify-between">
        <span className="text-base font-medium text-slate-900">Total</span>
        <span className="text-base font-semibold text-slate-900">
          ₹{(total / 100).toFixed(2)}
        </span>
      </div>
      <a
        href={checkoutHref}
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {checkoutText}
      </a>
      {__editor ? (
        <div className="mt-3 text-xs text-slate-400">
          Summary preview (uses demo totals)
        </div>
      ) : null}
    </div>
  );
}
