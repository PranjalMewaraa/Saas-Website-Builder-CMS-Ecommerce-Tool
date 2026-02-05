"use client";

import ProductCardV1 from "../ProductGrid/ProductCardBlocks/ProductCardV1";

const mockProducts = Array.from({ length: 8 }).map((_, i) => ({
  id: `mock-${i}`,
  slug: `sample-product-${i + 1}`,
  title: `Sample Product ${i + 1}`,
  description: "Sample product description",
  base_price_cents: 1999,
  compare_at_price_cents: null,
  brand_id: null,
  categories: [],
  images: [{ url: "/placeholder.png", alt: "Sample", sort_order: 0 }],
  variants: [],
  attributes: [],
}));

export default function ProductListVisualStub({ title = "Products" }: any) {
  return (
    <section className="py-8">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filters appear on the live site.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mockProducts.map((p) => (
            <ProductCardV1 key={p.id} product={p} detailPathPrefix="/products" />
          ))}
        </div>
      </div>
    </section>
  );
}
