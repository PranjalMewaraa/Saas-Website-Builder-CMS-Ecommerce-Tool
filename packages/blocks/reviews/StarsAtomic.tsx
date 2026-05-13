import React from "react";

type Props = {
  rating?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
};

const SIZE_PX = { xs: 12, sm: 14, md: 18, lg: 24 };

function Star({ fill, px }: { fill: number; px: number }) {
  const id = `star-${Math.random().toString(36).slice(2)}`;
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <defs>
        <linearGradient id={id}>
          <stop offset={`${pct}%`} stopColor="#f59e0b" />
          <stop offset={`${pct}%`} stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.6l2.95 6.0 6.62.96-4.79 4.67 1.13 6.58L12 17.77 6.09 20.81 7.22 14.23 2.43 9.56l6.62-.96L12 2.6z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

export default function StarsAtomic(props: Props) {
  const rating = Math.max(0, Math.min(5, Number(props.rating ?? 0)));
  const px = SIZE_PX[props.size ?? "md"];
  const stars = [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.min(1, rating - i)));
  return (
    <span
      aria-label={`${rating.toFixed(1)} out of 5`}
      style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
    >
      {stars.map((fill, i) => (
        <Star key={i} fill={fill} px={px} />
      ))}
      {props.showCount && typeof props.count === "number" ? (
        <span style={{ marginLeft: 6, fontSize: px - 2, color: "#6b7280" }}>
          ({props.count})
        </span>
      ) : null}
    </span>
  );
}
