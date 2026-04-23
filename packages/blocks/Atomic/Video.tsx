import React from "react";

export default function AtomicVideo(props: {
  src?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}) {
  if (!props.src) {
    return (
      <div className="border border-dashed border-gray-300 p-6 text-xs text-gray-500">
        Video
      </div>
    );
  }
  return (
    <video
      src={props.src}
      poster={props.poster}
      autoPlay={props.autoplay}
      muted={props.muted}
      loop={props.loop}
      controls={props.controls ?? true}
    />
  );
}

