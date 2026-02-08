"use client";

import { useEffect, useMemo, useState } from "react";

export default function SubmissionsClient({
  siteId,
  formId,
}: {
  siteId: string;
  formId: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [formNameMap, setFormNameMap] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/admin/forms/submission?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(formId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setRows(data.submissions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [siteId, formId]);

  useEffect(() => {
    async function loadForms() {
      const res = await fetch(
        `/api/admin/forms?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const map: Record<string, string> = {};
      for (const f of data.forms || []) {
        map[f._id] = f.name || f._id;
      }
      setFormNameMap(map);
    }
    loadForms();
  }, [siteId]);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const dataText = JSON.stringify(r.data || {}).toLowerCase();
      return (
        String(r._id || "").toLowerCase().includes(q) ||
        String(r.form_id || "").toLowerCase().includes(q) ||
        dataText.includes(q)
      );
    });
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        Site: <b>{siteId}</b> · Form: <b>{formId}</b>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="border rounded-lg px-3 py-2 text-sm w-full sm:w-[320px]"
          placeholder="Search submissions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="border rounded-lg px-3 py-2 text-sm"
          type="button"
          onClick={load}
        >
          Refresh
        </button>
        <a
          className="border rounded-lg px-3 py-2 text-sm inline-block"
          href={`/api/admin/forms/submission/export?site_id=${encodeURIComponent(siteId)}&form_id=${encodeURIComponent(formId)}&limit=2000`}
        >
          Download CSV
        </a>
      </div>

      {loading ? <div className="opacity-70">Loading…</div> : null}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-3 text-xs font-semibold uppercase text-gray-500 border-b">
          <div>Submission</div>
          <div>Form</div>
          <div>Created</div>
          <div className="text-right">Action</div>
        </div>
        <div className="divide-y">
          {filtered.map((r) => (
            <div key={r._id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm">
              <div className="font-medium">{r._id}</div>
              <div className="text-gray-600">
                {formNameMap[r.form_id] || r.form_id}
              </div>
              <div className="text-gray-500">
                {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
              </div>
              <div className="text-right">
                <button
                  className="text-sm font-medium text-blue-600 hover:underline"
                  onClick={() => setSelected(r)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {!filtered.length && !loading ? (
            <div className="px-4 py-8 text-sm text-gray-500 text-center">
              No submissions yet.
            </div>
          ) : null}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Submission</div>
                <div className="text-xs text-gray-500">{selected._id}</div>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              {selected.created_at
                ? new Date(selected.created_at).toLocaleString()
                : "-"}
            </div>

            <pre className="mt-4 rounded-lg border bg-gray-50 p-3 text-xs whitespace-pre-wrap">
              {JSON.stringify(selected.data, null, 2)}
            </pre>

            <div className="mt-6 flex items-center justify-end">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
