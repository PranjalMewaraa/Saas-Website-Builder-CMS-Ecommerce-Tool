import React from "react";

export default function AtomicDivider(props: {
  orientation?: "horizontal" | "vertical";
  thickness?: string | number;
  color?: string;
  length?: string | number;
}) {
  const orientation = props.orientation || "horizontal";
  const thickness = props.thickness ?? 1;
  const length = props.length ?? (orientation === "horizontal" ? "100%" : 32);

  return (
    <div
      style={{
        width: orientation === "horizontal" ? length : thickness,
        height: orientation === "horizontal" ? thickness : length,
        backgroundColor: props.color || "#e5e7eb",
        borderRadius: 999,
      }}
      aria-hidden="true"
    />
  );
}
