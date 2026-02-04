import React from "react";

export default function AtomicBadge(props: { text?: string }) {
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
        backgroundColor: "rgba(15,23,42,0.08)",
        color: "rgba(15,23,42,0.9)",
      }}
    >
      {props.text || "Badge"}
    </span>
  );
}
