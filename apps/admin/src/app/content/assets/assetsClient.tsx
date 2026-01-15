"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Search,
  X,
  Tag,
  Folder,
  Copy,
  Save,
  Trash2,
  Image as ImageIcon,
  File,
  Check,
  AlertTriangle,
} from "lucide-react";

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
    .slice(0, 30);
}

export default function AssetsClient({ siteId }: { siteId: string }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/assets?site_id=${encodeURIComponent(siteId)}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();
      setAssets(data.assets ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [siteId]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return assets;

    return assets.filter((a) => {
      return (
        normalize(a.key || "").includes(q) ||
        normalize(a.url || "").includes(q) ||
        normalize(a.alt || "").includes(q) ||
        normalize(a.folder || "").includes(q) ||
        normalize((a.tags || []).join(" ")).includes(q)
      );
    });
  }, [assets, search]);

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of assets) {
      for (const t of a.tags || []) {
        const tag = normalize(t);
        if (tag) counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));
  }, [assets]);

  async function upload(file: File) {
    setBusy(true);
    setUploadStatus("uploading");
    try {
      const signRes = await fetch(
        `/api/admin/assets/sign?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mime: file.type }),
        }
      );
      const signData = await signRes.json();
      if (!signData.ok)
        throw new Error(signData.error || "Failed to get upload URL");

      const putRes = await fetch(signData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

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
      if (!finData.ok) throw new Error(finData.error || "Finalize failed");

      setUploadStatus("success");
      setTimeout(() => setUploadStatus("idle"), 2400);
      await refresh();
    } catch (err) {
      console.error(err);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 4000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Asset Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage images, files and media for site <strong>{siteId}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
            <input
              type="file"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />
          </label>
        </div>
      </div>

      {/* Upload status */}
      {uploadStatus !== "idle" && (
        <div
          className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
            uploadStatus === "uploading"
              ? "bg-blue-50 text-blue-700"
              : uploadStatus === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {uploadStatus === "uploading" && (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          )}
          {uploadStatus === "success" && <Check className="h-5 w-5" />}
          {uploadStatus === "error" && <AlertTriangle className="h-5 w-5" />}
          <span>
            {uploadStatus === "uploading"
              ? "Uploading..."
              : uploadStatus === "success"
                ? "Upload successful!"
                : "Upload failed. Try again."}
          </span>
        </div>
      )}

      {/* Search & Tags */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search by filename, alt, tags, folder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topTags.map(({ tag, count }) => {
              const active = normalize(search) === tag;
              return (
                <button
                  key={tag}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                  onClick={() => setSearch(active ? "" : tag)}
                >
                  <Tag className="h-3.5 w-3.5" />
                  {tag}
                  <span className="opacity-70 text-xs">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{filtered.length}</strong>{" "}
        of <strong className="text-foreground">{assets.length}</strong> assets
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 animate-pulse bg-muted/40 h-64"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <h3 className="font-medium text-lg mb-2">No assets found</h3>
          <p className="text-sm max-w-md mx-auto">
            {search
              ? "Try adjusting your search or clear filters."
              : "Upload your first image or file to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((asset) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              siteId={siteId}
              onRefresh={refresh}
              onTagClick={(tag) => setSearch(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({
  asset,
  siteId,
  onRefresh,
  onTagClick,
}: {
  asset: any;
  siteId: string;
  onRefresh: () => Promise<void>;
  onTagClick: (tag: string) => void;
}) {
  const [alt, setAlt] = useState(asset.alt || "");
  const [folder, setFolder] = useState(asset.folder || "/");
  const [tagsText, setTagsText] = useState(tagsToString(asset.tags));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tags = useMemo(() => stringToTags(tagsText), [tagsText]);

  async function saveMetadata() {
    setSaving(true);
    try {
      await fetch(
        `/api/admin/assets/update?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset_id: asset._id,
            tags,
            folder: folder.trim() || null,
          }),
        }
      );

      if (alt !== asset.alt) {
        await fetch(
          `/api/admin/assets/alt?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asset_id: asset._id, alt }),
          }
        );
      }

      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000);
      return;
    }

    try {
      // Try hard delete first, fallback to soft delete
      let res = await fetch(
        `/api/admin/assets/hard-delete?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset_id: asset._id }),
        }
      );

      if (!res.ok) {
        res = await fetch(
          `/api/admin/assets/delete?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asset_id: asset._id }),
          }
        );
      }

      if (res.ok) {
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="group border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow transition-all duration-200">
      {/* Preview */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {asset.kind === "image" ? (
          <img
            src={asset.url}
            alt={asset.alt || asset.key}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <File className="h-10 w-10 mb-2" />
            <span className="text-xs font-medium">
              {asset.mime?.split("/")[1]?.toUpperCase() || "FILE"}
            </span>
          </div>
        )}

        {asset.width && asset.height && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {asset.width} × {asset.height}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Alt */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Alt text
          </label>
          <input
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descriptive alt text for accessibility"
          />
        </div>

        {/* Folder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            Folder
          </label>
          <input
            className="w-full border rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="/images/heroes"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Tags
          </label>
          <input
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="comma, separated, tags"
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <div
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => onTagClick(t)}
                >
                  {t}
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTagsText(tags.filter((tag) => tag !== t).join(", "));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm hover:bg-muted transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(asset.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy URL"}
          </button>

          <button
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
            onClick={saveMetadata}
            disabled={saving}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              showDeleteConfirm
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-red-600 hover:bg-red-50 border border-red-200"
            }`}
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {showDeleteConfirm ? "Confirm Delete" : "Delete"}
          </button>
        </div>

        {/* Key / meta */}
        <div className="text-xs text-muted-foreground font-mono break-all pt-2 border-t">
          {asset.key}
        </div>
      </div>
    </div>
  );
}
