"use client";

import React, { useState } from "react";

export default function InteractiveTabsV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth = "xl",
    tabs = [
      { label: "Overview", title: "Overview", content: "Explain your core value here." },
      { label: "Features", title: "Features", content: "List key capabilities and outcomes." },
      { label: "Use Cases", title: "Use Cases", content: "Describe where this works best." },
    ],
  } = props || {};

  const [active, setActive] = useState(0);
  const list = Array.isArray(tabs) && tabs.length ? tabs : [{ label: "Tab", content: "" }];
  const current = list[Math.max(0, Math.min(active, list.length - 1))];

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
        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            {list.map((tab: any, idx: number) => (
              <button
                key={`${tab.label || "tab"}-${idx}`}
                type="button"
                className={`rounded-full px-4 py-2 text-sm ${
                  idx === active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => setActive(idx)}
              >
                {tab.label || `Tab ${idx + 1}`}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xl font-semibold text-slate-900">{current?.title || current?.label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{current?.content || ""}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
