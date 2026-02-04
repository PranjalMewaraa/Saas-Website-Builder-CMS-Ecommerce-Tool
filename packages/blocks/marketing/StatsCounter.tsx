import React from "react";

interface Stat {
  value: string;
  label: string;
}

interface StatsCounterV1Props {
  stats?: Stat[];
  contentWidth?: string;
}

const defaultStats: Stat[] = [
  { value: "10K+", label: "Active Users" },
  { value: "4.9/5", label: "User Rating" },
  { value: "50+", label: "Countries Served" },
  { value: "2M+", label: "Tasks Completed" },
];

export default function StatsCounterV1({
  stats = defaultStats,
  contentWidth,
}: StatsCounterV1Props) {
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
    <section className="py-16 bg-slate-950 text-white">
      <div
        className="mx-auto grid grid-cols-2 gap-6 px-6 text-center md:grid-cols-4"
        style={{ maxWidth: maxWidth }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur"
          >
            <div className="text-3xl font-semibold md:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 text-xs uppercase tracking-wide text-white/70 md:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
