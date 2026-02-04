import React from "react";

// If you're using TypeScript, define the prop type like this:
interface Plan {
  name: string;
  price: string;
  features: string[];
  ctaText?: string;
  ctaHref?: string;
}

interface PricingTableV1Props {
  title?: string;
  plans?: Plan[];
  contentWidth?: string;
}

// You can also export the type if needed elsewhere
export type { PricingTableV1Props };

export default function PricingTableV1({
  title = "Choose Your Plan",
  plans = [
    {
      name: "Free",
      price: "$0",
      features: ["Basic access", "Community support", "5 projects"],
    },
    {
      name: "Pro",
      price: "$29",
      features: [
        "Everything in Free",
        "Priority support",
        "Unlimited projects",
        "Advanced analytics",
      ],
      ctaText: "Get Started",
      ctaHref: "#pro",
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "Team management",
      ],
      ctaText: "Contact Us",
      ctaHref: "/contact",
    },
  ],
  contentWidth,
}: PricingTableV1Props) {
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
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto px-6 text-center" style={{ maxWidth: maxWidth }}>
        {title && (
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Flexible plans that scale with your store.
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {plans?.map((p, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                i === 1
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p?.name}</h3>
              <div className="mt-3 text-3xl font-semibold">{p?.price}</div>

              <ul
                className={`mt-5 min-h-[140px] space-y-2 text-sm ${
                  i === 1 ? "text-white/80" : "text-slate-600"
                }`}
              >
                {p?.features?.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-0.5 text-sm">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={p?.ctaHref || "#"}
                className={`mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  i === 1
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {p?.ctaText || "Choose Plan"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
