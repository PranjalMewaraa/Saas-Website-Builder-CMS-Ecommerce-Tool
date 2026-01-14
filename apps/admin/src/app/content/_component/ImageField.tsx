"use client";

import { useMemo, useState } from "react";
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
}: {
  siteId: string;
  label: string;
  assetIdValue: string;
  altValue: string;
  onChangeAssetId: (v: string) => void;
  onChangeAlt: (v: string) => void;
  assetsMap?: Record<string, AssetMeta>;
}) {
  const [open, setOpen] = useState(false);

  const asset = useMemo(() => {
    if (!assetsMap) return null;
    return assetsMap[assetIdValue] ?? null;
  }, [assetsMap, assetIdValue]);

  const resolvedUrl = asset?.url || "";

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
      {asset && asset.kind === "image" ? (
        <div className="border rounded overflow-hidden">
          <img
            src={asset.url}
            alt={altValue || asset.alt || ""}
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
          onChange={(e) => onChangeAssetId(e.target.value)}
          placeholder="assetId (pick from Assets)"
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
          onChangeAssetId(picked._id);
          if (!altValue) onChangeAlt(picked.alt || "");
        }}
      />
    </div>
  );
}
