import React from "react";
import type { HeroProps } from "./../../schemas/blocks/hero";

function widthClass(w: HeroProps["contentWidth"]) {
  if (w === "sm") return "max-w-screen-sm";
  if (w === "md") return "max-w-screen-md";
  if (w === "lg") return "max-w-screen-lg";
  return "max-w-screen-xl";
}

function alignClass(a: HeroProps["align"]) {
  if (a === "center") return "text-center items-center";
  if (a === "right") return "text-right items-end";
  return "text-left items-start";
}

export default function Hero(props: HeroProps) {
  const bgType =
    props.variant === "image"
      ? "image"
      : props.variant === "video"
        ? "video"
        : (props.bg?.type ?? "none");

  const overlayOpacity = props.bg?.overlayOpacity ?? 0.45;
  const overlayColor = props.bg?.overlayColor ?? "#000000";

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: props.minHeight }}
    >
      {/* Background layer */}
      {bgType === "image" ? (
        <HeroBgImage
          url={props.bg?.imageUrl || ""}
          alt={props.bg?.imageAlt || ""}
        />
      ) : null}

      {bgType === "video" ? (
        <HeroBgVideo
          url={props.bg?.videoUrl || ""}
          poster={props.bg?.posterUrl || ""}
          autoplay={!!props.bg?.videoAutoplay}
          muted={!!props.bg?.videoMuted}
          loop={!!props.bg?.videoLoop}
          controls={!!props.bg?.videoControls}
          preload={props.bg?.videoPreload || "metadata"}
        />
      ) : null}

      {/* Overlay */}
      {bgType !== "none" ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      ) : null}

      {/* Content */}
      <div className="relative z-10">
        <div className={`mx-auto px-4 py-14 ${widthClass(props.contentWidth)}`}>
          <div className={`flex flex-col gap-4 ${alignClass(props.align)}`}>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              {props.headline}
            </h1>
            {props.subhead ? (
              <p className="text-base md:text-lg opacity-90 max-w-2xl">
                {props.subhead}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              {props.ctaText ? (
                <a
                  href={props.ctaHref || "#"}
                  className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium border bg-black text-white"
                >
                  {props.ctaText}
                </a>
              ) : null}

              {props.secondaryCtaText ? (
                <a
                  href={props.secondaryCtaHref || "#"}
                  className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium border"
                >
                  {props.secondaryCtaText}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBgImage({ url, alt }: { url: string; alt: string }) {
  if (!url) {
    return (
      <div className="absolute inset-0 bg-gray-100">
        <div className="absolute inset-0 opacity-50 bg-gradient-to-b from-black/10 to-black/30" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt || ""}
      className="absolute inset-0 h-full w-full object-cover"
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  );
}

function HeroBgVideo({
  url,
  poster,
  autoplay,
  muted,
  loop,
  controls,
  preload,
}: {
  url: string;
  poster: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  preload: "none" | "metadata" | "auto";
}) {
  if (!url) {
    return (
      <div className="absolute inset-0 bg-gray-100">
        <div className="absolute inset-0 opacity-50 bg-gradient-to-b from-black/10 to-black/30" />
      </div>
    );
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={url}
      poster={poster || undefined}
      autoPlay={autoplay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline
      preload={preload}
    />
  );
}
