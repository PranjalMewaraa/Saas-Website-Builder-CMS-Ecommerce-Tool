import type React from "react";

type BoxSides = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
};

export type LayoutStyle = {
  width?: number | string;
  maxWidth?: number | string;
  height?: number | string;
  maxHeight?: number | string;
  padding?: BoxSides;
  margin?: BoxSides;
  textAlign?: "left" | "center" | "right";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: number | string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number | string;
  radius?: number | string;
  shadow?: "none" | "sm" | "md" | "lg";
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
};

function toCssSize(value?: number | string) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return `${value}px`;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function shadowValue(shadow?: LayoutStyle["shadow"]) {
  if (!shadow || shadow === "none") return undefined;
  if (shadow === "sm") return "0 1px 2px rgba(0,0,0,0.08)";
  if (shadow === "md") return "0 6px 18px rgba(0,0,0,0.12)";
  return "0 12px 30px rgba(0,0,0,0.18)";
}

function applyBox(
  style: Record<string, string>,
  prefix: "padding" | "margin",
  box?: BoxSides,
) {
  if (!box) return;
  const top = toCssSize(box.top) ?? "0px";
  const right = toCssSize(box.right) ?? "0px";
  const bottom = toCssSize(box.bottom) ?? "0px";
  const left = toCssSize(box.left) ?? "0px";
  style[`${prefix}Top`] = top;
  style[`${prefix}Right`] = right;
  style[`${prefix}Bottom`] = bottom;
  style[`${prefix}Left`] = left;
}

export function resolveLayoutStyle(s?: LayoutStyle): React.CSSProperties {
  const style: Record<string, string> = {};
  if (!s) return style;

  if (s.width) style.width = toCssSize(s.width)!;
  if (s.maxWidth) style.maxWidth = toCssSize(s.maxWidth)!;
  if (s.height) style.height = toCssSize(s.height)!;
  if (s.maxHeight) style.maxHeight = toCssSize(s.maxHeight)!;

  if (s.textAlign) style.textAlign = s.textAlign;
  if (s.bgColor) style.background = s.bgColor;
  if (s.textColor) style.color = s.textColor;
  if (s.align) style.alignItems = s.align;
  if (s.justify) style.justifyContent = s.justify;
  if (s.gap !== undefined) style.gap = toCssSize(s.gap)!;

  if (s.borderColor || s.borderWidth) {
    style.borderStyle = "solid";
    style.borderColor = s.borderColor || "rgba(0,0,0,0.12)";
    style.borderWidth = toCssSize(s.borderWidth) || "1px";
  }

  if (s.radius) style.borderRadius = toCssSize(s.radius)!;
  if (s.shadow) style.boxShadow = shadowValue(s.shadow);

  if (s.fontSize) style.fontSize = toCssSize(s.fontSize)!;
  if (s.fontWeight) style.fontWeight = String(s.fontWeight);
  if (s.lineHeight) style.lineHeight = toCssSize(s.lineHeight)!;
  if (s.letterSpacing) style.letterSpacing = toCssSize(s.letterSpacing)!;
  if (s.textTransform) style.textTransform = s.textTransform;

  applyBox(style, "padding", s.padding);
  applyBox(style, "margin", s.margin);

  return style;
}

export function resolveRowLayoutStyle(
  layout?: {
    display?: "grid" | "flex";
    columns?: number;
    gap?: number | string;
    align?: LayoutStyle["align"];
    justify?: LayoutStyle["justify"];
    wrap?: boolean;
  },
  preset?: { template?: string; gap?: number | string },
): React.CSSProperties {
  const style: Record<string, string> = {};
  const display = layout?.display || "grid";
  style.display = display;

  if (display === "grid") {
    if (preset?.template) {
      style.gridTemplateColumns = preset.template;
    } else if (layout?.columns) {
      style.gridTemplateColumns = `repeat(${layout.columns}, minmax(0, 1fr))`;
    } else {
      style.gridTemplateColumns = "repeat(1, minmax(0, 1fr))";
    }
    style.alignItems = layout?.align || "stretch";
    style.justifyContent = layout?.justify || "start";
  } else {
    style.flexDirection = "row";
    style.flexWrap = layout?.wrap ? "wrap" : "nowrap";
    style.alignItems = layout?.align || "stretch";
    style.justifyContent = layout?.justify || "start";
  }

  const gap = preset?.gap ?? layout?.gap;
  if (gap !== undefined) style.gap = toCssSize(gap)!;

  return style;
}

export function resolveColFlexStyle(colStyle?: LayoutStyle): React.CSSProperties {
  const style: Record<string, string> = {};
  if (!colStyle) return style;
  if (colStyle.width) {
    style.flex = `0 0 ${toCssSize(colStyle.width)}`;
  } else {
    style.flex = "1 1 0";
  }
  return style;
}

export function toCssSizeValue(value?: number | string) {
  return toCssSize(value);
}
