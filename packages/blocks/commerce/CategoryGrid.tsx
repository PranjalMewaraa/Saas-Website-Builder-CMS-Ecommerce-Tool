import React from "react";

const defaults = [
  { title: "T-Shirts", href: "/products?category=t-shirts" },
  { title: "Jeans", href: "/products?category=jeans" },
  { title: "Footwear", href: "/products?category=footwear" },
  { title: "Accessories", href: "/products?category=accessories" },
];

export default function CategoryGridV1(props: any) {
  const { title, subtitle, contentWidth, categories = defaults } = props || {};

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

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c: any, idx: number) => (
            <a
              key={`${c.title || "category"}-${idx}`}
              href={c.href || "#"}
              className="group flex h-32 items-end overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-sm font-semibold text-slate-900">
                {c.title || `Category ${idx + 1}`}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
