"use client";

import { useEffect, useState } from "react";
import ImageField from "../_component/ImageField";
import { useAssetsMap } from "../_component/useAssetsMap";

export default function SiteSeoPage({ searchParams }: any) {
  const siteId = searchParams.site_id;
  const { assetsMap } = useAssetsMap(siteId);

  const [seo, setSeo] = useState<any>({});

  useEffect(() => {
    fetch(`/api/admin/seo/site?site_id=${siteId}`)
      .then((r) => r.json())
      .then((d) => setSeo(d.site_seo || {}));
  }, [siteId]);

  async function save() {
    await fetch("/api/admin/seo/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, site_seo: seo }),
    });
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold">Site SEO</h1>

      <input
        placeholder="Site Name"
        className="border p-2 w-full"
        value={seo.siteName || ""}
        onChange={(e) => setSeo({ ...seo, siteName: e.target.value })}
      />

      <input
        placeholder="Title Template"
        className="border p-2 w-full"
        value={seo.titleTemplate || ""}
        onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })}
      />

      <textarea
        placeholder="Default Description"
        className="border p-2 w-full"
        value={seo.defaultDescription || ""}
        onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
      />

      <ImageField
        siteId={siteId}
        label="Global OG Image"
        assetIdValue={seo.globalOgImageAssetId || ""}
        altValue=""
        onChangeAssetId={(v) => setSeo({ ...seo, globalOgImageAssetId: v })}
        onChangeAlt={() => {}}
        assetsMap={assetsMap}
      />

      <button onClick={save} className="bg-black text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
}
