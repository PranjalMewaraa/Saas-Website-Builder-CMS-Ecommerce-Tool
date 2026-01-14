"use client";

import { useEffect, useMemo, useState } from "react";

export type AssetMeta = {
  _id: string;
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
    const res = await fetch(
      `/api/admin/assets?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setAssets(data.assets ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const map = useMemo(() => {
    return Object.fromEntries(assets.map((a) => [a._id, a])) as Record<
      string,
      AssetMeta
    >;
  }, [assets]);

  return { assets, assetsMap: map, loading, refresh };
}
