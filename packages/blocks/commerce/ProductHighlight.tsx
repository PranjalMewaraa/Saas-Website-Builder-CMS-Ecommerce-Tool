import React from "react";

export default function ProductHighlightV1(props: any) {
  const { title, description, image, ctaText, ctaHref, price, contentWidth } =
    props;
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
    <section className="py-20 bg-white">
      <div
        className=" mx-auto px-6 grid md:grid-cols-2 gap-10 items-center"
        style={{ maxWidth: maxWidth }}
      >
        <div>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>

          {price && <div className="text-2xl font-semibold mb-4">${price}</div>}

          {ctaText && (
            <a
              href={ctaHref || "#"}
              className="inline-block bg-black text-white px-6 py-3 rounded-lg"
            >
              {ctaText}
            </a>
          )}
        </div>

        {image && (
          <img src={image} alt={title} className="rounded-xl shadow-md" />
        )}
      </div>
    </section>
  );
}
