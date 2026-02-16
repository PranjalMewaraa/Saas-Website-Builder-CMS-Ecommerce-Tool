"use client";

import React, { useEffect, useState } from "react";
import { useCartOptional } from "./cart-context";
import { normalizeImageUrl } from "../commerce/image-utils";

type VariantOption = {
  id: string;
  sku?: string | null;
  price_cents?: number;
  inventory_qty?: number;
  options?: Record<string, string>;
};

type Props = {
  productId?: string;
  title?: string;
  priceCents?: number;
  image?: string;
  buttonText?: string;
  quantity?: number;
  inventoryQty?: number;
  variants?: VariantOption[];
  selectedVariantId?: string;
  onSelectedVariantIdChange?: (variantId: string) => void;
  hideVariantPicker?: boolean;
  containerClassName?: string;
  buttonClassName?: string;
  buttonLabel?: React.ReactNode;
  onAdded?: () => void;
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
  variants,
  selectedVariantId: selectedVariantIdProp,
  onSelectedVariantIdChange,
  hideVariantPicker = false,
  containerClassName,
  buttonClassName,
  buttonLabel,
  onAdded,
  __editor,
}: Props) {
  const cart = useCartOptional();
  const [added, setAdded] = useState(false);
  const variantList = Array.isArray(variants)
    ? variants.filter((v) => v && typeof v.id === "string" && v.id)
    : [];
  const [selectedVariantIdState, setSelectedVariantIdState] = useState(
    variantList[0]?.id || "",
  );
  const selectedVariantId = selectedVariantIdProp ?? selectedVariantIdState;
  const setSelectedVariantId = (value: string) => {
    if (selectedVariantIdProp === undefined) {
      setSelectedVariantIdState(value);
    }
    onSelectedVariantIdChange?.(value);
  };
  useEffect(() => {
    if (!variantList.length) {
      setSelectedVariantId("");
      return;
    }
    if (!selectedVariantId || !variantList.some((v) => v.id === selectedVariantId)) {
      setSelectedVariantId(variantList[0].id);
    }
  }, [selectedVariantId, variantList]);
  const selectedVariant =
    variantList.find((v) => v.id === selectedVariantId) || variantList[0];
  const showVariantPicker =
    variantList.length > 1 ||
    variantList.some((variant) => hasRealVariantOptions(variant.options));
  const selectedPrice =
    selectedVariant?.price_cents == null ? priceCents : Number(selectedVariant.price_cents);
  const selectedInventory =
    selectedVariant?.inventory_qty == null ? inventoryQty : Number(selectedVariant.inventory_qty);
  const selectedLabel = selectedVariant
    ? formatVariantLabel(selectedVariant)
    : "";

  const outOfStock =
    typeof selectedInventory === "number" ? selectedInventory <= 0 : false;

  if (!cart || __editor || !productId) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white",
          buttonClassName,
        )}
        type="button"
      >
        {buttonLabel ?? buttonText}
      </button>
    );
  }

  return (
      <div className={cn("space-y-2", containerClassName)}>
        {showVariantPicker && !hideVariantPicker ? (
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={selectedVariant?.id || ""}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {variantList.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {formatVariantLabel(variant)}
              </option>
            ))}
          </select>
        ) : null}
        <button
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60",
            buttonClassName,
          )}
          type="button"
          disabled={outOfStock}
          onClick={() => {
            cart.addItem({
              product_id: productId,
              variant_id: selectedVariant?.id || undefined,
              variant_label: showVariantPicker ? selectedLabel || undefined : undefined,
              title: title || "Product",
              price_cents: selectedPrice,
              image: normalizeImageUrl(image),
              qty: quantity,
            });
            onAdded?.();
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
        >
          {outOfStock
            ? "Out of stock"
            : added
              ? "Added"
              : buttonLabel ?? buttonText}
        </button>
      </div>
  );
}

function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

function formatVariantLabel(variant: VariantOption) {
  const options =
    variant.options && typeof variant.options === "object"
      ? Object.entries(variant.options)
          .filter(([k, v]) => !!k && !!v && k !== "default")
          .map(([k, v]) => `${k}: ${v}`)
      : [];
  if (options.length) return options.join(" / ");
  if (variant.sku) return String(variant.sku);
  return "Default";
}

function hasRealVariantOptions(options: VariantOption["options"]) {
  if (!options || typeof options !== "object") return false;
  return Object.entries(options).some(([k, v]) => !!k && !!v && k !== "default");
}
