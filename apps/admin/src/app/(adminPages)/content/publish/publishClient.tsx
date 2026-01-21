"use client";

import { useState } from "react";

export default function PublishClient({ siteId }: { siteId: string }) {
  const [lastSnap, setLastSnap] = useState<string>("");

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
            { method: "POST" }
          );
          const data = await res.json();
          if (!data.ok) return alert(data.error || "Publish failed");
          setLastSnap(data.snapshot_id);
          alert("Published ✅");
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
            <a
              className="underline"
              href="http://localhost:3002/?handle=demo-site"
              target="_blank"
            >
              Open storefront
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
