"use client";

import React from "react";

export default function MarqueeStripV1(props: any) {
  const {
    items = ["Free Shipping", "Easy Returns", "Secure Checkout", "24x7 Support"],
    speedSec = 30,
    pauseOnHover = true,
    itemGap = 24,
    contentWidth = "2xl",
  } = props || {};

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
              : "1536px";

  const list = Array.isArray(items) && items.length ? items : ["Trust Signal"];

  return (
    <section className="w-full overflow-hidden bg-slate-900 py-2 text-white">
      <div className="mx-auto px-4" style={{ maxWidth }}>
        <div className={`marquee ${pauseOnHover ? "marquee-pause" : ""}`}>
          <div
            className="marquee-track"
            style={{ animationDuration: `${Math.max(5, Number(speedSec || 30))}s` }}
          >
            {[...list, ...list].map((item: string, idx: number) => (
              <span
                key={`${item}-${idx}`}
                className="inline-flex text-sm font-medium"
                style={{ marginInline: `${Math.max(0, Number(itemGap || 24)) / 2}px` }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .marquee { overflow: hidden; white-space: nowrap; }
        .marquee-track { display: inline-flex; min-width: 200%; animation: marquee linear infinite; }
        .marquee-pause:hover .marquee-track { animation-play-state: paused; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}
