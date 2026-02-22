import React from "react";

export default function StickyPromoBarV1(props: any) {
  const {
    text = "Free shipping on orders above ₹999",
    ctaText = "Shop Now",
    ctaHref = "/products",
    position = "top",
    theme = "dark",
  } = props || {};

  const dockClass = position === "bottom" ? "bottom-0" : "top-0";
  const themeMap: Record<string, { bar: string; cta: string }> = {
    dark: {
      bar: "border-slate-800 bg-slate-900 text-white",
      cta: "bg-white text-slate-900 hover:bg-slate-100",
    },
    brand: {
      bar: "border-blue-700 bg-blue-600 text-white",
      cta: "bg-white text-blue-700 hover:bg-blue-50",
    },
    light: {
      bar: "border-slate-200 bg-white text-slate-900",
      cta: "bg-slate-900 text-white hover:bg-slate-800",
    },
    success: {
      bar: "border-emerald-700 bg-emerald-600 text-white",
      cta: "bg-white text-emerald-700 hover:bg-emerald-50",
    },
    danger: {
      bar: "border-rose-700 bg-rose-600 text-white",
      cta: "bg-white text-rose-700 hover:bg-rose-50",
    },
  };
  const themeStyle = themeMap[theme] || themeMap.dark;

  return (
    <section className={`pointer-events-none fixed inset-x-0 ${dockClass} z-40`}>
      <div className="pointer-events-auto mx-auto max-w-6xl px-3 py-2">
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-sm shadow-lg ${themeStyle.bar}`}
        >
          <span className="line-clamp-1">{text}</span>
          <a
            href={ctaHref || "#"}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${themeStyle.cta}`}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
