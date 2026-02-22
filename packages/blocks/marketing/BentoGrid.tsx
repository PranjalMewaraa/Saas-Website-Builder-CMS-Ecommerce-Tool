import React from "react";

const defaultItems = [
  {
    title: "Built for conversion",
    description: "High-impact layout patterns optimized for ecommerce.",
    badge: "Growth",
    size: "lg",
    href: "#",
  },
  {
    title: "Fast checkout flow",
    description: "Reduced friction from product page to order completion.",
    badge: "Speed",
    size: "sm",
    href: "#",
  },
  {
    title: "Content + commerce",
    description: "Blend storytelling and catalog blocks in one page.",
    badge: "Flexible",
    size: "sm",
    href: "#",
  },
];

export default function BentoGridV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth,
    items = defaultItems,
    cardSizePreset = "balanced",
  } = props || {};
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

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item: any, idx: number) => {
            const computedSize =
              item.size ||
              (cardSizePreset === "feature-first"
                ? idx === 0
                  ? "lg"
                  : "sm"
                : cardSizePreset === "compact"
                  ? "sm"
                  : idx % 3 === 0
                    ? "lg"
                    : "sm");
            const isLarge = String(computedSize || "sm") === "lg";
            return (
              <a
                key={`${item.title || "bento"}-${idx}`}
                href={item.href || "#"}
                className={`group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
                  isLarge ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                {item.badge ? (
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {item.badge}
                  </span>
                ) : null}
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                {item.description ? (
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                ) : null}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
