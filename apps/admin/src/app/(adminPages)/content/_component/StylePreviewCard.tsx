"use client";

type Bg = {
  type?: "none" | "solid" | "gradient" | "image";
  color?: string;
  gradient?: {
    from?: string;
    to?: string;
    direction?: "to-r" | "to-l" | "to-b" | "to-t";
  };
  imageUrl?: string;
  imageAssetId?: string;
  overlayColor?: string;
  overlayOpacity?: number;
};

type Border = { enabled?: boolean; color?: string; width?: number };

export type PreviewStyle = {
  container?: "boxed" | "full";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  bg?: Bg;
  textColor?: string;
  radius?: number;
  shadow?: "none" | "sm" | "md" | "lg";
  border?: Border;
};

function px(n?: number) {
  return `${Math.max(0, Number(n || 0))}px`;
}

function shadow(sh?: string) {
  if (sh === "sm") return "0 1px 2px rgba(0,0,0,0.08)";
  if (sh === "md") return "0 8px 24px rgba(0,0,0,0.12)";
  if (sh === "lg") return "0 14px 40px rgba(0,0,0,0.16)";
  return "none";
}

function dirToDeg(dir?: string) {
  if (dir === "to-r") return "90deg";
  if (dir === "to-l") return "270deg";
  if (dir === "to-b") return "180deg";
  return "0deg";
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

function toOverlay(color: string, opacity: number) {
  if (color.startsWith("#")) return hexToRgba(color, opacity);
  if (color.startsWith("rgba(")) return color;
  return color;
}

function buildOuterBackground(bg?: Bg) {
  const b = bg ?? { type: "none" };
  const out: React.CSSProperties = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  if (b.type === "solid" && b.color) {
    out.background = b.color;
    return out;
  }

  if (b.type === "gradient" && b.gradient?.from && b.gradient?.to) {
    out.background = `linear-gradient(${dirToDeg(b.gradient.direction)}, ${b.gradient.from}, ${b.gradient.to})`;
    return out;
  }

  if (b.type === "image" && b.imageUrl) {
    const overlayColor = b.overlayColor;
    const overlayOpacity =
      typeof b.overlayOpacity === "number" ? b.overlayOpacity : 0.35;

    if (overlayColor) {
      const overlay = toOverlay(overlayColor, overlayOpacity);
      out.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url(${b.imageUrl})`;
    } else {
      out.backgroundImage = `url(${b.imageUrl})`;
    }
    return out;
  }

  out.background = "transparent";
  return out;
}

export default function StylePreviewCard({
  style,
  title = "Style Preview",
}: {
  style: PreviewStyle;
  title?: string;
}) {
  const pad = style.padding ?? {};
  const mar = style.margin ?? {};
  const rad = style.radius ?? 0;
  const b = style.border ?? {};
  const outerBg = buildOuterBackground(style.bg);

  const outerStyle: React.CSSProperties = {
    ...outerBg,
    marginTop: px(mar.top),
    marginRight: px(mar.right),
    marginBottom: px(mar.bottom),
    marginLeft: px(mar.left),
  };

  const innerStyle: React.CSSProperties = {
    borderRadius: px(rad),
    boxShadow: shadow(style.shadow),
    borderStyle: b.enabled ? "solid" : "none",
    borderWidth: b.enabled ? px(b.width ?? 1) : undefined,
    borderColor: b.enabled ? (b.color ?? "rgba(0,0,0,0.12)") : undefined,
    color: style.textColor || undefined,
  };

  const contentStyle: React.CSSProperties = {
    paddingTop: px(pad.top),
    paddingRight: px(pad.right),
    paddingBottom: px(pad.bottom),
    paddingLeft: px(pad.left),
  };

  return (
    <div className="space-y-2">
      <div className="text-sm opacity-70">{title}</div>

      {/* Outer background */}
      <div className="border rounded-xl overflow-hidden">
        <div style={outerStyle} className="w-full">
          {/* Inner wrapper (radius/border/shadow) */}
          <div className="mx-auto max-w-2xl p-4">
            <div style={innerStyle} className="bg-white/0">
              {/* Content area to visualize padding */}
              <div style={contentStyle}>
                <div className="rounded border border-dashed border-black/30 bg-white/20 h-16 flex items-center justify-center text-xs opacity-80">
                  Content area (padding preview)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs opacity-60">
        This preview shows: background + overlay + radius + border + shadow +
        padding.
      </div>
    </div>
  );
}
