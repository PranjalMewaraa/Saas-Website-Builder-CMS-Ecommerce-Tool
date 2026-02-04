import React from "react";
import * as Icons from "lucide-react";

export default function AtomicIcon(props: {
  iconName?: string;
  icon?: string;
  size?: string | number;
  color?: string;
}) {
  const size = props.size ?? 24;
  const IconComponent = props.iconName
    ? (Icons as any)[props.iconName]
    : null;

  if (IconComponent) {
    return (
      <IconComponent
        size={typeof size === "number" ? size : parseFloat(String(size))}
        color={props.color}
      />
    );
  }

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
