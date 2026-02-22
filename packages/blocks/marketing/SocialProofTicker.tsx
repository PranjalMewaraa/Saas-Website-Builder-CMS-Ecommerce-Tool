"use client";

import React from "react";

export default function SocialProofTickerV1(props: any) {
  const {
    items = [
      "A customer from Mumbai just purchased Premium Hoodie",
      "45 people bought in the last 24 hours",
      "Rated 4.8/5 by 1200+ customers",
    ],
    speedSec = 35,
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

  const list = Array.isArray(items) && items.length ? items : ["Social proof message"];

  return (
    <section className="w-full overflow-hidden bg-emerald-50 py-2 text-emerald-900">
      <div className="mx-auto px-4" style={{ maxWidth }}>
        <div className="sp-marquee">
          <div className="sp-track" style={{ animationDuration: `${Math.max(5, Number(speedSec || 35))}s` }}>
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
        .sp-marquee { overflow: hidden; white-space: nowrap; }
        .sp-track { display: inline-flex; min-width: 200%; animation: spmarquee linear infinite; }
        @keyframes spmarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}
