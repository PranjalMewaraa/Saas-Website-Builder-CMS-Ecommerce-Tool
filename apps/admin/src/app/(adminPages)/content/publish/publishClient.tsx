"use client";

import { useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";

export default function PublishClient({ siteId }: { siteId: string }) {
  const { toast } = useUI();
  const [lastSnap, setLastSnap] = useState<string>("");
  const [url, setUrl] = useState();
  return (
    <div className="border rounded p-4 space-y-3 max-w-xl">
      <div className="text-sm opacity-70">
        Site: <b>{siteId}</b>
      </div>

      <button
        className="bg-black text-white px-3 py-2 rounded"
        onClick={async () => {
          const res = await fetch(
            `/api/admin/publish?site_id=${encodeURIComponent(siteId)}`,
            { method: "POST" },
          );
          const data = await res.json();
          if (!data.ok) {
            toast({
              variant: "error",
              title: "Publish failed",
              description: data.error || "Publish failed",
            });
            return;
          }
          console.log(data);
          setLastSnap(data.snapshot_id);
          setUrl(data.storefront_url);
          toast({
            variant: "success",
            title: "Published",
            description: "Snapshot published successfully.",
          });
        }}
        type="button"
      >
        Publish Snapshot
      </button>

      {lastSnap ? (
        <div className="text-sm">
          <div>
            Snapshot: <span className="font-mono">{lastSnap}</span>
          </div>

          <div className="mt-2">
            Storefront:{" "}
            <a className="underline" href={url} target="_blank">
              Open storefront
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
