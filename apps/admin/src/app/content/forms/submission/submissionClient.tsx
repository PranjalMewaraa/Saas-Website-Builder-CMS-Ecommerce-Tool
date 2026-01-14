"use client";

import { useEffect, useState } from "react";

export default function SubmissionsClient({
  siteId,
  formId,
}: {
  siteId: string;
  formId: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/admin/forms/submissions?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(formId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setRows(data.submissions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [siteId, formId]);

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-70">
        Site: <b>{siteId}</b> · Form: <b>{formId}</b>
      </div>

      <button
        className="border rounded px-3 py-2 text-sm"
        type="button"
        onClick={load}
      >
        Refresh
      </button>

      {loading ? <div className="opacity-70">Loading…</div> : null}
      <a
        className="border rounded px-3 py-2 text-sm inline-block"
        href={`/api/admin/forms/submissions/export?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(formId)}&limit=2000`}
      >
        Download CSV
      </a>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r._id} className="border rounded p-3">
            <div className="text-xs opacity-70">
              {new Date(r.created_at).toLocaleString()}
            </div>
            <pre className="text-xs mt-2 whitespace-pre-wrap">
              {JSON.stringify(r.data, null, 2)}
            </pre>
          </div>
        ))}
        {rows.length === 0 && !loading ? (
          <div className="opacity-70">No submissions yet.</div>
        ) : null}
      </div>
    </div>
  );
}
