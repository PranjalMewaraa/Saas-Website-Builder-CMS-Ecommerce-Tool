import React from "react";

export default function LogosCloudV1({ title, logos = [], contentWidth }: any) {
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
    <section className="py-16 bg-white">
      <div
        className="max-w-6xl mx-auto px-6 text-center"
        style={{ maxWidth: maxWidth }}
      >
        {title && <h3 className="mb-8 text-lg font-medium">{title}</h3>}

        <div className="flex flex-wrap justify-center gap-10 items-center opacity-70">
          {logos.map((logo: string, i: number) => (
            <img key={i} src={logo} className="h-8" />
          ))}
        </div>
      </div>
    </section>
  );
}
