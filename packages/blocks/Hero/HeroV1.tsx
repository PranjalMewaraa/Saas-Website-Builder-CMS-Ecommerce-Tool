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
            justifyContent: "flex-end",
          }
        : {
            textAlign: "left",
            alignItems: "flex-start",
            justifyContent: "flex-start",
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
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#0f172a", // slate-950
        minHeight: props.minHeight ?? 580,
        isolation: "isolate", // helps stacking context
      }}
    >
      {/* Background layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -10,
        }}
      >
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
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -10,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5), rgba(0,0,0,0.6))",
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          margin: "0 auto",
          padding: "4rem 1.25rem", // py-16 px-5
          display: "flex",
          flexDirection: "column",
          maxWidth: maxWidth,
          ...contentAlignStyle, // override alignment
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem", // gap-5
            maxWidth: "48rem", // max-w-3xl
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4.5rem)", // responsive scaling
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#ffffff",
              margin: 0,
            }}
          >
            {props.headline || "Headline"}
          </h1>

          {props.subhead && (
            <p
              style={{
                fontSize: "clamp(1.125rem, 3vw, 1.5rem)",
                color: "rgba(255,255,255,0.9)",
                fontWeight: 300,
                lineHeight: 1.6,
                maxWidth: "32rem",
                margin: 0,
              }}
            >
              {props.subhead}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              paddingTop: "1.5rem",
              flexWrap: "wrap",
              "@media (min-width: 640px)": {
                flexDirection: "row",
              },
            }}
          >
            {props.ctaText && (
              <a
                href={props.ctaHref || "#"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.875rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "0.75rem",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  transform: "scale(1)",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              >
                {props.ctaText}
              </a>
            )}

            {props.secondaryCtaText && (
              <a
                href={props.secondaryCtaHref || "#"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.875rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#ffffff",
                  backgroundColor: "transparent",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
              >
                {props.secondaryCtaText}
              </a>
            )}
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
