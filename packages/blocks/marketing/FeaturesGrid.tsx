import React from "react";

interface Feature {
  title: string;
  description: string;
}

interface FeaturesGridV1Props {
  title?: string;
  features?: Feature[];
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
}: FeaturesGridV1Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {title && (
          <h2 className="text-3xl font-bold mb-10 text-center">{title}</h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
