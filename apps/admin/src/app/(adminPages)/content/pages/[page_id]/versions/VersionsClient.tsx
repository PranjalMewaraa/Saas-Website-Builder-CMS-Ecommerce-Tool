"use client";

import { useState } from "react";

type RevisionRow = {
  id: string;
  actor_name: string | null;
  note: string | null;
  created_at: string;
};

type Props = {
  siteId: string;
  pageId: string;
  revisions: RevisionRow[];
};

export default function VersionsClient({ siteId, pageId, revisions }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const restore = async (revisionId: string) => {
    const ok = window.confirm(
      "Restore this version? Your current draft will be saved as a new revision first.",
    );
    if (!ok) return;
    setBusyId(revisionId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/pages/${encodeURIComponent(pageId)}/revisions/${encodeURIComponent(
          revisionId,
        )}/restore?site_id=${encodeURIComponent(siteId)}`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError("Could not restore. Please try again.");
        return;
      }
      window.location.reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-2">
      {error ? (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : null}
      <ol className="divide-y border rounded overflow-hidden">
        {revisions.map((r, idx) => (
          <li
            key={r.id}
            className="px-4 py-3 flex items-center justify-between gap-4 text-sm"
          >
            <div className="min-w-0">
              <div className="font-medium">
                {new Date(r.created_at).toLocaleString()}
                {idx === 0 ? (
                  <span className="ml-2 text-xs rounded bg-emerald-100 text-emerald-700 px-2 py-0.5">
                    Current
                  </span>
                ) : null}
              </div>
              <div className="text-slate-500 truncate">
                {r.actor_name || "Unknown"}
                {r.note ? ` · ${r.note}` : ""}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {r.id}
              </div>
            </div>
            <button
              type="button"
              onClick={() => restore(r.id)}
              disabled={busyId === r.id || idx === 0}
              className="text-sm border rounded px-3 py-1 hover:bg-slate-50 disabled:opacity-40"
            >
              {busyId === r.id ? "Restoring…" : idx === 0 ? "Current" : "Restore"}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
