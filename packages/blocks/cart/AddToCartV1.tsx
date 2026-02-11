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
  inventoryQty?: number;
  __editor?: boolean;
};

export default function AddToCartV1({
  productId,
  title,
  priceCents = 0,
  image,
  buttonText = "Add to cart",
  quantity = 1,
  inventoryQty,
  __editor,
}: Props) {
  const cart = useCartOptional();
  const [added, setAdded] = useState(false);

  const outOfStock =
    typeof inventoryQty === "number" ? inventoryQty <= 0 : false;

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
      className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      type="button"
      disabled={outOfStock}
      onClick={() => {
        cart.addItem({
          product_id: productId,
          title: title || "Product",
          price_cents: priceCents,
          image,
          qty: quantity,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {outOfStock ? "Out of stock" : added ? "Added" : buttonText}
    </button>
  );
}
