"use client";

import { useEffect, useMemo, useState } from "react";

async function getImageSize(
  file: File
): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {};
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({});
    img.src = URL.createObjectURL(file);
  });
}
function extractTags(assets: any[]) {
  const counts: Record<string, number> = {};
  for (const a of assets) {
    const tags: string[] = Array.isArray(a.tags) ? a.tags : [];
    for (const t of tags) {
      const tag = normalize(t);
      if (!tag) continue;
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

function tagsToString(tags: string[] | undefined) {
  return (tags || []).join(", ");
}

function stringToTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 30); // guardrail
}

export default function AssetsClient({ siteId }: { siteId: string }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  async function refresh() {
    const res = await fetch(
      `/api/admin/assets?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setAssets(data.assets ?? []);
  }

  useEffect(() => {
    refresh();
  }, [siteId]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return assets;

    return assets.filter((a) => {
      const key = normalize(a.key || "");
      const url = normalize(a.url || "");
      const alt = normalize(a.alt || "");
      const folder = normalize(a.folder || "");
      const tags = normalize((a.tags || []).join(" "));
      return (
        key.includes(q) ||
        url.includes(q) ||
        alt.includes(q) ||
        folder.includes(q) ||
        tags.includes(q)
      );
    });
  }, [assets, search]);
  const topTags = useMemo(() => {
    const counts = extractTags(assets);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));
  }, [assets]);

  async function upload(file: File) {
    setBusy(true);
    try {
      // 1) request signed URL
      const signRes = await fetch(
        `/api/admin/assets/sign?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mime: file.type }),
        }
      );
      const signData = await signRes.json();
      if (!signData.ok) throw new Error(signData.error || "sign failed");

      // 2) upload directly to S3/R2
      const putRes = await fetch(signData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("upload failed");

      // 3) finalize metadata
      const dim = await getImageSize(file);
      const finRes = await fetch(
        `/api/admin/assets/finalize?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: signData.key,
            url: signData.finalUrl,
            mime: file.type,
            size_bytes: file.size,
            width: dim.width,
            height: dim.height,
            alt: "",
          }),
        }
      );
      const finData = await finRes.json();
      if (!finData.ok) throw new Error(finData.error || "finalize failed");

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateAsset(
    asset_id: string,
    patch: { tags?: string[]; folder?: string }
  ) {
    await fetch(
      `/api/admin/assets/update?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id, ...patch }),
      }
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="border rounded p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">Upload</div>
          {busy ? <div className="text-sm opacity-70">Uploading…</div> : null}
        </div>

        <input
          type="file"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />

        <div className="text-xs opacity-60">
          Tip: Use CloudFront URLs for best performance.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          className="border rounded p-2 w-full"
          placeholder="Search by key, alt, tags, folder…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="border rounded px-3 py-2 text-sm"
          type="button"
          onClick={() => setSearch("")}
        >
          Clear
        </button>
      </div>

      <div className="text-sm opacity-70">
        Showing <b>{filtered.length}</b> of <b>{assets.length}</b> assets
      </div>
      {topTags.length ? (
        <div className="border rounded p-3 space-y-2">
          <div className="text-sm opacity-70">Quick Tags</div>
          <div className="flex flex-wrap gap-2">
            {topTags.map(({ tag, count }) => {
              const active = normalize(search) === tag;
              return (
                <button
                  key={tag}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    active ? "bg-black text-white" : ""
                  }`}
                  type="button"
                  onClick={() => setSearch(active ? "" : tag)}
                  title={`${count} assets`}
                >
                  {tag} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filtered.map((a) => (
          <AssetCard
            key={a._id}
            asset={a}
            siteId={siteId}
            onRefresh={refresh}
            onUpdate={updateAsset}
            onTagClick={(tag) => setSearch(tag)}
          />
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-2 md:col-span-4 opacity-70 text-sm border rounded p-4">
            No assets match your search.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AssetCard({
  asset: a,
  siteId,
  onRefresh,
  onUpdate,
  onTagClick,
}: {
  asset: any;
  siteId: string;
  onRefresh: () => Promise<void>;
  onUpdate: (
    asset_id: string,
    patch: { tags?: string[]; folder?: string }
  ) => Promise<void>;
  onTagClick: (tag: string) => void;
}) {
  const [tagsText, setTagsText] = useState(tagsToString(a.tags));
  const [folder, setFolder] = useState(a.folder || "/");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTagsText(tagsToString(a.tags));
    setFolder(a.folder || "/");
  }, [a._id]);

  async function saveMeta() {
    setSaving(true);
    try {
      await onUpdate(a._id, { tags: stringToTags(tagsText), folder });
      await onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded p-2 space-y-2">
      {a.kind === "image" ? (
        <img
          src={a.url}
          alt={a.alt || ""}
          className="w-full h-32 object-cover rounded"
        />
      ) : (
        <div className="h-32 flex items-center justify-center text-sm opacity-70 border rounded">
          File
        </div>
      )}

      {/* Alt text (existing endpoint) */}
      <input
        className="border rounded p-2 w-full text-sm"
        placeholder="Alt text"
        defaultValue={a.alt || ""}
        onBlur={async (e) => {
          await fetch(
            `/api/admin/assets/alt?site_id=${encodeURIComponent(siteId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ asset_id: a._id, alt: e.target.value }),
            }
          );
        }}
      />

      {/* Folder */}
      <input
        className="border rounded p-2 w-full text-sm"
        placeholder="Folder (ex: /logos)"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
      />

      {/* Tags */}
      <input
        className="border rounded p-2 w-full text-sm"
        placeholder="Tags (comma separated)"
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
      />
      {Array.isArray(a.tags) && a.tags.length ? (
        <div className="flex flex-wrap gap-2">
          {a.tags.map((t: string) => (
            <button
              key={t}
              className="px-2 py-1 rounded-full border text-xs"
              type="button"
              onClick={() => onTagClick(t)}
              title="Filter by tag"
            >
              {t}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs opacity-60">No tags</div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          className="border rounded px-2 py-1 text-sm"
          onClick={() => navigator.clipboard.writeText(a.url)}
          type="button"
        >
          Copy URL
        </button>

        <button
          className="border rounded px-2 py-1 text-sm"
          onClick={saveMeta}
          type="button"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save tags/folder"}
        </button>

        <button
          className="border rounded px-2 py-1 text-sm"
          onClick={async () => {
            // prefer hard delete if you implemented it; fallback to soft delete
            const res = await fetch(
              `/api/admin/assets/hard-delete?site_id=${encodeURIComponent(siteId)}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ asset_id: a._id }),
              }
            );

            if (!res.ok) {
              // fallback soft delete
              await fetch(
                `/api/admin/assets/delete?site_id=${encodeURIComponent(siteId)}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ asset_id: a._id }),
                }
              );
            }

            await onRefresh();
          }}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className="text-xs opacity-60 break-all">{a.key}</div>
    </div>
  );
}
