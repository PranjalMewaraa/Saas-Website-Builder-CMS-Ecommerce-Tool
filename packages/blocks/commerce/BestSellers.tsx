import React from "react";

const defaults = [
  { title: "Premium Hoodie", price: "₹1,999", href: "#" },
  { title: "Everyday Sneakers", price: "₹2,499", href: "#" },
  { title: "Classic Denim", price: "₹1,799", href: "#" },
  { title: "Canvas Bag", price: "₹1,299", href: "#" },
];

export default function BestSellersV1(props: any) {
  const { title, subtitle, contentWidth, products = defaults } = props || {};

  const maxWidth =
    contentWidth === "sm"
      ? "640px"
      : contentWidth === "md"
        ? "768px"
        : contentWidth === "lg"
          ? "1024px"
          : contentWidth === "xl"
            ? "1280px"
            : contentWidth === "2xl"
              ? "1536px"
              : "1280px";

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? (
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p: any, idx: number) => (
            <a
              key={`${p.title || "product"}-${idx}`}
              href={p.href || "#"}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-50" />
              <div className="p-4">
                <div className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {p.title || `Product ${idx + 1}`}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {p.price || "₹0"}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
