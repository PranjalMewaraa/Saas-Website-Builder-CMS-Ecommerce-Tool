import React from "react";

type BadgeProps = {
  text?: string;
  variant?: "type-1" | "type-2" | "type-3" | "type-4" | "type-5";
};

const VARIANT_STYLES: Record<
  NonNullable<BadgeProps["variant"]>,
  React.CSSProperties
> = {
  "type-1": {
    backgroundColor: "rgba(15,23,42,0.08)",
    color: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(15,23,42,0.12)",
  },
  "type-2": {
    backgroundColor: "rgba(37,99,235,0.12)",
    color: "rgba(30,64,175,0.95)",
    border: "1px solid rgba(37,99,235,0.35)",
  },
  "type-3": {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  "type-4": {
    backgroundColor: "rgba(16,185,129,0.12)",
    color: "rgba(4,120,87,0.95)",
    border: "1px solid rgba(16,185,129,0.35)",
  },
  "type-5": {
    backgroundColor: "rgba(244,63,94,0.12)",
    color: "rgba(159,18,57,0.95)",
    border: "1px solid rgba(244,63,94,0.35)",
  },
};

export default function AtomicBadge(props: BadgeProps) {
  const variant = props.variant || "type-1";
  const variantStyle = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: "12px",
        fontWeight: 600,
        ...variantStyle,
      }}
    >
      {props.text || "Badge"}
    </span>
  );
}
