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
    "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
  const glassInput =
    "bg-white/50 border border-gray-200/60 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-medium text-gray-700";

  return (
    <div className="group relative bg-gray-50/30 border border-gray-200/50 rounded-[2rem] p-6 space-y-6 transition-all hover:shadow-xl hover:shadow-gray-200/40 hover:bg-white/80">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            {label}
          </span>
          {asset && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase mt-1 self-start">
              {asset.kind}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-black text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-md shadow-black/10"
        >
          Replace Media
        </button>
      </div>

      {/* Visual Preview Section */}
      <div className="relative group/preview">
        {(asset && asset.kind === "image") || resolvedUrl ? (
          <div className="relative aspect-video max-w-2/3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/50 shadow-inner">
            <img
              src={resolvedUrl}
              alt={altValue || asset?.alt || ""}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
            <span className="text-gray-400 text-sm font-medium">
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
        <div className="bg-gray-100/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-200/30">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] font-mono text-gray-500 truncate flex-1">
            {resolvedUrl}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(resolvedUrl)}
            className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-tighter"
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
