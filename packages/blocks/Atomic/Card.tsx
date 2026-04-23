import React from "react";

export default function AtomicCard(props: {
  title?: string;
  body?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.12)",
        borderRadius: 16,
        padding: 16,
        background: "#fff",
      }}
    >
      {props.imageUrl ? (
        <img
          src={props.imageUrl}
          alt={props.title || "Card image"}
          style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
        />
      ) : null}
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {props.title || "Card title"}
      </div>
      <div style={{ fontSize: 14, color: "rgba(15,23,42,0.7)" }}>
        {props.body || "Card description goes here."}
      </div>
      {props.buttonText ? (
        <a
          href={props.buttonHref || "#"}
          style={{
            display: "inline-flex",
            marginTop: 12,
            padding: "6px 12px",
            borderRadius: 999,
            background: "#0f172a",
            color: "#fff",
            fontSize: 12,
          }}
        >
          {props.buttonText}
        </a>
      ) : null}
    </div>
  );
}
