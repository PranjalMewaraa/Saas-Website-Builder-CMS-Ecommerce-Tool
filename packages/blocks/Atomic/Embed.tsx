import React from "react";

export default function AtomicEmbed(props: {
  code?: string;
  src?: string;
  title?: string;
}) {
  if (props.code) {
    return <div dangerouslySetInnerHTML={{ __html: props.code }} />;
  }
  if (props.src) {
    return (
      <iframe
        src={props.src}
        title={props.title || "Embed"}
        style={{ width: "100%", height: 360, border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <div style={{ border: "1px dashed rgba(0,0,0,0.2)", padding: 16 }}>
      Embed
    </div>
  );
}
