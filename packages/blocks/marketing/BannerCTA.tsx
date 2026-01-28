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
    <section className="w-full py-20 bg-black text-white">
      <div
        className={`max-w-5xl mx-auto px-6 text-${align}`}
        style={{ maxWidth: maxWidth }}
      >
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-gray-300 mb-8">{subtitle}</p>}

        {buttonText && (
          <a
            href={buttonHref || "#"}
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
