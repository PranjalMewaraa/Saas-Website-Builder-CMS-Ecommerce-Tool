"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewSiteClient from "./NewSiteClient";

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<null | { id: string; name: string }>(
    null,
  );
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    fetch("/api/admin/sites")
      .then((r) => r.json())
      .then((d) => setSites(d.sites || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Sites</h1>

        <NewSiteClient
          onCreated={(site: any) => setSites((prev) => [site, ...prev])}
        />
      </div>

      <div className="grid gap-4">
        {sites.map((s) => (
          <div
            key={s._id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.handle}</div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/content/pages?site_id=${s._id}`}
                className="text-sm underline"
              >
                Open Admin → Pages
              </Link>
              <button
                className="text-sm text-red-600 hover:text-red-700"
                onClick={() => setConfirm({ id: s._id, name: s.name })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/70 overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="text-lg font-semibold">Delete Site</div>
              <div className="text-sm text-gray-600">
                Permanently delete <b>{confirm.name}</b>? This will remove pages,
                assets, menus, templates, and all drafts for this site.
              </div>
              <div className="text-xs text-gray-500">
                Type <b>{confirm.name}</b> to confirm.
              </div>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Type site name to confirm"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 border-t bg-gray-50/70 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => {
                  setConfirm(null);
                  setConfirmInput("");
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  confirmInput.trim() === confirm.name
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
                onClick={async () => {
                  const target = confirm;
                  if (!target || confirmInput.trim() !== target.name) return;
                  setConfirm(null);
                  setConfirmInput("");
                  if (!target) return;
                  await fetch(`/api/admin/sites?site_id=${target.id}`, {
                    method: "DELETE",
                  });
                  setSites((prev) => prev.filter((site) => site._id !== target.id));
                }}
              >
                Delete Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
