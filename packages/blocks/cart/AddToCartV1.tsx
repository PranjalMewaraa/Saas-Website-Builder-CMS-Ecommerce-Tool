"use client";

import React, { useState } from "react";
import { useCartOptional } from "./cart-context";

type Props = {
  productId?: string;
  title?: string;
  priceCents?: number;
  image?: string;
  buttonText?: string;
  quantity?: number;
  __editor?: boolean;
};

export default function AddToCartV1({
  productId,
  title,
  priceCents = 0,
  image,
  buttonText = "Add to cart",
  quantity = 1,
  __editor,
}: Props) {
  const cart = useCartOptional();
  const [added, setAdded] = useState(false);

  if (!cart || __editor || !productId) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white"
        type="button"
      >
        {buttonText}
      </button>
    );
  }

  return (
    <button
      className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white"
      type="button"
      onClick={() => {
        cart.addItem({
          product_id: productId,
          title,
          price_cents: priceCents,
          image,
          qty: quantity,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added" : buttonText}
    </button>
  );
}
