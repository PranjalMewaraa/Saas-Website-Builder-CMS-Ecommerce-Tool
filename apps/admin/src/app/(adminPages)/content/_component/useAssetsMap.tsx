"use client";

import { useEffect, useMemo, useState } from "react";

export type AssetMeta = {
  _id: string;
  key: string; // ✅ add this
  kind: "image" | "file";
  url: string;
  alt?: string;
  mime?: string;
  width?: number;
  height?: number;
};

export function useAssetsMap(siteId: string) {
  const [assets, setAssets] = useState<AssetMeta[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/assets?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        setAssets([]);
        return;
      }

      const text = await res.text();
      if (!text) {
        setAssets([]);
        return;
      }

      const data = JSON.parse(text);
      setAssets(data.assets ?? []);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [siteId]);

  const map = useMemo(() => {
    const entries: [string, AssetMeta][] = [];
    for (const a of assets) {
      if (a._id) entries.push([a._id, a]);
      if (a.key && a.key !== a._id) entries.push([a.key, a]);
    }
    return Object.fromEntries(entries) as Record<string, AssetMeta>;
  }, [assets]);

  return { assets, assetsMap: map, loading, refresh };
}
