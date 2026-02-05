import React from "react";

export default function AtomicIcon(props: {
  icon?: string;
  size?: string | number;
  color?: string;
}) {
  const size = props.size ?? 24;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: typeof size === "number" ? `${size}px` : size,
        color: props.color,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {props.icon || "★"}
    </span>
  );
}
