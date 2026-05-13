"use client";

import { useEffect, useState } from "react";
import { useCartOptional } from "./cart-context";

type Props = {
  placeholder?: string;
  applyText?: string;
  removeText?: string;
  label?: string;
  __editor?: boolean;
};

function readSiteHint(): { site_id?: string; handle?: string } {
  if (typeof window === "undefined") return {};
  try {
    const handle =
      window.localStorage.getItem("storefront_handle") ||
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("storefront_handle="))
        ?.split("=")[1] ||
      undefined;
    const site_id =
      window.localStorage.getItem("storefront_site_id") || undefined;
    return { site_id, handle };
  } catch {
    return {};
  }
}

export default function CouponInputV1(props: Props) {
  const cart = useCartOptional();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<{ site_id?: string; handle?: string }>({});

  useEffect(() => {
    setHint(readSiteHint());
  }, []);

  if (!cart) {
    return (
      <div className="text-sm text-muted">Coupon input requires a cart.</div>
    );
  }

  const onApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || props.__editor) return;
    setError(null);
    setBusy(true);
    const result = await cart.applyCoupon(code, hint);
    if (!result.ok) {
      if (result.error === "empty_cart") {
        setError("Add items to your cart before applying a coupon.");
      } else if (result.error === "invalid_coupon") {
        setError("Coupon is invalid or not applicable.");
      } else {
        setError("Could not apply coupon. Please try again.");
      }
    } else {
      setCode("");
    }
    setBusy(false);
  };

  if (cart.coupon) {
    return (
      <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm flex items-center justify-between">
        <div>
          <span className="font-medium text-emerald-800">
            {cart.coupon.code}
          </span>
          {cart.coupon.name ? (
            <span className="text-emerald-700"> — {cart.coupon.name}</span>
          ) : null}
          <div className="text-emerald-700 text-xs">
            −₹{(cart.coupon.discount_cents / 100).toFixed(2)} applied
          </div>
        </div>
        <button
          type="button"
          onClick={() => cart.removeCoupon()}
          className="text-emerald-700 underline text-xs"
        >
          {props.removeText || "Remove"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onApply} className="space-y-2">
      {props.label ? (
        <label className="block text-sm">{props.label}</label>
      ) : null}
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={props.placeholder || "Promo code"}
          className="flex-1 border rounded px-3 py-2 text-sm"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {busy ? "Applying…" : props.applyText || "Apply"}
        </button>
      </div>
      {error ? (
        <div className="text-xs text-red-600" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}
