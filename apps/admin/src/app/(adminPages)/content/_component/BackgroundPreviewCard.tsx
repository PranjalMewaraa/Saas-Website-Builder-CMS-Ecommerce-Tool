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
  overlayColor?: string;
  overlayOpacity?: number;
};

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
  if (color.startsWith("rgba(")) return color; // alpha already included
  return color; // rgb(), var(--token), etc.
}

function buildBackground(bg?: Bg) {
  const b = bg ?? { type: "none" };

  // default
  const style: React.CSSProperties = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  if (b.type === "solid" && b.color) {
    style.background = b.color;
    return style;
  }

  if (b.type === "gradient" && b.gradient?.from && b.gradient?.to) {
    const deg = dirToDeg(b.gradient.direction);
    style.background = `linear-gradient(${deg}, ${b.gradient.from}, ${b.gradient.to})`;
    return style;
  }

  if (b.type === "image" && b.imageUrl) {
    const overlayColor = b.overlayColor;
    const overlayOpacity =
      typeof b.overlayOpacity === "number" ? b.overlayOpacity : 0.35;

    if (overlayColor) {
      const overlay = toOverlay(overlayColor, overlayOpacity);
      style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url(${b.imageUrl})`;
    } else {
      style.backgroundImage = `url(${b.imageUrl})`;
    }

    return style;
  }

  // none
  style.background = "transparent";
  return style;
}

export default function BackgroundPreviewCard({
  bg,
  title = "Background Preview",
}: {
  bg?: Bg;
  title?: string;
}) {
  const style = buildBackground(bg);

  return (
    <div className="space-y-2">
      <div className="text-sm opacity-70">{title}</div>
      <div className="border rounded-xl overflow-hidden">
        <div style={style} className="h-32 w-full" />
      </div>
      <div className="text-xs opacity-60">
        Tip: For best overlay control, use overlayColor as{" "}
        <span className="font-mono">#000000</span> and adjust opacity.
      </div>
    </div>
  );
}
