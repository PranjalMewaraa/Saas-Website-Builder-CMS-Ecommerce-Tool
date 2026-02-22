import React from "react";

export default function StickyPromoBarV1(props: any) {
  const {
    text = "Free shipping on orders above ₹999",
    ctaText = "Shop Now",
    ctaHref = "/products",
    position = "top",
    align = "center",
    offsetX = 12,
    offsetY = 8,
    maxWidth = "1152px",
    radius = 12,
    dismissible = false,
    theme = "dark",
    bgColor,
    textColor,
    ctaBgColor,
    ctaTextColor,
    __editor = false,
  } = props || {};

  const dockClass = position === "bottom" ? "bottom-0" : "top-0";
  const alignClass =
    align === "left"
      ? "justify-start"
      : align === "right"
        ? "justify-end"
        : "justify-center";
  const themeMap: Record<string, { bar: string; cta: string }> = {
    dark: {
      bar: "border-slate-800 bg-slate-900 text-white",
      cta: "bg-white text-slate-900 hover:bg-slate-100",
    },
    brand: {
      bar: "border-blue-700 bg-blue-600 text-white",
      cta: "bg-white text-blue-700 hover:bg-blue-50",
    },
    light: {
      bar: "border-slate-200 bg-white text-slate-900",
      cta: "bg-slate-900 text-white hover:bg-slate-800",
    },
    success: {
      bar: "border-emerald-700 bg-emerald-600 text-white",
      cta: "bg-white text-emerald-700 hover:bg-emerald-50",
    },
    danger: {
      bar: "border-rose-700 bg-rose-600 text-white",
      cta: "bg-white text-rose-700 hover:bg-rose-50",
    },
  };
  const themeStyle = themeMap[theme] || themeMap.dark;
  const barStyle: React.CSSProperties = {
    borderRadius: `${Math.max(0, Number(radius || 12))}px`,
    ...(bgColor ? { background: bgColor } : {}),
    ...(textColor ? { color: textColor } : {}),
  };
  const ctaStyle: React.CSSProperties = {
    ...(ctaBgColor ? { background: ctaBgColor } : {}),
    ...(ctaTextColor ? { color: ctaTextColor } : {}),
  };

  return (
    <section
      className={
        __editor
          ? "pointer-events-none relative z-10"
          : `pointer-events-none fixed inset-x-0 ${dockClass} z-40`
      }
    >
      <div
        className={`pointer-events-auto mx-auto flex px-3 ${alignClass}`}
        style={{
          maxWidth: maxWidth || "1152px",
          paddingTop: position === "top" ? `${Math.max(0, Number(offsetY || 8))}px` : undefined,
          paddingBottom: position === "bottom" ? `${Math.max(0, Number(offsetY || 8))}px` : undefined,
          paddingLeft: `${Math.max(0, Number(offsetX || 12))}px`,
          paddingRight: `${Math.max(0, Number(offsetX || 12))}px`,
        }}
      >
        <div
          className={`w-full max-w-6xl flex items-center justify-between gap-3 border px-4 py-2 text-sm shadow-lg ${themeStyle.bar}`}
          style={barStyle}
        >
          <span className="line-clamp-1">{text}</span>
          <div className="flex items-center gap-2">
            <a
              href={ctaHref || "#"}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${themeStyle.cta}`}
              style={ctaStyle}
            >
              {ctaText}
            </a>
            {dismissible ? (
              <button
                type="button"
                className="h-6 w-6 rounded-full border border-white/30 text-[10px] opacity-80"
                aria-label="Dismiss promo"
              >
                X
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
