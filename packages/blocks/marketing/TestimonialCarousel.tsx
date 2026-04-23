"use client";

import React, { useEffect, useMemo, useState } from "react";

const defaults = [
  {
    quote: "The builder helped us launch our store in days, not weeks.",
    name: "Aarav Shah",
    role: "Founder, Northline",
    rating: 5,
  },
  {
    quote: "Visual editing is clean and fast. We ship pages much quicker now.",
    name: "Riya Mehta",
    role: "Marketing Lead, Nova Fit",
    rating: 5,
  },
  {
    quote: "Great balance of flexibility and control for product-focused pages.",
    name: "Dev Malhotra",
    role: "Ecommerce Manager, Urban Co",
    rating: 4,
  },
];

export default function TestimonialCarouselV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth,
    testimonials = defaults,
    autoplayMs = 5000,
    transition = "fade",
  } = props || {};
  const [active, setActive] = useState(0);

  const list = useMemo(
    () => (Array.isArray(testimonials) && testimonials.length ? testimonials : defaults),
    [testimonials],
  );

  useEffect(() => {
    if (!autoplayMs || Number(autoplayMs) < 1000 || list.length <= 1) return;
    const id = setInterval(() => {
      setActive((p) => (p + 1) % list.length);
    }, Number(autoplayMs));
    return () => clearInterval(id);
  }, [autoplayMs, list.length]);

  const maxWidth =
    contentWidth === "auto"
      ? ""
      : contentWidth === "sm"
      ? "640px"
      : contentWidth === "md"
        ? "768px"
        : contentWidth === "lg"
          ? "1024px"
          : contentWidth === "xl"
            ? "1280px"
            : contentWidth === "2xl"
              ? "1536px"
              : "900px";

  const t = list[active] || defaults[0];
  const rating = Math.max(1, Math.min(5, Number(t.rating || 5)));

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? (
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}

        <div
          className={`mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 ${
            transition === "fade"
              ? "transition-opacity duration-300"
              : transition === "slide"
                ? "transition-all duration-300"
                : ""
          }`}
        >
          <div className="text-amber-500">{Array.from({ length: rating }).map((_, i) => "★")}</div>
          <blockquote className="mt-3 text-lg font-medium leading-8 text-slate-900">
            “{t.quote}”
          </blockquote>
          <div className="mt-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{t.name}</span>
            {t.role ? <span> · {t.role}</span> : null}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-white"
              onClick={() => setActive((p) => (p - 1 + list.length) % list.length)}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-white"
              onClick={() => setActive((p) => (p + 1) % list.length)}
            >
              Next
            </button>
            <div className="ml-auto text-xs text-slate-500">
              {active + 1} / {list.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
