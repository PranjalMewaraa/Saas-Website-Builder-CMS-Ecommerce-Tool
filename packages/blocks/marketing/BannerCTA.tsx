import React from "react";

export default function BannerCTAV1(props: any) {
  const {
    title,
    subtitle,
    buttonText,
    buttonHref,
    align = "center",
    contentWidth,
  } = props;
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "text-center";

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
    <section className="w-full  py-20 text-white">
      <div
        className={`mx-auto max-w-5xl px-6 ${alignClass}`}
        style={{ maxWidth: maxWidth }}
      >
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h2>
        {subtitle && <p className="mt-4 text-lg text-slate-300">{subtitle}</p>}

        {buttonText && (
          <a
            href={buttonHref || "#"}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
