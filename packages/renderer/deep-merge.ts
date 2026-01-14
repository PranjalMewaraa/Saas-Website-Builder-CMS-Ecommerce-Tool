export function deepMerge<T extends Record<string, any>>(
  base: T,
  patch?: Partial<T>
): T {
  if (!patch) return base;

  const out: any = Array.isArray(base) ? [...base] : { ...base };

  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;

    const baseVal = (out as any)[k];
    if (isPlainObject(baseVal) && isPlainObject(v)) {
      (out as any)[k] = deepMerge(baseVal, v as any);
    } else {
      (out as any)[k] = v;
    }
  }
  return out;
}

function isPlainObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}
