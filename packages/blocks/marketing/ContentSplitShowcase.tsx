import React from "react";

const PLACEHOLDER =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";

export default function ContentSplitShowcaseV1(props: any) {
  const {
    title = "Build beautiful pages with confidence",
    subtitle = "Combine storytelling and commerce in a clean split layout.",
    bullets = ["Visual editor", "Reusable blocks", "Store-ready flow"],
    ctaText = "Get Started",
    ctaHref = "/",
    mediaUrl = PLACEHOLDER,
    mediaAlt = "",
    reverse = false,
    contentWidth = "xl",
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
      <div
        className={`mx-auto grid items-center gap-8 px-6 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
        style={{ maxWidth }}
      >
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-3 text-sm text-slate-600">{subtitle}</p>
          <ul className="mt-4 space-y-2">
            {(bullets || []).map((b: string, idx: number) => (
              <li key={`${b}-${idx}`} className="text-sm text-slate-700">
                • {b}
              </li>
            ))}
          </ul>
          <a
            href={ctaHref || "#"}
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {ctaText}
          </a>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <img src={mediaUrl || PLACEHOLDER} alt={mediaAlt} className="w-full rounded-xl object-cover" />
        </div>
      </div>
    </section>
  );
}
