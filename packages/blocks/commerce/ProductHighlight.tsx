import React from "react";

export default function ProductHighlightV1(props: any) {
  const { title, description, image, ctaText, ctaHref, price } = props;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
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
