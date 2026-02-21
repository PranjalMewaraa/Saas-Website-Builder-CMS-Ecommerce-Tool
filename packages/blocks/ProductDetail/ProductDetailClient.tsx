"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronDown, ShoppingBasket, Star } from "lucide-react";
import AddToCartV1 from "../cart/AddToCartV1";
import type { StorefrontProduct } from "../ProductList/productList.data";
import { normalizeImageUrl } from "../commerce/image-utils";

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openSpec, setOpenSpec] = useState(true);
  const [openFeature, setOpenFeature] = useState(true);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [suggestedPromos, setSuggestedPromos] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const selectedVariant = useMemo(
    () =>
      (product.variants || []).find((v) => v.id === selectedVariantId) ||
      (product.variants || [])[0],
    [product.variants, selectedVariantId],
  );

  const selectedPrice = Number(
    selectedVariant?.price_cents ?? product.base_price_cents ?? 0,
  );
  const totalInventory = (product.variants || []).reduce(
    (sum, v) => sum + Number(v.inventory_qty || 0),
    0,
  );
  const selectedInventory =
    selectedVariant?.inventory_qty == null
      ? totalInventory
      : Number(selectedVariant.inventory_qty || 0);

  const orderedImages = useMemo(() => {
    const all = [...(product.images || [])];
    if (!all.length) return [];
    const byOrder = (a: any, b: any) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0);

    const variantSpecific = all
      .filter(
        (img) =>
          img.variant_id &&
          selectedVariant &&
          String(img.variant_id) === String(selectedVariant.id),
      )
      .sort(byOrder);
    const generic = all.filter((img) => !img.variant_id).sort(byOrder);
    const otherVariants = all
      .filter(
        (img) =>
          img.variant_id &&
          (!selectedVariant ||
            String(img.variant_id) !== String(selectedVariant.id)),
      )
      .sort(byOrder);
    return [...variantSpecific, ...generic, ...otherVariants];
  }, [product.images, selectedVariant]);

  const primaryImage = orderedImages[activeImageIndex] || orderedImages[0];
  const primaryImageUrl = normalizeImageUrl(primaryImage?.url);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedVariantId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("cart_customer_info");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const siteHint = getSiteHint();
        const res = await fetch("/api/v2/promotions/suggested", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_id: siteHint.site_id,
            handle: siteHint.handle,
            items: [
              {
                product_id: product.id,
                variant_id: selectedVariant?.id,
                qty: 1,
              },
            ],
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const next = Array.isArray(data?.promotions) ? data.promotions : [];
        setSuggestedPromos((prev) => {
          const prevKey = JSON.stringify((prev || []).map((p: any) => p?.id));
          const nextKey = JSON.stringify((next || []).map((p: any) => p?.id));
          return prevKey === nextKey ? prev : next;
        });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id, selectedVariant?.id]);

  const rating = 4.8;
  const reviewCount = "1.2k";
  const stockLabel =
    selectedInventory <= 0
      ? "Out of Stock"
      : selectedInventory <= 5
        ? "Low Stock"
        : "In Stock";

  const colorOptions = useMemo(() => {
    const map = new Map<
      string,
      { value: string; variantId: string; hex: string }
    >();
    for (const v of product.variants || []) {
      const colorEntry = Object.entries(v.options || {}).find(([key, val]) => {
        const k = String(key || "").toLowerCase();
        return (k.includes("color") || k.includes("colour")) && val;
      });
      if (!colorEntry) continue;
      const value = String(colorEntry[1] || "").trim();
      if (!value || map.has(value.toLowerCase())) continue;
      map.set(value.toLowerCase(), {
        value,
        variantId: v.id,
        hex: toColorHex(value),
      });
    }
    return Array.from(map.values());
  }, [product.variants]);

  const selectedColor = useMemo(() => {
    if (!selectedVariant) return "";
    const entry = Object.entries(selectedVariant.options || {}).find(
      ([key, val]) => {
        const k = String(key || "").toLowerCase();
        return (k.includes("color") || k.includes("colour")) && val;
      },
    );
    return entry ? String(entry[1]) : "";
  }, [selectedVariant]);

  const specRows = useMemo(() => {
    if (!(product.attributes || []).length) return [];
    return (product.attributes || []).map((attr) => ({
      label: attr.name,
      value: Array.isArray(attr.value)
        ? attr.value.join(", ")
        : attr.value == null
          ? "-"
          : String(attr.value),
    }));
  }, [product.attributes]);

  const featureRows = useMemo(() => {
    const rows = String(product.description || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (rows.length) return rows;
    return [
      "Premium build quality for everyday usage",
      "Balanced design focused on comfort and durability",
      "Optimized for modern lifestyle performance",
    ];
  }, [product.description]);

  return (
    <div
      className="bg-white rounded-2xl p-2 sm:p-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.03) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div
            style={{ maxHeight: "440px" }}
            className="rounded-2xl max-h-96 border border-slate-200 bg-white overflow-hidden"
          >
            {primaryImage ? (
              <img
                src={primaryImageUrl}
                alt={primaryImage?.alt || product.title}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/5] grid place-items-center text-slate-400">
                No image
              </div>
            )}
          </div>

          {orderedImages.length > 1 ? (
            <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
              {orderedImages.slice(0, 10).map((img, idx) => (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  style={{ height: "84px" }}
                  onClick={() => setActiveImageIndex(idx)}
                  className={clsx(
                    "h-16 min-h-16 w-16 min-w-16 flex-none overflow-hidden rounded-xl border-2 transition",
                    idx === activeImageIndex
                      ? "border-slate-900"
                      : "border-slate-200 hover:border-slate-400",
                  )}
                >
                  <img
                    src={normalizeImageUrl(img.url)}
                    alt={img.alt || product.title}
                    className="w-full h-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <Link href={basePath || "/products"} className="hover:underline">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span>{product.title}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {product.title}
            </h1>
            <div className="text-2xl font-medium text-slate-900 whitespace-nowrap">
              ₹{(selectedPrice / 100).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-700">
              {rating.toFixed(1)}
            </span>
            <span>({reviewCount} Reviews)</span>
            <span className="mx-1 text-slate-300">|</span>
            <span
              className={
                selectedInventory <= 0 ? "text-red-600" : "text-slate-600"
              }
            >
              {stockLabel}
            </span>
          </div>

          {colorOptions.length ? (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Color
              </div>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.value}
                    onClick={() => setSelectedVariantId(c.variantId)}
                    className={clsx(
                      "h-8 w-8 rounded-full border-2",
                      selectedColor.toLowerCase() === c.value.toLowerCase()
                        ? "border-slate-900"
                        : "border-slate-200",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <span className="ml-2 text-sm text-slate-700">
                  {selectedColor || "Default"}
                </span>
              </div>
            </div>
          ) : null}

          {(product.variants || []).length > 1 ? (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Variant
              </div>
              <select
                value={selectedVariant?.id || ""}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {(product.variants || []).map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {formatVariantLabel(variant.options || {}) ||
                      variant.sku ||
                      "Default"}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="prose prose-sm max-w-none text-slate-600">
            <p>
              {product.description ||
                "Crafted for comfort and daily performance, this product blends premium quality with practical design."}
            </p>
          </div>

          <div className="space-y-3 py-4 border-t border-slate-200 pt-3">
            <h2>Specifications</h2>
            <div className="space-y-2">
              {(specRows.length
                ? specRows
                : [{ label: "Material", value: "Premium quality" }]
              ).map((row) => (
                <div
                  key={row.label}
                  className="flex items-start gap-2 p-2 text-sm text-slate-700"
                >
                  <Check className="h-4 w-4 text-slate-900 mt-0.5" />
                  <div>
                    <span className="font-medium">{row.label}:</span>{" "}
                    <span className="text-slate-600">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* <AccordionRow
              title="Feature"
              open={openFeature}
              onToggle={() => setOpenFeature((v) => !v)}
            >
              <ul className="space-y-1 text-sm p-2 text-slate-600">
                {featureRows.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-slate-700 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionRow> */}
          </div>

          <div className="grid grid-cols-12 gap-2 pt-1">
            {/* Buy Now - 9 Columns */}
            <div className="col-span-10">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90"
                onClick={() => setShowBuyDialog(true)}
              >
                Buy Now
              </button>
            </div>

            {/* Add To Cart - 3 Columns */}
            <div className="col-span-2">
              <AddToCartV1
                productId={product.id}
                title={product.title}
                priceCents={selectedPrice}
                image={primaryImageUrl}
                buttonText="Add to cart"
                inventoryQty={selectedInventory}
                variants={product.variants || []}
                selectedVariantId={selectedVariant?.id || ""}
                onSelectedVariantIdChange={setSelectedVariantId}
                hideVariantPicker
                containerClassName="space-y-0"
                buttonClassName="w-12 h-12 rounded-xl border border-black bg-black text-white hover:bg-black/90"
                buttonLabel={<ShoppingBasket className="h-4 w-4" />}
              />
            </div>
          </div>
          {suggestedPromos.length ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Available Coupons
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedPromos.slice(0, 4).map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    {p.code || p.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {orderNumber ? (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Order created:{" "}
              <span className="font-semibold">{orderNumber}</span>
            </div>
          ) : null}
        </div>
      </div>
      {showBuyDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-slate-900">
              Customer details
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="mt-3 grid gap-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Address line 1"
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Address line 2"
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="ZIP"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setShowBuyDialog(false)}
                disabled={creatingOrder}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={creatingOrder}
                onClick={async () => {
                  try {
                    setCreatingOrder(true);
                    const siteHint = getSiteHint();
                    const variantLabel = selectedVariant
                      ? formatVariantLabel(selectedVariant.options || {})
                      : "";
                    const orderItems = [
                      {
                        product_id: product.id,
                        variant_id: selectedVariant?.id || undefined,
                        variant_label: variantLabel || undefined,
                        title: product.title,
                        price_cents: selectedPrice,
                        image: primaryImageUrl,
                        qty: 1,
                      },
                    ];
                    const validateRes = await fetch("/api/v2/cart/validate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        site_id: siteHint.site_id,
                        handle: siteHint.handle,
                        items: orderItems,
                      }),
                    });
                    if (validateRes.ok) {
                      const vData = await validateRes.json();
                      const invalid = (vData.items || []).find(
                        (i: any) => !i.ok,
                      );
                      if (invalid)
                        throw new Error("Selected variant is out of stock");
                    }
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "cart_customer_info",
                        JSON.stringify(form),
                      );
                    }
                    const payload = {
                      items: orderItems,
                      subtotal_cents: selectedPrice,
                      total_cents: selectedPrice,
                      site_id: siteHint.site_id,
                      handle: siteHint.handle,
                      customer: {
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                      },
                      shipping_address: {
                        address1: form.address1,
                        address2: form.address2,
                        city: form.city,
                        state: form.state,
                        zip: form.zip,
                        country: form.country,
                      },
                    };

                    let res = await fetch("/api/v2/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      res = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                    }
                    const data = await res.json();
                    if (data?.order_number) {
                      setOrderNumber(data.order_number);
                      setShowBuyDialog(false);
                    }
                  } finally {
                    setCreatingOrder(false);
                  }
                }}
              >
                {creatingOrder ? "Processing..." : "Place order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AccordionRow({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        className="w-full px-3 py-2.5 flex items-center justify-between text-sm font-medium text-slate-800"
        onClick={onToggle}
      >
        <span>{title}</span>
        <ChevronDown
          className={clsx("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="px-3 pb-3">{children}</div> : null}
    </div>
  );
}

function toColorHex(value: string) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  const map: Record<string, string> = {
    black: "#111827",
    white: "#f8fafc",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    orange: "#f97316",
    purple: "#8b5cf6",
    pink: "#ec4899",
    gray: "#94a3b8",
    grey: "#94a3b8",
    brown: "#a16207",
    navy: "#1e3a8a",
    beige: "#e7d8c7",
  };
  if (map[v]) return map[v];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  return "#cbd5e1";
}

function formatVariantLabel(options: Record<string, string>) {
  return Object.entries(options || {})
    .filter(([k, v]) => k !== "default" && v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" / ");
}

function getSiteHint() {
  if (typeof window === "undefined") return { site_id: "", handle: "" };
  const params = new URLSearchParams(window.location.search);
  const storedHandle = window.localStorage.getItem("storefront_handle") || "";
  return {
    site_id: params.get("site_id") || "",
    handle: params.get("handle") || storedHandle,
  };
}
