import { BaseStyleSchema } from "../schemas";
import { deepMerge } from "./deep-merge";

export function computeFinalStyle(args: {
  style?: { presetId?: string; overrides?: any };
  presets?: Record<string, { style: any }>;
  assets?: Record<string, { url: string }>;
}) {
  const defaults = BaseStyleSchema.parse({});

  const presetId = args.style?.presetId;
  const presetStyle = presetId ? args.presets?.[presetId]?.style : undefined;
  const overrides = args.style?.overrides;

  const merged = deepMerge(deepMerge(defaults, presetStyle), overrides);

  // NEW: resolve bg.imageAssetId -> bg.imageUrl
  const bg = merged.bg;
  if (
    bg?.type === "image" &&
    bg.imageAssetId &&
    args.assets?.[bg.imageAssetId]?.url
  ) {
    merged.bg.imageUrl = args.assets[bg.imageAssetId].url;
  }

  return merged;
}
