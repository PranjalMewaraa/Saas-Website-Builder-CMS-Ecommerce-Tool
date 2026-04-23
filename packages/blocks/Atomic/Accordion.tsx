import React from "react";

export default function AtomicAccordion(props: {
  items?: { title: string; content: string }[];
}) {
  const items = props.items || [];
  return (
    <div>
      {items.map((item, idx) => (
        <details
          key={idx}
          style={{
            border: "1px solid rgba(15,23,42,0.12)",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 8,
            background: "#fff",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            {item.title}
          </summary>
          <div style={{ marginTop: 8, fontSize: 14, color: "rgba(15,23,42,0.7)" }}>
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
