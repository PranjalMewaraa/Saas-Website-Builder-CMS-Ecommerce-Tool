export function StyleWrapper({
  style,
  children,
}: {
  style?: any;
  children: React.ReactNode;
}) {
  const o = style?.overrides ?? {};
  const bg = o.bg ?? { type: "none" };

  const padding = o.padding ?? {};
  const margin = o.margin ?? {};

  const css: React.CSSProperties = {
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,

    marginTop: margin.top,
    marginRight: margin.right,
    marginBottom: margin.bottom,
    marginLeft: margin.left,

    color: o.textColor || undefined,
    borderRadius: o.radius || undefined,

    boxShadow:
      o.shadow === "sm"
        ? "0 1px 3px rgba(0,0,0,.12)"
        : o.shadow === "md"
          ? "0 4px 12px rgba(0,0,0,.15)"
          : o.shadow === "lg"
            ? "0 12px 30px rgba(0,0,0,.25)"
            : undefined,

    border:
      o.border?.width && o.border?.color
        ? `${o.border.width}px ${o.border.style || "solid"} ${o.border.color}`
        : undefined,
  };

  // ✅ BACKGROUND SUPPORT
  if (bg.type === "solid" && bg.color) {
    css.background = bg.color;
  }

  if (bg.type === "image" && bg.imageUrl) {
    const overlay =
      bg.overlayColor && typeof bg.overlayOpacity === "number"
        ? `linear-gradient(${hexToRgba(bg.overlayColor, bg.overlayOpacity)}, ${hexToRgba(bg.overlayColor, bg.overlayOpacity)}), `
        : "";

    css.backgroundImage = `${overlay}url(${bg.imageUrl})`;
    css.backgroundSize = "cover";
    css.backgroundPosition = "center";
  }

  if (bg.type === "video") {
    // video handled inside Hero component
  }

  return (
    <div style={css} data-block-style-wrapper>
      {children}
    </div>
  );
}

function hexToRgba(hex: string, opacity: number) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
