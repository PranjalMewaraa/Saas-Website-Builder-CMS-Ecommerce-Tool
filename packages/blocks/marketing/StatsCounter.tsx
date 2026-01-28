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
    <section className="py-16 bg-black text-white">
      <div
        className=" mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        style={{ maxWidth: maxWidth }}
      >
        {stats.map((s, i) => (
          <div key={i}>
            <div className="text-3xl md:text-4xl font-bold">{s.value}</div>
            <div className="text-sm md:text-base opacity-80 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
