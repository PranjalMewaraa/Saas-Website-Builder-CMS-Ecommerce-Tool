"use client";

import { useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { Loader2, Link2, RefreshCw, Trash2 } from "lucide-react";

type PreviewStatus = "idle" | "loading" | "success" | "error";

export default function PreviewClient({
  siteId,
  handle,
}: {
  siteId: string;
  handle: string;
}) {
  const { toast } = useUI();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [status, setStatus] = useState<PreviewStatus>("idle");

  const isLoading = status === "loading";

  const handleGeneratePreview = async () => {
    try {
      setStatus("loading");
      const res = await fetch(
        `/api/admin/preview?site_id=${encodeURIComponent(siteId)}&handle=${encodeURIComponent(handle)}`,
        { method: "POST" },
      );

      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Preview generation failed");

      setPreviewUrl(data.previewUrl);
      toast({
        variant: "success",
        title: "Preview ready",
        description: "Draft preview has been generated.",
      });
    } catch (err: any) {
      toast({
        variant: "error",
        title: "Preview failed",
        description: err.message || "Could not generate preview",
      });
    } finally {
      setStatus("idle");
    }
  };

  const handleRegenerateToken = async () => {
    try {
      setStatus("loading");
      const res = await fetch(
        `/api/admin/preview/token?site_id=${encodeURIComponent(siteId)}`,
        { method: "POST" },
      );

      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Token regeneration failed");

      setPreviewUrl("");
      toast({
        variant: "success",
        title: "Token regenerated",
        description: "All previous preview links are now invalid.",
      });
    } catch (err: any) {
      toast({
        variant: "error",
        title: "Failed to regenerate token",
        description: err.message,
      });
    } finally {
      setStatus("idle");
    }
  };

  const handleClearPreview = async () => {
    try {
      setStatus("loading");
      await fetch(
        `/api/admin/preview/clear?site_id=${encodeURIComponent(siteId)}`,
        { method: "POST" },
      );

      setPreviewUrl("");
      toast({
        variant: "success",
        title: "Preview cleared",
        description: "Draft preview has been removed.",
      });
    } catch {
      toast({
        variant: "error",
        title: "Failed to clear preview",
      });
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="border rounded-xl p-5 bg-white/50 backdrop-blur-sm space-y-5 shadow-sm max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Site:{" "}
          <span className="font-mono font-medium text-foreground">
            {siteId}
          </span>{" "}
          · Handle:{" "}
          <span className="font-mono font-medium text-foreground">
            @{handle}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGeneratePreview}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-b from-black to-gray-900 text-white font-medium rounded-lg shadow hover:from-gray-900 hover:to-black transition disabled:opacity-60 disabled:pointer-events-none"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Generate Draft Preview
        </button>

        <button
          onClick={handleRegenerateToken}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg transition disabled:opacity-60 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Regenerate Token
        </button>

        <button
          onClick={handleClearPreview}
          disabled={isLoading || !previewUrl}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 hover:bg-red-50 font-medium rounded-lg transition disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Clear Preview
        </button>
      </div>

      {/* Preview URL */}
      {previewUrl && (
        <div className="pt-3 border-t">
          <div className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            Preview Link (shareable)
          </div>

          <div className="group relative">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono break-all hover:bg-gray-100 transition-colors"
            >
              {previewUrl}
            </a>

            {/* Optional: copy button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(previewUrl);
                toast({
                  variant: "success",
                  title: "Copied!",
                  description: "Preview URL copied to clipboard.",
                });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border rounded px-2.5 py-1 text-xs font-medium hover:bg-gray-50"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
