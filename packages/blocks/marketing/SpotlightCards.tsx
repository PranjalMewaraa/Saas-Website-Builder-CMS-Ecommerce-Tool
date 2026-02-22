import React from "react";

export default function SpotlightCardsV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth = "xl",
    cards = [
      { title: "Fast Setup", description: "Go live quickly with visual blocks.", icon: "⚡", href: "#" },
      { title: "Design Flexibility", description: "Customize every section deeply.", icon: "🎨", href: "#" },
      { title: "Commerce Ready", description: "Built-in catalog, cart, and checkout flow.", icon: "🛒", href: "#" },
    ],
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
        {title ? <h2 className="text-3xl font-semibold text-slate-900">{title}</h2> : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(cards || []).map((card: any, idx: number) => (
            <a
              key={`${card.title || "card"}-${idx}`}
              href={card.href || "#"}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-2xl">{card.icon || "✨"}</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{card.title}</div>
              {card.description ? (
                <div className="mt-2 text-sm text-slate-600">{card.description}</div>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
