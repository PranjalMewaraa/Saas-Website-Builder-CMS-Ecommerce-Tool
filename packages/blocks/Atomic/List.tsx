import React from "react";

export default function AtomicList(props: {
  items?: string[];
  ordered?: boolean;
  icon?: string;
}) {
  const items = props.items || [];
  const icon = props.icon || "•";
  if (props.ordered) {
    return (
      <ol style={{ paddingLeft: "1.25rem" }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "0.35rem" }}>
            {item}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul style={{ paddingLeft: "0", listStyle: "none" }}>
      {items.map((item, idx) => (
        <li
          key={idx}
          style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem" }}
        >
          <span>{icon}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
