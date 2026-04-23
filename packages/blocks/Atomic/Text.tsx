import React from "react";

export default function AtomicText(props: {
  tag?: string;
  text?: string;
}) {
  const Tag: any = props.tag || "p";
  return <Tag>{props.text || ""}</Tag>;
}

