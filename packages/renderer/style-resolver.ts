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

  // radius
  innerStyle.borderRadius = px(s.radius ?? 0);

  // text color (supports CSS vars like var(--color-text))
  if (s.textColor) innerStyle.color = s.textColor;

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
    outerStyle.backgroundImage = `url(${bg.imageUrl})`;
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

  return { outerClass, innerClass, outerStyle, innerStyle };
}

function dirToDeg(dir: string) {
  if (dir === "to-r") return "90deg";
  if (dir === "to-l") return "270deg";
  if (dir === "to-b") return "180deg";
  return "0deg";
}
