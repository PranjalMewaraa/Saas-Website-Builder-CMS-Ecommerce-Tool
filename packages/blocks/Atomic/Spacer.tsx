import React from "react";

export default function AtomicSpacer(props: {
  axis?: "vertical" | "horizontal";
  size?: string | number;
}) {
  const axis = props.axis || "vertical";
  const size = props.size ?? 24;
  return (
    <div
      style={{
        width: axis === "horizontal" ? size : "100%",
        height: axis === "vertical" ? size : "100%",
      }}
      aria-hidden="true"
    />
  );
}
