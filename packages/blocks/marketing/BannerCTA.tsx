import React from "react";

export default function BannerCTAV1(props: any) {
  const { title, subtitle, buttonText, buttonHref, align = "center" } = props;

  return (
    <section className="w-full py-20 bg-black text-white">
      <div className={`max-w-5xl mx-auto px-6 text-${align}`}>
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
