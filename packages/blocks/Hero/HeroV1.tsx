import React from "react";
import type { HeroProps } from "./../../schemas/blocks/hero";

export default function Hero(props: HeroProps) {
  const bgType =
    props.variant === "image"
      ? "image"
      : props.variant === "video"
        ? "video"
        : (props.bg?.type ?? "none");

  const overlayColor = props.bg?.overlayColor ?? "#0f172a";
  const overlayOpacity = props.bg?.overlayOpacity ?? 0.55;

  // Determine content alignment styles
  const contentAlignStyle =
    props.align === "center"
      ? { textAlign: "center", alignItems: "center", justifyContent: "center" }
      : props.align === "right"
        ? {
            textAlign: "right",
            alignItems: "flex-end",
            justifyContent: "center",
          }
        : {
            textAlign: "left",
            alignItems: "flex-start",
            justifyContent: "center",
          };

  // Responsive max-width fallback
  const maxWidth =
    props.contentWidth === "sm"
      ? "640px"
      : props.contentWidth === "md"
        ? "768px"
        : props.contentWidth === "lg"
          ? "1024px"
          : props.contentWidth === "xl"
            ? "1280px"
            : props.contentWidth === "2xl"
              ? "1536px"
              : "1280px";

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-slate-950"
      style={{ minHeight: props.minHeight ?? 580 }}
    >
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        {bgType === "image" && (
          <HeroBgImage
            url={props.bg?.imageUrl || ""}
            alt={props.bg?.imageAlt || "Background image"}
          />
        )}

        {bgType === "video" && (
          <HeroBgVideo
            url={props.bg?.videoUrl || ""}
            poster={props.bg?.posterUrl || ""}
            autoplay={!!props.bg?.videoAutoplay}
            muted={!!props.bg?.videoMuted}
            loop={!!props.bg?.videoLoop}
            controls={!!props.bg?.videoControls}
            preload={props.bg?.videoPreload || "metadata"}
          />
        )}
      </div>

      {/* Overlay */}
      {bgType !== "none" && (
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(2,6,23,0.2), rgba(2,6,23,0.6), rgba(2,6,23,0.8))",
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Content */}
      <div
        className="relative z-10 mx-auto flex w-full flex-col px-5"
        style={{
          maxWidth: maxWidth,
          minHeight: props.minHeight ?? 580,
          ...contentAlignStyle,
        }}
      >
        <div className="flex min-h-[inherit] w-full flex-col justify-center py-20 sm:py-24 lg:py-28">
        <div className="flex max-w-3xl flex-col gap-5">
          <h1
            className="m-0 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {props.headline || "Headline"}
          </h1>

          {props.subhead && (
            <p
              className="m-0 max-w-2xl text-lg text-white/80 sm:text-xl"
            >
              {props.subhead}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-3 pt-6"
          >
            {props.ctaText && (
              <a
                href={props.ctaHref || "#"}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-slate-900/30"
              >
                {props.ctaText}
              </a>
            )}

            {props.secondaryCtaText && (
              <a
                href={props.secondaryCtaHref || "#"}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/70 hover:text-white"
              >
                {props.secondaryCtaText}
              </a>
            )}
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
      <div
        style={{
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(to bottom right, #1e293b, #111827, #000000)",
        }}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      style={{
        height: "100%",
        width: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
      loading="eager"
      decoding="async"
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
      <div
        style={{
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(to bottom right, #1e293b, #111827, #000000)",
        }}
      />
    );
  }

  return (
    <video
      style={{
        height: "100%",
        width: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
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
