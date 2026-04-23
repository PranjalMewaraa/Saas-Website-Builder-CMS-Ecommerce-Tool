import React from "react";

export default function KPIRibbonV1(props: any) {
  const {
    contentWidth = "xl",
    items = [
      { value: "120K+", label: "Orders Processed", icon: "📦" },
      { value: "99.9%", label: "Platform Uptime", icon: "⚡" },
      { value: "4.8/5", label: "Customer Rating", icon: "⭐" },
      { value: "24/7", label: "Support", icon: "💬" },
    ],
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
    <section className="w-full bg-slate-900 py-4 text-white">
      <div className="mx-auto grid grid-cols-2 gap-4 px-6 md:grid-cols-4" style={{ maxWidth }}>
        {(items || []).map((item: any, idx: number) => (
          <div key={`${item.label || "kpi"}-${idx}`} className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-lg">{item.icon || "•"}</div>
            <div className="mt-1 text-xl font-semibold">{item.value}</div>
            <div className="mt-0.5 text-xs text-slate-200">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
