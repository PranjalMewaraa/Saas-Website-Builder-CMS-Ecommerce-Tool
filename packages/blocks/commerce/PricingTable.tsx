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
}: PricingTableV1Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {title && <h2 className="text-3xl font-bold mb-12">{title}</h2>}

        <div className="grid md:grid-cols-3 gap-8">
          {plans?.map((p, i) => (
            <div
              key={i}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{p?.name}</h3>
              <div className="text-3xl font-bold mb-4">{p?.price}</div>

              <ul className="space-y-2 text-sm text-gray-600 mb-6 min-h-[140px]">
                {p?.features?.map((f, j) => (
                  <li key={j}>✓ {f}</li>
                ))}
              </ul>

              <a
                href={p?.ctaHref || "#"}
                className={`inline-block px-6 py-3 rounded font-medium transition-colors ${
                  i === 1
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
