import React from "react";

export default function NewsletterSignupV1({
  title,
  subtitle,
  contentWidth,
}: any) {
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
      <div
        className="mx-auto px-6 text-center"
        style={{ maxWidth: maxWidth }}
      >
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 sm:text-base">
            {subtitle}
          </p>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
            />
            <button className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-500">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
