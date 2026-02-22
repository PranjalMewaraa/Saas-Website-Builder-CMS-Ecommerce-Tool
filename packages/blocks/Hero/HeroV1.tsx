import React from "react";
import type { HeroProps } from "./../../schemas/blocks/hero";

type HeroMode = "basic" | "image" | "video";

export default function Hero(props: HeroProps) {
  const heroPreset = props.heroPreset || "Basic";
  const bgType: HeroMode =
    props.variant === "image"
      ? "image"
      : props.variant === "video"
        ? "video"
        : (props.bg?.type as HeroMode) || "basic";

  const maxWidth =
    props.contentWidth === "auto"
      ? ""
      : props.contentWidth === "sm"
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

  const overlayColor = props.bg?.overlayColor ?? "#0f172a";
  const overlayOpacity = props.bg?.overlayOpacity ?? 0.15;
  const minHeight = props.minHeight ?? 580;
  const basicBgColor = props.bg?.color || "#0f172a";

  switch (heroPreset) {
    case "Split":
    case "Advanced":
      return (
        <HeroShell
          props={props}
          bgType={bgType}
          maxWidth={maxWidth}
          minHeight={minHeight}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          basicBgColor={basicBgColor}
        >
          <SplitHeroContent props={props} minHeight={minHeight} />
        </HeroShell>
      );
    case "Centered":
      return (
        <HeroShell
          props={props}
          bgType={bgType}
          maxWidth={maxWidth}
          minHeight={minHeight}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          basicBgColor={basicBgColor}
        >
          <CenteredHeroContent props={props} minHeight={minHeight} />
        </HeroShell>
      );
    case "Promo":
      return (
        <HeroShell
          props={props}
          bgType={bgType}
          maxWidth={maxWidth}
          minHeight={minHeight}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          basicBgColor={basicBgColor}
        >
          <PromoHeroContent props={props} minHeight={minHeight} />
        </HeroShell>
      );
    case "Basic":
    default:
      return (
        <HeroShell
          props={props}
          bgType={bgType}
          maxWidth={maxWidth}
          minHeight={minHeight}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          basicBgColor={basicBgColor}
        >
          <BasicHeroContent props={props} minHeight={minHeight} />
        </HeroShell>
      );
  }
}

function HeroShell({
  props,
  bgType,
  maxWidth,
  minHeight,
  overlayColor,
  overlayOpacity,
  basicBgColor,
  children,
}: {
  props: HeroProps;
  bgType: HeroMode;
  maxWidth: string;
  minHeight: number;
  overlayColor: string;
  overlayOpacity: number;
  basicBgColor: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative isolate w-full overflow-hidden"
      style={{
        minHeight,
        backgroundColor: bgType === "basic" ? basicBgColor : "transparent",
      }}
    >
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

      {bgType !== "basic" ? (
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      ) : null}

      <div className="relative z-10 mx-auto w-full px-5" style={{ maxWidth }}>
        {children}
      </div>
    </section>
  );
}

function BasicHeroContent({
  props,
  minHeight,
}: {
  props: HeroProps;
  minHeight: number;
}) {
  const alignClass =
    props.align === "center"
      ? "items-center text-center"
      : props.align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <div
      className={`flex min-h-[inherit] w-full flex-col justify-center py-20 sm:py-24 lg:py-28 ${alignClass}`}
      style={{ minHeight }}
    >
      <div className="flex max-w-3xl flex-col gap-5">
        <h1 className="m-0 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {props.headline || "Headline"}
        </h1>
        {props.subhead ? (
          <p className="m-0 max-w-2xl text-lg text-white sm:text-xl">
            {props.subhead}
          </p>
        ) : null}
        <HeroActions props={props} />
      </div>
    </div>
  );
}

