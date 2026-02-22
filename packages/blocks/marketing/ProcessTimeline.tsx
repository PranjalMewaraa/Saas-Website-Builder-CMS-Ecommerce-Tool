import React from "react";

export default function ProcessTimelineV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth = "xl",
    steps = [
      { title: "Create Site", description: "Start with your brand and store setup." },
      { title: "Build Pages", description: "Compose with sections and blocks visually." },
      { title: "Launch & Grow", description: "Publish and iterate based on performance." },
    ],
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
              : "1280px";

  return (
    <section className="w-full bg-slate-50 py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? <h2 className="text-3xl font-semibold text-slate-900">{title}</h2> : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}

        <div className="mt-8 space-y-4">
          {(steps || []).map((step: any, idx: number) => (
            <div key={`${step.title || "step"}-${idx}`} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {idx + 1}
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">{step.title}</div>
                {step.description ? (
                  <div className="mt-1 text-sm text-slate-600">{step.description}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
