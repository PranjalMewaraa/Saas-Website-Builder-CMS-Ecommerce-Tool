"use client";

import { useEffect, useMemo, useState } from "react";
import AssetPickerModal from "./AssetPickerModal";
import type { AssetMeta } from "./useAssetsMap";

export default function ImageField({
  siteId,
  label,
  assetIdValue,
  altValue,
  onChangeAssetId,
  onChangeAlt,
  assetsMap,
  placeholder,
  onChangeAssetUrl,
  assetUrlValue,
}: {
  siteId: string;
  label: string;
  assetIdValue: string;
  altValue: string;
  placeholder?: string;
  assetUrlValue?: string;
  onChangeAssetUrl?: (v: string) => void;
  onChangeAssetId: (v: string) => void;
  onChangeAlt: (v: string) => void;
  assetsMap?: Record<string, AssetMeta>;
}) {
  const [open, setOpen] = useState(false);
  const [localUrl, setLocalUrl] = useState("");

  const asset = useMemo(() => {
    if (!assetsMap) return null;
    return assetsMap[assetIdValue] ?? null;
  }, [assetsMap, assetIdValue]);

  const defaultImage =
    "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";

  const resolvedUrl = asset?.url || localUrl || assetUrlValue || defaultImage;

  // --- Styles ---
  const subLabelStyle =
    "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 ml-1";
  const glassInput =
    "bg-surface border border-line rounded-control px-4 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-accent focus:border-accent outline-none font-medium text-ink";

  return (
    <div className="group relative bg-canvas border border-line rounded-card p-6 space-y-6 transition-all hover:shadow-raised">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-ink tracking-tight">
            {label}
          </span>
          {asset && (
            <span className="text-[10px] bg-accent-soft text-accent px-2 py-0.5 rounded-full font-bold uppercase mt-1 self-start">
              {asset.kind}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-accent text-accent-fg text-xs font-bold px-5 py-2 rounded-full hover:bg-accent/90 transition-all active:scale-95 shadow-rest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Replace Media
        </button>
      </div>

      {/* Visual Preview Section */}
      <div className="relative group/preview">
        {(asset && asset.kind === "image") || resolvedUrl ? (
          <div className="relative aspect-video max-w-2/3 rounded-card overflow-hidden bg-canvas border border-line shadow-inner">
            <img
              src={resolvedUrl}
              alt={altValue || asset?.alt || ""}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-line rounded-card" />
          </div>
        ) : (
          <div className="aspect-video rounded-card bg-canvas flex items-center justify-center border border-dashed border-line">
            <span className="text-muted text-sm font-medium">
              No preview available
            </span>
          </div>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col">
          <label className={subLabelStyle}>Asset Identifier</label>
          <input
            className={`${glassInput} font-mono text-[12px] opacity-80`}
            value={assetIdValue}
            onChange={(e) => onChangeAssetId(e.target.value)}
            placeholder={placeholder || "Asset ID"}
          />
        </div>

        <div className="flex flex-col">
          <label className={subLabelStyle}>Alternative Text</label>
          <input
            className={glassInput}
            value={altValue}
            onChange={(e) => onChangeAlt(e.target.value)}
            placeholder="Describe the image..."
          />
        </div>
      </div>

      {/* Read-only URL Bar */}
      <div className="pt-2">
        <div className="bg-canvas rounded-card px-4 py-3 flex items-center gap-3 border border-line">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-mono text-muted truncate flex-1">
            {resolvedUrl}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(resolvedUrl)}
            className="text-[10px] font-bold text-muted hover:text-ink uppercase tracking-tighter"
          >
            Copy
          </button>
        </div>
      </div>

      <AssetPickerModal
        siteId={siteId}
        open={open}
        onClose={() => setOpen(false)}
        onPick={(picked) => {
          setLocalUrl(picked.url || "");
          const nextId = picked._id || picked.key;
          onChangeAssetId(nextId);
          onChangeAssetUrl?.(picked.url);
          if (!altValue && picked.alt) onChangeAlt(picked.alt);
        }}
      />
    </div>
  );
}
