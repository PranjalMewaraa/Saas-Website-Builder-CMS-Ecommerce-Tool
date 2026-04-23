import React from "react";

interface Feature {
  title: string;
  description: string;
}

interface FeaturesGridV1Props {
  title?: string;
  features?: Feature[];
  contentWidth?: string;
}

const defaultFeatures: Feature[] = [
  {
    title: "Lightning Fast Performance",
    description:
      "Built for speed. Pages load in under a second, giving your users the best experience possible.",
  },
  {
    title: "Fully Responsive Design",
    description:
      "Looks perfect on every device — mobile, tablet, desktop — no compromises.",
  },
  {
    title: "Easy Customization",
    description:
      "Change colors, fonts, spacing, and layout with simple Tailwind classes or your own CSS.",
  },
  {
    title: "SEO Optimized",
    description:
      "Clean semantic HTML, fast load times, and meta tags ready to help you rank higher.",
  },
  {
    title: "Dark Mode Ready",
    description:
      "Built-in support for dark mode — just toggle your system preference.",
  },
  {
    title: "Regular Updates",
    description:
      "Continuously improved with new components, patterns, and best practices.",
  },
];

export default function FeaturesGridV1({
  title,
  features = defaultFeatures,
  contentWidth,
}: FeaturesGridV1Props) {
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
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto px-6" style={{ maxWidth: maxWidth }}>
        {title && (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Modular blocks that stay cohesive across devices.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Feature {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-slate-400 transition group-hover:text-slate-500">
                  Learn more
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
