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
  variant?: "default" | "outline" | "minimal" | "split" | "card" | "sticky";
  size?: "sm" | "md" | "lg";
  badgeText?: string;
  noteText?: string;
  showTitle?: boolean;
  showPrice?: boolean;
  showImage?: boolean;
  accentColor?: string;
  textColor?: string;
  surfaceColor?: string;
  radius?: number;
  fullWidth?: boolean;
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
  variant = "default",
  size = "md",
  badgeText,
  noteText,
  showTitle = true,
  showPrice = true,
  showImage = false,
  accentColor,
  textColor,
  surfaceColor,
  radius = 10,
  fullWidth = true,
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
  const safeImage = normalizeImageUrl(image);
  const money = formatMoney(selectedPrice);

  const sizeClass =
    size === "sm"
      ? "px-3 py-2 text-xs"
      : size === "lg"
        ? "px-6 py-3.5 text-base"
        : "px-4 py-2.5 text-sm";
  const baseButtonClass = cn(
    "inline-flex items-center justify-center font-medium disabled:opacity-60 transition",
    fullWidth ? "w-full" : "",
  );
  const styleButton: React.CSSProperties = {
    borderRadius: `${Math.max(0, Number(radius || 10))}px`,
  };
  const styleContainer: React.CSSProperties = {
    borderRadius: `${Math.max(0, Number(radius || 10))}px`,
    ...(surfaceColor ? { background: surfaceColor } : {}),
  };

  const variantButtonClass =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
      : variant === "minimal"
        ? "bg-transparent text-slate-900 hover:bg-slate-100"
        : "bg-slate-900 text-white";
  if (accentColor) styleButton.background = accentColor;
  if (textColor) styleButton.color = textColor;

  const buttonNode = (
    <button
      className={cn(baseButtonClass, sizeClass, variantButtonClass, buttonClassName)}
      style={styleButton}
      type="button"
      disabled={outOfStock}
      onClick={() => {
        if (!cart || !productId) return;
        cart.addItem({
          product_id: productId,
          variant_id: selectedVariant?.id || undefined,
          variant_label: showVariantPicker ? selectedLabel || undefined : undefined,
          title: title || "Product",
          price_cents: selectedPrice,
          image: safeImage,
          qty: quantity,
        });
        onAdded?.();
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {outOfStock ? "Out of stock" : added ? "Added" : buttonLabel ?? buttonText}
    </button>
  );

  const contentNode = (
    <>
      {showVariantPicker && !hideVariantPicker ? (
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          value={selectedVariant?.id || ""}
          onChange={(e) => setSelectedVariantId(e.target.value)}
        >
          {variantList.map((variantItem) => (
            <option key={variantItem.id} value={variantItem.id}>
              {formatVariantLabel(variantItem)}
            </option>
          ))}
        </select>
      ) : null}

      {variant === "card" ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-3" style={styleContainer}>
          {badgeText ? (
            <div className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
              {badgeText}
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            {showImage ? (
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                {safeImage ? (
                  <img src={safeImage} alt={title || "Product"} className="h-full w-full object-cover" />
                ) : null}
              </div>
            ) : null}
            <div className="min-w-0">
              {showTitle ? (
                <div className="truncate text-sm font-semibold text-slate-900">{title || "Product"}</div>
              ) : null}
              {showPrice ? (
                <div className="text-xs text-slate-600">{money}</div>
              ) : null}
            </div>
          </div>
          {buttonNode}
          {noteText ? <div className="text-[11px] text-slate-500">{noteText}</div> : null}
        </div>
      ) : variant === "split" ? (
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-slate-200 p-2" style={styleContainer}>
          <div className="min-w-0 px-2">
            {showTitle ? (
              <div className="truncate text-sm font-medium text-slate-900">{title || "Product"}</div>
            ) : null}
            {showPrice ? (
              <div className="text-xs text-slate-600">{money}</div>
            ) : null}
          </div>
          <div className="min-w-[132px]">{buttonNode}</div>
        </div>
      ) : variant === "sticky" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm" style={styleContainer}>
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="truncate text-sm font-medium text-slate-900">{showTitle ? title || "Product" : ""}</div>
            <div className="text-xs text-slate-600">{showPrice ? money : ""}</div>
          </div>
          {buttonNode}
        </div>
      ) : (
        <div className="space-y-2">
          {badgeText ? (
            <div className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
              {badgeText}
            </div>
          ) : null}
          {buttonNode}
          {noteText ? <div className="text-[11px] text-slate-500">{noteText}</div> : null}
        </div>
      )}
    </>
  );

  if (!cart || __editor || !productId) {
    return <div className={cn("space-y-2", containerClassName)}>{contentNode}</div>;
  }

  return <div className={cn("space-y-2", containerClassName)}>{contentNode}</div>;
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

function formatMoney(priceCents?: number) {
  const n = Number(priceCents || 0);
  if (Number.isNaN(n)) return "Rs 0";
  return `Rs ${Math.round(n / 100).toLocaleString("en-IN")}`;
}
