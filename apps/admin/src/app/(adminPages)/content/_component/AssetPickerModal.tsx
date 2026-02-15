"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

export default function AssetPickerModal({
  siteId,
  open,
  onClose,
  onPick,
}: {
  siteId: string;
  open: boolean;
  onClose: () => void;
  onPick: (asset: {
    _id?: string;
    key: string;
    url: string;
    alt?: string;
  }) => void;
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadAssets() {
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
    } catch (e) {
      console.error("Failed to load assets", e);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadAssets();
  }, [open, siteId]);

  async function uploadFile(file: File) {
    const reqId = `asset_upload_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2, 8)}`;
    try {
      setUploading(true);
      console.info("[asset-upload] start", {
        reqId,
        siteId,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const signRes = await fetch(
        `/api/admin/assets/sign?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mime: file.type }),
        },
      );

      const signText = await signRes.text();
      const signData = signText ? JSON.parse(signText) : {};
      if (!signRes.ok) {
        console.error("[asset-upload] sign failed", {
          reqId,
          status: signRes.status,
          body: signData,
        });
        throw new Error(signData?.error || "Sign failed");
      }
      console.info("[asset-upload] sign success", {
        reqId,
        key: signData?.key,
        uploadUrl: signData?.upload?.url,
      });

      const formData = new FormData();
      Object.entries(signData.upload.fields).forEach(([k, v]) =>
        formData.append(k, v as string),
      );
      formData.append("file", file);

      const postRes = await fetch(signData.upload.url, {
        method: "POST",
        body: formData,
      });

      if (!postRes.ok) {
        const uploadBody = await postRes.text().catch(() => "");
        console.error("[asset-upload] s3 post failed", {
          reqId,
          status: postRes.status,
          body: uploadBody,
        });
        throw new Error("Upload failed");
      }
      console.info("[asset-upload] s3 post success", { reqId });

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

      const finText = await finRes.text();
      const finData = finText ? JSON.parse(finText) : {};
      if (!finRes.ok) {
        console.error("[asset-upload] finalize failed", {
          reqId,
          status: finRes.status,
          body: finData,
        });
        throw new Error(finData?.error || "Finalize failed");
      }
      console.info("[asset-upload] finalize success", {
        reqId,
        assetId: finData?.asset?._id,
      });

      // Refresh list
      await loadAssets();

      // Auto-pick newly uploaded asset (prefer finalized DB asset with _id)
      const picked = finData?.asset
        ? {
            _id: finData.asset._id,
            key: finData.asset.key || signData.key,
            url: finData.asset.url || signData.finalUrl,
            alt: finData.asset.alt || "",
          }
        : {
            key: signData.key,
            url: signData.finalUrl,
          };
      onPick(picked);

      onClose();
    } catch (e) {
      console.error("[asset-upload] failed", { reqId, error: e });
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Pick an Asset</div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 border rounded text-sm cursor-pointer hover:bg-muted">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                }}
              />
            </label>

            <button
              className="border rounded px-3 py-1 text-sm"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        {loading && <div className="opacity-70 mt-3">Loading…</div>}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[60vh] overflow-auto">
          {assets.map((a) => (
            <button
              key={a._id}
              className="border rounded p-2 text-left hover:shadow-sm"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPick(a);
                onClose();
              }}
            >
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
              <div className="mt-2 text-xs opacity-70 break-all">{a.key}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
