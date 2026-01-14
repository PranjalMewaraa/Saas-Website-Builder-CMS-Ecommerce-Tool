"use client";

import { useEffect, useState } from "react";

export default function AssetPickerModal({
  siteId,
  open,
  onClose,
  onPick,
}: {
  siteId: string;
  open: boolean;
  onClose: () => void;
  onPick: (asset: { _id: string; url: string; alt?: string }) => void;
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const res = await fetch(
        `/api/admin/assets?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setAssets(data.assets ?? []);
      setLoading(false);
    })();
  }, [open, siteId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Pick an Asset</div>
          <button
            className="border rounded px-3 py-1 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {loading ? <div className="opacity-70 mt-3">Loading…</div> : null}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[60vh] overflow-auto">
          {assets.map((a) => (
            <button
              key={a._id}
              className="border rounded p-2 text-left hover:shadow-sm"
              type="button"
              onClick={() => {
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
              <div className="mt-2 text-xs opacity-70 break-all">{a._id}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
