"use client";

import ProductCardV1 from "./ProductCardBlocks/ProductCardV1";

const DUMMY_PRODUCTS = [
  {
    id: "p_1",
    slug: "everyday-backpack",
    title: "Everyday Backpack",
    description: "Minimal design, maximum carry. Built for daily use.",
    base_price_cents: 12900,
    compare_at_price_cents: 15900,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        alt: "Backpack",
      },
    ],
  },
  {
    id: "p_2",
    slug: "stoneware-mug",
    title: "Stoneware Mug",
    description: "Hand-finished ceramic with a satin glaze.",
    base_price_cents: 2400,
    compare_at_price_cents: 3200,
    images: [
      {
        url: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop",
        alt: "Mug",
      },
    ],
  },
  {
    id: "p_3",
    slug: "linen-throw",
    title: "Linen Throw",
    description: "Lightweight warmth with breathable comfort.",
    base_price_cents: 8900,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        alt: "Throw",
      },
    ],
  },
  {
    id: "p_4",
    slug: "wireless-earbuds",
    title: "Wireless Earbuds",
    description: "Compact case, clear sound, all‑day battery.",
    base_price_cents: 9900,
    images: [
      {
        url: "https://images.unsplash.com/photo-1518441902117-f1b9f77a1b1d?q=80&w=1200&auto=format&fit=crop",
        alt: "Earbuds",
      },
    ],
  },
  {
    id: "p_5",
    slug: "soft-hoodie",
    title: "Soft Hoodie",
    description: "Plush fleece with a clean, relaxed fit.",
    base_price_cents: 5900,
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
        alt: "Hoodie",
      },
    ],
  },
  {
    id: "p_6",
    slug: "desk-lamp",
    title: "Desk Lamp",
    description: "Soft ambient light with a sculpted silhouette.",
    base_price_cents: 7400,
    images: [
      {
        url: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop",
        alt: "Lamp",
      },
    ],
  },
];

export default function ProductGridVisualStub(props: any) {
  const count = props.limit || 6;
  const detailPathPrefix = props.detailPathPrefix || "/products";
  const cardVariant = props.cardVariant || "default";
  const products = DUMMY_PRODUCTS.slice(0, count);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <ProductCardV1
          key={product.id}
          product={product}
          detailPathPrefix={detailPathPrefix}
          clickable={false}
          variant={cardVariant}
        />
      ))}
    </div>
  );
}
