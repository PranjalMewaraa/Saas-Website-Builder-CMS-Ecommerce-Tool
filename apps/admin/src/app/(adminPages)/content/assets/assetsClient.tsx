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
  file: File,
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
        },
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
        },
      );

      if (!signRes.ok) throw new Error("Sign failed");

      const signData = await signRes.json();

      const formData = new FormData();
      Object.entries(signData.upload.fields).forEach(([k, v]) => {
        formData.append(k, v as string);
      });
      formData.append("file", file);

      const postRes = await fetch(signData.upload.url, {
        method: "POST",
        body: formData,
      });

      if (!postRes.ok) throw new Error("Upload failed");

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
          }),
        },
      );

      if (!finRes.ok) throw new Error("Finalize failed");

      setUploadStatus("success");
      await refresh();
    } catch (err) {
      console.error(err);
      setUploadStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Library</h1>
          <p className="mt-1.5 text-muted-foreground">
            Manage images, files & media for site{" "}
            <span className="font-medium text-foreground">{siteId}</span>
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 disabled:pointer-events-none">
          <Upload className="h-4.5 w-4.5" />
          Upload files
          <input
            type="file"
            className="hidden"
            multiple
            disabled={busy}
            onChange={(e) => {
              if (e.target.files) {
                Array.from(e.target.files).forEach(upload);
              }
            }}
          />
        </label>
      </div>

      {/* Upload status */}
      {uploadStatus !== "idle" && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border-l-4 ${
            uploadStatus === "uploading"
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : uploadStatus === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          {uploadStatus === "uploading" && (
            <div className="animate-spin h-5 w-5 border-3 border-current border-t-transparent rounded-full" />
          )}
          {uploadStatus === "success" && <Check className="h-5 w-5" />}
          {uploadStatus === "error" && <AlertTriangle className="h-5 w-5" />}
          <span>
            {uploadStatus === "uploading"
              ? "Uploading file..."
              : uploadStatus === "success"
                ? "Upload completed successfully"
                : "Upload failed — please try again"}
          </span>
        </div>
      )}

      {/* Search & Tags */}
      <div className="space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            className="w-full pl-12 pr-12 py-3 bg-background border border-input rounded-xl text-base placeholder:text-muted-foreground focus:border-primary/70 focus:ring-4 focus:ring-primary/15 transition-all shadow-sm"
            placeholder="Search by filename, alt text, tags, folder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearch("")}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {topTags.map(({ tag, count }) => {
              const active = normalize(search) === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSearch(active ? "" : tag)}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted hover:bg-muted/80 border border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Tag className="h-3.5 w-3.5" />
                  {tag}
                  <span className="text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{filtered.length}</strong>{" "}
        of <strong className="text-foreground">{assets.length}</strong> assets
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-muted/40 animate-pulse h-80"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed rounded-2xl p-12 text-center text-muted-foreground bg-muted/20">
          <ImageIcon className="h-16 w-16 mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-medium mb-3">No assets found</h3>
          <p className="max-w-md mx-auto">
            {search
              ? "Try a different search term or clear the filter."
              : "Start by uploading your first image or file."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        },
      );

      if (alt !== asset.alt) {
        await fetch(
          `/api/admin/assets/alt?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asset_id: asset._id, alt }),
          },
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
      let res = await fetch(
        `/api/admin/assets/hard-delete?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset_id: asset._id }),
        },
      );

      if (!res.ok) {
        res = await fetch(
          `/api/admin/assets/delete?site_id=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asset_id: asset._id }),
          },
        );
      }

      if (res.ok) await onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="group relative border border-border/60 rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-lg hover:border-border transition-all duration-200">
      {/* Preview */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/40 to-muted/70 overflow-hidden">
        {asset.kind === "image" ? (
          <>
            <img
              src={asset.url}
              alt={asset.alt || asset.key}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/70">
            <File className="h-14 w-14 mb-4 opacity-60" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {asset.mime?.split("/")[1] || "FILE"}
            </span>
          </div>
        )}

        {asset.width && asset.height && (
          <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {asset.width} × {asset.height}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Alt Text
          </label>
          <input
            className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descriptive text for accessibility..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Folder className="h-4 w-4" />
            Folder
          </label>
          <input
            className="w-full px-4 py-2.5 font-mono bg-background border border-input rounded-lg text-sm focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="/images/heroes"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            Tags
          </label>
          <input
            className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="comma, separated, tags"
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t) => (
                <div
                  key={t}
                  onClick={() => onTagClick(t)}
                  className="group/tag inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full hover:bg-secondary/90 transition-colors cursor-pointer"
                >
                  {t}
                  <button
                    className="p-0.5 rounded-full hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTagsText(tags.filter((tag) => tag !== t).join(", "));
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-muted transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(asset.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy URL"}
          </button>

          <button
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm"
            onClick={saveMetadata}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            className={`ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              showDeleteConfirm
                ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                : "text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300"
            }`}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            {showDeleteConfirm ? "Confirm Delete" : "Delete"}
          </button>
        </div>

        <div className="text-xs text-muted-foreground/70 font-mono break-all pt-2 leading-relaxed">
          {asset.key}
        </div>
      </div>
    </div>
  );
}
