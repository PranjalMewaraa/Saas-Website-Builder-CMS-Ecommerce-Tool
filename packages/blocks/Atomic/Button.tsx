import React from "react";

export default function AtomicButton(props: {
  label?: string;
  href?: string;
  target?: string;
}) {
  return (
    <a href={props.href || "#"} target={props.target || "_self"}>
      {props.label || "Button"}
    </a>
  );
}

