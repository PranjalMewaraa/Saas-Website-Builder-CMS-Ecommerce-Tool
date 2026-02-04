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
        className="mx-auto max-w-6xl px-6 text-center"
        style={{ maxWidth: maxWidth }}
      >
        {title && (
          <h3 className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </h3>
        )}

        <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
          {logos.length > 0
            ? logos.map((logo: string, i: number) => (
                <img
                  key={i}
                  src={logo}
                  alt={`Logo ${i + 1}`}
                  className="h-8 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 rounded-full bg-slate-100"
                />
              ))}
        </div>
      </div>
    </section>
  );
}
