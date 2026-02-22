import React from "react";

const defaultItems = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping usually takes 3-7 business days depending on your location.",
  },
  {
    question: "Can I return products?",
    answer:
      "Yes. We support hassle-free returns within 7 days for eligible products.",
  },
  {
    question: "Do you offer support?",
    answer:
      "Yes, our support team is available over email and chat for order and product queries.",
  },
];

export default function FAQAccordionV1(props: any) {
  const { title, subtitle, contentWidth, items = defaultItems } = props || {};

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
              : "960px";

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? (
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm text-slate-600">{subtitle}</p>
        ) : null}

        <div className="mt-8 space-y-3">
          {items.map((item: any, idx: number) => (
            <details
              key={`${item.question || "faq"}-${idx}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5"
            >
              <summary className="cursor-pointer list-none text-base font-medium text-slate-900">
                {item.question || `Question ${idx + 1}`}
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.answer || "Answer"}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
