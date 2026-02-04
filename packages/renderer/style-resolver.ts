type Style = any;

function px(n: number) {
  return `${n}px`;
}

function shadowClass(shadow: string) {
  if (shadow === "sm") return "shadow-sm";
  if (shadow === "md") return "shadow-md";
  if (shadow === "lg") return "shadow-lg";
  return "";
}

function maxWidthClass(maxWidth: string) {
  if (maxWidth === "sm") return "max-w-screen-sm";
  if (maxWidth === "md") return "max-w-screen-md";
  if (maxWidth === "lg") return "max-w-screen-lg";
  if (maxWidth === "xl") return "max-w-screen-xl";
  return "max-w-screen-2xl";
}

function textAlignClass(text: string) {
  if (text === "center") return "text-center";
  if (text === "right") return "text-right";
  return "text-left";
}

export function resolveWrapperStyle(style: Style) {
  const s = style;
  const container = s.container ?? "boxed";
  const maxWidth = s.maxWidth ?? "xl";

  const outerClass = ["w-full", textAlignClass(s.align?.text ?? "left")]
    .filter(Boolean)
    .join(" ");

  const innerClass = [
    container === "boxed" ? "mx-auto px-4" : "",
    container === "boxed" ? maxWidthClass(maxWidth) : "",
    shadowClass(s.shadow ?? "none"),
  ]
    .filter(Boolean)
    .join(" ");

  const outerStyle: Record<string, string> = {};
  const innerStyle: Record<string, string> = {};

  // padding
  const pad = s.padding ?? {};
  innerStyle.paddingTop = px(pad.top ?? 0);
  innerStyle.paddingRight = px(pad.right ?? 0);
  innerStyle.paddingBottom = px(pad.bottom ?? 0);
  innerStyle.paddingLeft = px(pad.left ?? 0);

  // margin
  const mar = s.margin ?? {};
  outerStyle.marginTop = px(mar.top ?? 0);
  outerStyle.marginRight = px(mar.right ?? 0);
  outerStyle.marginBottom = px(mar.bottom ?? 0);
  outerStyle.marginLeft = px(mar.left ?? 0);

  if (s.display) {
    innerStyle.display = s.display;
  } else if (s.align?.items || s.align?.justify || typeof s.gap === "number") {
    innerStyle.display = "flex";
  }
  if (typeof s.gap === "number") innerStyle.gap = px(s.gap);

  // radius
  innerStyle.borderRadius = px(s.radius ?? 0);

  // text color (supports CSS vars like var(--color-text))
  if (s.textColor) innerStyle.color = s.textColor;
  if (s.fontSize) innerStyle.fontSize = px(s.fontSize);
  if (s.fontWeight) innerStyle.fontWeight = String(s.fontWeight);
  if (s.lineHeight) innerStyle.lineHeight = px(s.lineHeight);
  if (s.letterSpacing !== undefined)
    innerStyle.letterSpacing = `${s.letterSpacing}px`;
  if (s.textTransform) innerStyle.textTransform = s.textTransform;

  // background
  const bg = s.bg ?? { type: "none" };
  if (bg.type === "solid" && bg.color) {
    outerStyle.background = bg.color;
  }
  if (bg.type === "gradient" && bg.gradient?.from && bg.gradient?.to) {
    const dir = bg.gradient.direction ?? "to-r";
    outerStyle.background = `linear-gradient(${dirToDeg(dir)}, ${bg.gradient.from}, ${bg.gradient.to})`;
  }
  if (bg.type === "image" && bg.imageUrl) {
    const overlayColor = bg.overlayColor;
    const overlayOpacity =
      typeof bg.overlayOpacity === "number" ? bg.overlayOpacity : 0.35;

    if (overlayColor) {
      // If overlayColor is hex, apply opacity properly.
      // If it's rgba()/rgb()/var(), we use it as-is (opacity may not apply).
      const overlay = toOverlay(overlayColor, overlayOpacity);
      outerStyle.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url(${bg.imageUrl})`;
    } else {
      outerStyle.backgroundImage = `url(${bg.imageUrl})`;
    }

    outerStyle.backgroundSize = "cover";
    outerStyle.backgroundPosition = "center";
  }

  // border
  const border = s.border ?? {};
  if (border.enabled) {
    innerStyle.borderStyle = "solid";
    innerStyle.borderWidth = px(border.width ?? 1);
    innerStyle.borderColor = border.color ?? "rgba(0,0,0,0.12)";
  }

  if (s.align?.items) innerStyle.alignItems = s.align.items;
  if (s.align?.justify) innerStyle.justifyContent = s.align.justify;

  return { outerClass, innerClass, outerStyle, innerStyle };
}

function dirToDeg(dir: string) {
  if (dir === "to-r") return "90deg";
  if (dir === "to-l") return "270deg";
  if (dir === "to-b") return "180deg";
  return "0deg";
}
function toOverlay(color: string, opacity: number) {
  // If hex, convert to rgba with opacity
  if (color.startsWith("#")) return hexToRgba(color, opacity);

  // If already rgba, use it (ignore opacity slider; user controls alpha in rgba)
  if (color.startsWith("rgba(")) return color;

  // If rgb(), we can’t safely inject alpha without parsing; use as-is
  // If var(--token), use as-is (recommend user use rgba token if needed)
  return color;
}

function hexToRgba(hex: string, opacity: number) {
  const clean = hex.replace("#", "").trim();
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

  const a = Math.max(0, Math.min(1, opacity));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
