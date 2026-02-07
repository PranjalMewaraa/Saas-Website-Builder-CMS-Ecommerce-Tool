"use client";

import { useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";

export default function PreviewClient({
  siteId,
  handle,
}: {
  siteId: string;
  handle: string;
}) {
  const { toast } = useUI();
  const [previewUrl, setPreviewUrl] = useState<string>("");

  return (
    <div className="border rounded p-4 space-y-3 max-w-xl">
      <div className="text-sm opacity-70">
        Site: <b>{siteId}</b> · Handle: <b>{handle}</b>
      </div>

      <button
        className="bg-black text-white px-3 py-2 rounded"
        type="button"
        onClick={async () => {
          const res = await fetch(
            `/api/admin/preview?site_id=${encodeURIComponent(siteId)}&handle=${encodeURIComponent(handle)}`,
            { method: "POST" }
          );
          const data = await res.json();
          if (!data.ok) {
            toast({
              variant: "error",
              title: "Preview failed",
              description: data.error || "Preview generation failed",
            });
            return;
          }
          setPreviewUrl(data.previewUrl);
          toast({
            variant: "success",
            title: "Preview ready",
            description: "Draft preview generated.",
          });
        }}
      >
        Generate Draft Preview
      </button>
      <button
        className="border px-3 py-2 rounded"
        type="button"
        onClick={async () => {
          const res = await fetch(
            `/api/admin/preview/token?site_id=${encodeURIComponent(siteId)}`,
            { method: "POST" }
          );
          const data = await res.json();
          if (!data.ok) {
            toast({
              variant: "error",
              title: "Failed to regenerate token",
              description: data.error || "Failed to regenerate token",
            });
            return;
          }

          setPreviewUrl(""); // old link is now invalid
          toast({
            variant: "success",
            title: "Token regenerated",
            description: "Old preview links are now invalid.",
          });
        }}
      >
        Regenerate Preview Token
      </button>

      <button
        className="border px-3 py-2 rounded"
        type="button"
        onClick={async () => {
          await fetch(
            `/api/admin/preview/clear?site_id=${encodeURIComponent(siteId)}`,
            { method: "POST" }
          );
          setPreviewUrl("");
          toast({
            variant: "success",
            title: "Draft preview cleared",
          });
        }}
      >
        Clear Draft Preview
      </button>

      {previewUrl ? (
        <div className="text-sm space-y-2">
          <div className="font-medium">Preview Link</div>
          <a className="underline break-all" href={previewUrl} target="_blank">
            {previewUrl}
          </a>
        </div>
      ) : null}
    </div>
  );
}
