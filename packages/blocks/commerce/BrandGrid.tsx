import React from "react";

const defaults = [
  { name: "Urban Co", href: "#" },
  { name: "Nova Fit", href: "#" },
  { name: "Northline", href: "#" },
  { name: "Veloura", href: "#" },
  { name: "Aster", href: "#" },
  { name: "Motive", href: "#" },
];

export default function BrandGridV1(props: any) {
  const { title, subtitle, contentWidth, brands = defaults } = props || {};

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
    <section className="w-full bg-slate-50 py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? (
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {brands.map((b: any, idx: number) => (
            <a
              key={`${b.name || "brand"}-${idx}`}
              href={b.href || "#"}
              className="flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              {b.name || `Brand ${idx + 1}`}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
