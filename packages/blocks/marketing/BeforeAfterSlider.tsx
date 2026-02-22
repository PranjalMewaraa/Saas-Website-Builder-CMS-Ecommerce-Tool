"use client";

import React, { useState } from "react";

const DEFAULT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";

export default function BeforeAfterSliderV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth,
    beforeImage = DEFAULT_IMAGE,
    afterImage = DEFAULT_IMAGE,
    beforeLabel = "Before",
    afterLabel = "After",
    height = 420,
    handleStyle = "line",
  } = props || {};
  const [split, setSplit] = useState(50);

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
        {title ? (
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}

        <div className="mt-8">
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
            style={{ height: `${Math.max(240, Number(height || 420))}px` }}
          >
            <img src={beforeImage} alt={beforeLabel} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <img src={afterImage} alt={afterLabel} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-y-0" style={{ left: `${split}%` }}>
              <div className="-ml-px h-full w-0.5 bg-white/80 shadow" />
              {handleStyle === "circle" ? (
                <div className="-ml-5 absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900/70 shadow-lg" />
              ) : null}
              {handleStyle === "pill" ? (
                <div className="-ml-8 absolute top-1/2 h-8 w-16 -translate-y-1/2 rounded-full border border-white bg-slate-900/70 shadow-lg" />
              ) : null}
            </div>

            <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
              {beforeLabel}
            </div>
            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
              {afterLabel}
            </div>
          </div>
          <input
            type="range"
            min={5}
            max={95}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            className="mt-4 w-full"
            aria-label="Before after slider"
          />
        </div>
      </div>
    </section>
  );
}
