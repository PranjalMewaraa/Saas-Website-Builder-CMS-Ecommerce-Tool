"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AddToCartV1 from "../cart/AddToCartV1";
import type { StorefrontProduct } from "../ProductList/productList.data";

export default function ProductDetailClient({
  product,
  basePath,
}: {
  product: StorefrontProduct;
  basePath: string;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id || "",
  );
  const selectedVariant = useMemo(
    () =>
      (product.variants || []).find((v) => v.id === selectedVariantId) ||
      (product.variants || [])[0],
    [product.variants, selectedVariantId],
  );
  const selectedPrice =
    selectedVariant?.price_cents == null
      ? Number(product.base_price_cents || 0)
      : Number(selectedVariant.price_cents || 0);
  const totalInventory = (product.variants || []).reduce(
    (sum, v) => sum + Number(v.inventory_qty || 0),
    0,
  );
  const selectedInventory =
    selectedVariant?.inventory_qty == null
      ? totalInventory
      : Number(selectedVariant.inventory_qty || 0);
  const stockLabel =
    selectedInventory <= 0
      ? "Out of Stock"
      : selectedInventory <= 5
        ? "Low Stock"
        : "In Stock";
  const comparePrice = product.compare_at_price_cents
    ? product.compare_at_price_cents / 100
    : null;

  const primaryImage = useMemo(() => {
    const byVariant = (product.images || []).find(
      (img) =>
        img.variant_id &&
        selectedVariant &&
        String(img.variant_id) === String(selectedVariant.id),
    );
    if (byVariant) return byVariant;
    const generic = (product.images || []).find((img) => !img.variant_id);
    if (generic) return generic;
    return (product.images || [])[0];
  }, [product.images, selectedVariant]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.title}
            className="w-full aspect-[4/5] object-cover"
          />
        ) : (
          <div className="aspect-[4/5] flex items-center justify-center text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="text-sm text-slate-500">
          <Link href={basePath || "/products"} className="hover:underline">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span>{product.title}</span>
        </div>

        <h1 className="text-3xl font-semibold text-slate-900">{product.title}</h1>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-slate-900">
            ${(selectedPrice / 100).toFixed(2)}
          </span>
          {comparePrice && comparePrice > selectedPrice / 100 && (
            <span className="text-sm text-slate-500 line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="text-sm text-slate-600">{stockLabel}</div>

        {product.description && (
          <p className="text-slate-600 leading-relaxed">{product.description}</p>
        )}

        <div className="mt-4">
          <AddToCartV1
            productId={product.id}
            title={product.title}
            priceCents={selectedPrice}
            image={primaryImage?.url}
            buttonText="Add to cart"
            inventoryQty={selectedInventory}
            variants={product.variants || []}
            selectedVariantId={selectedVariant?.id || ""}
            onSelectedVariantIdChange={setSelectedVariantId}
          />
        </div>

        {product.attributes?.length ? (
          <div className="pt-4 border-t border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-2">Details</div>
            <div className="grid gap-2 text-sm text-slate-600">
              {product.attributes.map((attr) => (
                <div key={attr.code} className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">{attr.name}:</span>
                  <span>{String(attr.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