function SplitHeroContent({
  props,
  minHeight,
}: {
  props: HeroProps;
  minHeight: number;
}) {
  const panelTitle = (props as any).splitPanelTitle || "Highlights";
  const panelItems = Array.isArray((props as any).splitHighlights)
    ? ((props as any).splitHighlights as string[]).filter(Boolean)
    : [
        "Fast page load and clean UX",
        "Visual control with reusable blocks",
        "Catalog and checkout ready",
      ];
  const panelCtaText = (props as any).splitPanelCtaText || "";
  const panelCtaHref = (props as any).splitPanelCtaHref || "#";

  return (
    <div
      className="grid min-h-[inherit] items-center gap-8 py-16 md:grid-cols-2 lg:py-20"
      style={{ minHeight }}
    >
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {props.headline || "Headline"}
        </h1>
        {props.subhead ? (
          <p className="mt-4 text-lg text-white/90">{props.subhead}</p>
        ) : null}
        <HeroActions props={props} />
      </div>
      <div className="rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-[0.25em] text-white/70">
          {panelTitle}
        </div>
        <ul className="mt-4 space-y-3 text-sm text-white/90">
          {panelItems.map((item, idx) => (
            <li key={`${item}-${idx}`}>• {item}</li>
          ))}
        </ul>
        {panelCtaText ? (
          <a
            href={panelCtaHref}
            className="mt-5 inline-flex rounded-full border border-white/40 px-4 py-2 text-xs font-semibold text-white hover:border-white/70"
          >
            {panelCtaText}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function CenteredHeroContent({
  props,
  minHeight,
}: {
  props: HeroProps;
  minHeight: number;
}) {
  const badgeText = (props as any).centeredBadgeText || "Built with Visual Builder";
  const trustText = (props as any).centeredTrustLine || "";
  const stats = Array.isArray((props as any).centeredStats)
    ? ((props as any).centeredStats as Array<{ value?: string; label?: string }>).filter(
        (s) => s?.value || s?.label,
      )
    : [];

  return (
    <div
      className="flex min-h-[inherit] flex-col items-center justify-center py-16 text-center sm:py-20"
      style={{ minHeight }}
    >
      <div className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
        {badgeText}
      </div>
      <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {props.headline || "Headline"}
      </h1>
      {props.subhead ? (
        <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
          {props.subhead}
        </p>
      ) : null}
      <HeroActions props={props} centered />
      {trustText ? (
        <p className="mt-6 text-xs uppercase tracking-[0.24em] text-white/70">
          {trustText}
        </p>
      ) : null}
      {stats.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, idx) => (
            <div
              key={`${s.value || "v"}-${idx}`}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-3"
            >
              <div className="text-lg font-semibold text-white">{s.value || "-"}</div>
              <div className="text-xs text-white/70">{s.label || ""}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PromoHeroContent({
  props,
  minHeight,
}: {
  props: HeroProps;
  minHeight: number;
}) {
  const promoBadge = (props as any).promoBadgeText || "Limited Time Offer";
  const promoCode = (props as any).promoCode || "";
  const promoNote = (props as any).promoNote || "";
  const promoBullets = Array.isArray((props as any).promoBullets)
    ? ((props as any).promoBullets as string[]).filter(Boolean)
    : [];

  return (
    <div
      className="flex min-h-[inherit] items-center py-14 sm:py-18"
      style={{ minHeight }}
    >
      <div className="w-full rounded-2xl border border-white/20 bg-black/35 p-6 backdrop-blur md:p-10">
        <div className="inline-flex rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100">
          {promoBadge}
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
          {props.headline || "Headline"}
        </h1>
        {props.subhead ? (
          <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-lg">
            {props.subhead}
          </p>
        ) : null}
        {promoCode ? (
          <div className="mt-4 inline-flex items-center rounded-full border border-amber-200/40 bg-amber-100/10 px-4 py-1.5 text-sm font-semibold text-amber-100">
            Code: {promoCode}
          </div>
        ) : null}
        {promoNote ? (
          <p className="mt-3 text-sm text-white/80">{promoNote}</p>
        ) : null}
        {promoBullets.length ? (
          <ul className="mt-4 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
            {promoBullets.map((item, idx) => (
              <li key={`${item}-${idx}`}>• {item}</li>
            ))}
          </ul>
        ) : null}
        <HeroActions props={props} />
      </div>
    </div>
  );
}

function HeroActions({
  props,
  centered = false,
}: {
  props: HeroProps;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 pt-6 ${centered ? "justify-center" : ""}`}
    >
      {props.ctaText ? (
        <a
          href={props.ctaHref || "#"}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-slate-900/30"
        >
          {props.ctaText}
        </a>
      ) : null}
      {props.secondaryCtaText ? (
        <a
          href={props.secondaryCtaHref || "#"}
          className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/70 hover:text-white"
        >
          {props.secondaryCtaText}
        </a>
      ) : null}
    </div>
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
