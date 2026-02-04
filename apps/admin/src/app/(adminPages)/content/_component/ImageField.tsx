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
  const resolvedUrl =
    asset?.url || assetUrlValue || localUrl || defaultImage;

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">{label}</div>
        {asset ? (
          <span className="text-xs opacity-60">
            {asset.kind === "image" ? "image" : "file"}
          </span>
        ) : null}
      </div>

      {/* Preview */}
      {(asset && asset.kind === "image") || resolvedUrl ? (
        <div className="border rounded overflow-hidden">
          <img
            src={resolvedUrl}
            alt={altValue || asset?.alt || ""}
            className="w-full h-40 object-cover"
          />
        </div>
      ) : asset && asset.kind === "file" ? (
        <div className="text-sm opacity-70 border rounded p-2">
          File selected (no preview)
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          className="border rounded p-2 w-full font-mono text-sm"
          value={assetIdValue}
          placeholder={placeholder || "(asset id)"}
        />
        <button
          className="border rounded px-3 py-2 text-sm"
          type="button"
          onClick={() => setOpen(true)}
        >
          Pick
        </button>
      </div>

      <label className="space-y-1 block">
        <div className="text-sm opacity-70">Resolved URL</div>
        <input
          className="border rounded p-2 w-full font-mono text-sm"
          value={resolvedUrl}
          readOnly
          placeholder="(auto from asset id)"
        />
      </label>

      <label className="space-y-1 block">
        <div className="text-sm opacity-70">Alt text</div>
        <input
          className="border rounded p-2 w-full"
          value={altValue}
          onChange={(e) => onChangeAlt(e.target.value)}
          placeholder="Alt text for SEO"
        />
      </label>

      <AssetPickerModal
        siteId={siteId}
        open={open}
        onClose={() => setOpen(false)}
        onPick={(picked) => {
          console.log("Picked asset in ImageField:", picked);
          onChangeAssetId(picked.key); // ✅ FIX
          onChangeAssetUrl?.(picked.url);
          setLocalUrl(picked.url);
          if (!altValue) onChangeAlt(picked.alt || "");
        }}
      />
    </div>
  );
}
