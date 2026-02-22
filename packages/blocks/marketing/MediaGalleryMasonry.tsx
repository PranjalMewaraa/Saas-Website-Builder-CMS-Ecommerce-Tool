import React from "react";

const PLACEHOLDER =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";

export default function MediaGalleryMasonryV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth = "xl",
    columns = 3,
    items = [{ image: PLACEHOLDER }, { image: PLACEHOLDER }, { image: PLACEHOLDER }],
  } = props || {};

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
    <section className="w-full bg-white py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? <h2 className="text-3xl font-semibold text-slate-900">{title}</h2> : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
        <div
          className="mt-8 gap-4"
          style={{ columnCount: Math.max(2, Math.min(6, Number(columns || 3))) }}
        >
          {(items || []).map((item: any, idx: number) => (
            <figure key={idx} className="mb-4 break-inside-avoid rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <img
                src={item.image || PLACEHOLDER}
                alt={item.alt || ""}
                className="w-full rounded-lg object-cover"
              />
              {item.caption ? (
                <figcaption className="mt-2 text-xs text-slate-600">{item.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
