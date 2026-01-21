"use client";

import { useMemo, useState } from "react";

type Breakpoint = "desktop" | "tablet" | "mobile";

export default function StyleEditor({
  siteId,
  snapshotLike,
  block,
  breakpoint,
  onChange,
}: {
  siteId: string;
  snapshotLike: any;
  block: any;
  breakpoint: Breakpoint;
  onChange: (nextStyle: any) => void;
}) {
  const style = block.style ?? {};
  const target = useMemo(
    () => getTarget(style, breakpoint),
    [style, breakpoint]
  );

  // resolve bg preview imageUrl from assets
  const assetsMap = snapshotLike.assets || {};
  const bg = target.bg ?? { type: "none" };
  const resolvedBg =
    bg.type === "image" && bg.imageAssetId && assetsMap[bg.imageAssetId]?.url
      ? { ...bg, imageUrl: assetsMap[bg.imageAssetId].url }
      : bg;

  function set(path: string, val: any) {
    const next = structuredClone(style);
    const obj = ensureTarget(next, breakpoint);
    setDeep(obj, path, val);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Select
          label="Container"
          value={target.container ?? "boxed"}
          onChange={(v: any) => set("container", v)}
          options={["boxed", "full"]}
        />
        <Select
          label="Shadow"
          value={target.shadow ?? "none"}
          onChange={(v: any) => set("shadow", v)}
          options={["none", "sm", "md", "lg"]}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Num
          label="Pad T"
          value={target.padding?.top ?? 0}
          onChange={(n: any) => set("padding.top", n)}
        />
        <Num
          label="Pad R"
          value={target.padding?.right ?? 0}
          onChange={(n: any) => set("padding.right", n)}
        />
        <Num
          label="Pad B"
          value={target.padding?.bottom ?? 0}
          onChange={(n: any) => set("padding.bottom", n)}
        />
        <Num
          label="Pad L"
          value={target.padding?.left ?? 0}
          onChange={(n: any) => set("padding.left", n)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Num
          label="Radius"
          value={target.radius ?? 0}
          onChange={(n: any) => set("radius", n)}
        />
        <Text
          label="Text color"
          value={target.textColor ?? ""}
          onChange={(v: any) => set("textColor", v)}
          placeholder="var(--color-text) or #111"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select
          label="BG Type"
          value={bg.type ?? "none"}
          onChange={(v: any) => set("bg.type", v)}
          options={["none", "solid", "gradient", "image"]}
        />
        {bg.type === "solid" ? (
          <Text
            label="BG color"
            value={bg.color ?? ""}
            onChange={(v: any) => set("bg.color", v)}
            placeholder="#fff or var(--color-bg)"
          />
        ) : (
          <div />
        )}
      </div>

      {bg.type === "gradient" ? (
        <div className="grid grid-cols-3 gap-2">
          <Text
            label="From"
            value={bg.gradient?.from ?? ""}
            onChange={(v: any) => set("bg.gradient.from", v)}
            placeholder="#111"
          />
          <Text
            label="To"
            value={bg.gradient?.to ?? ""}
            onChange={(v: any) => set("bg.gradient.to", v)}
            placeholder="#2563EB"
          />
          <Select
            label="Dir"
            value={bg.gradient?.direction ?? "to-r"}
            onChange={(v: any) => set("bg.gradient.direction", v)}
            options={["to-r", "to-l", "to-b", "to-t"]}
          />
        </div>
      ) : null}

      {bg.type === "image" ? (
        <div className="border rounded p-2 space-y-2">
          <div className="text-xs opacity-70">Background image</div>
          <Text
            label="imageAssetId"
            value={bg.imageAssetId ?? ""}
            onChange={(v: any) => set("bg.imageAssetId", v)}
            placeholder="Pick from Assets (use Content → Assets id)"
          />
          <div className="grid grid-cols-2 gap-2">
            <Text
              label="Overlay color"
              value={bg.overlayColor ?? "#000000"}
              onChange={(v: any) => set("bg.overlayColor", v)}
              placeholder="#000000"
            />
            <Num
              label="Overlay opacity"
              value={bg.overlayOpacity ?? 0.35}
              step="0.05"
              min="0"
              max="1"
              onChange={(n: any) => set("bg.overlayOpacity", n)}
            />
          </div>

          {/* simple preview */}
          <div className="border rounded overflow-hidden">
            <div className="h-24" style={previewStyleFromBg(resolvedBg)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getTarget(style: any, bp: Breakpoint) {
  if (bp === "desktop") return style.overrides ?? {};
  if (bp === "tablet") return style.responsive?.tablet ?? {};
  return style.responsive?.mobile ?? {};
}

function ensureTarget(style: any, bp: Breakpoint) {
  if (bp === "desktop") return (style.overrides ||= {});
  style.responsive ||= {};
  if (bp === "tablet") return (style.responsive.tablet ||= {});
  return (style.responsive.mobile ||= {});
}

function setDeep(obj: any, path: string, val: any) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++)
    cur = cur[parts[i]] ?? (cur[parts[i]] = {});
  cur[parts[parts.length - 1]] = val;
}
function previewStyleFromBg(bg: any): React.CSSProperties {
  const out: React.CSSProperties = {
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  if (bg.type === "solid" && bg.color) out.background = bg.color;
  if (bg.type === "gradient" && bg.gradient?.from && bg.gradient?.to) {
    const dir = bg.gradient.direction || "to-r";
    const deg =
      dir === "to-r"
        ? "90deg"
        : dir === "to-l"
          ? "270deg"
          : dir === "to-b"
            ? "180deg"
            : "0deg";
    out.background = `linear-gradient(${deg}, ${bg.gradient.from}, ${bg.gradient.to})`;
  }
  if (bg.type === "image" && bg.imageUrl) {
    const overlayColor = bg.overlayColor;
    const opacity =
      typeof bg.overlayOpacity === "number" ? bg.overlayOpacity : 0.35;
    if (overlayColor?.startsWith("#")) {
      const rgba = hexToRgba(overlayColor, opacity);
      out.backgroundImage = `linear-gradient(${rgba}, ${rgba}), url(${bg.imageUrl})`;
    } else if (overlayColor) {
      out.backgroundImage = `linear-gradient(${overlayColor}, ${overlayColor}), url(${bg.imageUrl})`;
    } else {
      out.backgroundImage = `url(${bg.imageUrl})`;
    }
  }
  return out;
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
  const a = Math.max(0, Math.min(1, opacity));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function Text({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block space-y-1">
      <div className="text-xs opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Num({ label, value, onChange, step = "1", min, max }: any) {
  return (
    <label className="block space-y-1">
      <div className="text-xs opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full text-sm"
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block space-y-1">
      <div className="text-xs opacity-70">{label}</div>
      <select
        className="border rounded p-2 w-full text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
