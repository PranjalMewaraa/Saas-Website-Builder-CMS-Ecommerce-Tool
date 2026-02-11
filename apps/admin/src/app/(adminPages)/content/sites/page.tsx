"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import NewSiteClient from "./NewSiteClient";
import { Trash2, Loader2, ExternalLink, AlertTriangle } from "lucide-react";

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<null | { id: string; name: string }>(
    null,
  );
  const [confirmInput, setConfirmInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/sites")
      .then((r) => r.json())
      .then((d) => setSites(d.sites || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-focus confirmation input when modal opens
  useEffect(() => {
    if (confirm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [confirm]);

  const handleDelete = async () => {
    if (!confirm || confirmInput.trim() !== confirm.name) return;

    try {
      const res = await fetch(`/api/admin/sites?site_id=${confirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setSites((prev) => prev.filter((site) => site._id !== confirm.id));
      setConfirm(null);
      setConfirmInput("");
    } catch (err) {
      console.error(err);
      // You could add a toast here
      alert("Failed to delete site. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading your sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sites</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your websites and their content
          </p>
        </div>

        <NewSiteClient
          onCreated={(site) => setSites((prev) => [site, ...prev])}
        />
      </div>

      {/* Sites List */}
      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No sites yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first site to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <div
              key={site._id}
              className="group relative rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold tracking-tight">{site.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">@{site.handle}</span>
                    <span className="text-xs opacity-70">
                      • {site._id.slice(-8)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/content/pages?site_id=${site._id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Pages & Content
                  </Link>

                  <button
                    onClick={() => {
                      setConfirm({ id: site._id, name: site.name });
                      setConfirmInput("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setConfirm(null);
            setConfirmInput("");
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-900">
                    Delete "{confirm.name}"?
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    This action is permanent and cannot be undone. All pages,
                    assets, menus, templates, and drafts associated with this
                    site will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label
                  htmlFor="confirm-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Type <span className="font-semibold">{confirm.name}</span> to
                  confirm
                </label>
                <input
                  id="confirm-name"
                  ref={inputRef}
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (confirmInput.trim() === confirm.name) handleDelete();
                    }
                  }}
                  placeholder={confirm.name}
                  autoComplete="off"
                  className={`
                    w-full rounded-lg border px-4 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-red-200
                    ${
                      confirmInput.trim() === confirm.name
                        ? "border-red-500 bg-red-50/30"
                        : "border-gray-300"
                    }
                  `}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setConfirm(null);
                  setConfirmInput("");
                }}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={confirmInput.trim() !== confirm.name}
                onClick={handleDelete}
                className={`
                  inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white
                  transition-all
                  ${
                    confirmInput.trim() === confirm.name
                      ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                      : "bg-red-300 cursor-not-allowed"
                  }
                `}
              >
                <Trash2 className="h-4 w-4" />
                Delete Site Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
