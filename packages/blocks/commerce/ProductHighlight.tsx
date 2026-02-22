import React from "react";

export default function ProductHighlightV1(props: any) {
  const { title, description, image, ctaText, ctaHref, price, contentWidth } =
    props;
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
    <section className="py-20 bg-white">
      <div
        className="mx-auto grid items-center gap-10 px-6 md:grid-cols-2"
        style={{ maxWidth: maxWidth }}
      >
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Featured Product
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
          <p className="text-base text-slate-600">{description}</p>

          {price && (
            <div className="text-2xl font-semibold text-slate-900">
              ${price}
            </div>
          )}

          {ctaText && (
            <a
              href={ctaHref || "#"}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {ctaText}
            </a>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl bg-white text-sm text-slate-500">
              Product image placeholder
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
