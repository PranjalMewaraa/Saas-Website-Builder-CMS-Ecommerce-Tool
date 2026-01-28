import React from "react";

export default function NewsletterSignupV1({
  title,
  subtitle,
  contentWidth,
}: any) {
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
    <section className="py-20 bg-gray-100">
      <div
        className="max-w-xl mx-auto px-6 text-center"
        style={{ maxWidth: maxWidth }}
      >
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>

        <form className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="bg-black text-white px-4 rounded">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
