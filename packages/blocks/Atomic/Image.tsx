import React from "react";

export default function AtomicImage(props: {
  src?: string;
  alt?: string;
}) {
  if (!props.src) {
    return (
      <div className="border border-dashed border-gray-300 p-6 text-xs text-gray-500">
        Image
      </div>
    );
  }
  return <img src={props.src} alt={props.alt || ""} />;
}

