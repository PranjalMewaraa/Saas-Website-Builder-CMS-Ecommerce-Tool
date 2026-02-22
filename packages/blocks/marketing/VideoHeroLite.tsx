import React from "react";

export default function VideoHeroLiteV1(props: any) {
  const {
    title = "Build and launch faster",
    subtitle = "Modern pages with visual control and ecommerce built in.",
    ctaText = "Get Started",
    ctaHref = "/",
    videoUrl = "",
    posterUrl = "",
    minHeight = 520,
    overlayOpacity = 0.45,
    contentWidth = "xl",
  } = props || {};

  const maxWidth =
    contentWidth === "sm"
      ? "640px"
      : contentWidth === "md"
        ? "768px"
        : contentWidth === "lg"
          ? "1024px"
          : contentWidth === "xl"
            ? "1280px"
            : contentWidth === "2xl"
              ? "1536px"
              : "1280px";

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight }}>
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}
      <div className="absolute inset-0 bg-slate-900" style={{ opacity: Math.max(0, Math.min(1, Number(overlayOpacity || 0.45))) }} />
      <div className="relative mx-auto flex min-h-[inherit] items-center px-6 py-20" style={{ maxWidth }}>
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">{title}</h2>
          <p className="mt-4 text-base text-slate-200">{subtitle}</p>
          <a
            href={ctaHref || "#"}
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
