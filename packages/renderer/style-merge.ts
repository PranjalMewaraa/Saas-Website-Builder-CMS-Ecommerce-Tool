import { BaseStyleSchema } from "../schemas";
import { deepMerge } from "./deep-merge";

export function computeFinalStyle(args: {
  style?: { presetId?: string; overrides?: any };
  presets?: Record<string, { style: any }>;
}) {
  // start with defaults from schema
  const defaults = BaseStyleSchema.parse({});

  // apply preset first (if exists)
  const presetId = args.style?.presetId;
  const presetStyle = presetId ? args.presets?.[presetId]?.style : undefined;

  // then apply overrides
  const overrides = args.style?.overrides;

  return deepMerge(deepMerge(defaults, presetStyle), overrides);
}
