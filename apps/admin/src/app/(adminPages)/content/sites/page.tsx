"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import NewSiteClient from "./NewSiteClient";
import {
  Trash2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Globe,
  ChevronRight,
} from "lucide-react";

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

  useEffect(() => {
    if (confirm && inputRef.current) inputRef.current.focus();
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
      alert("Failed to delete site.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 stroke-[1.5]" />
          <p className="text-sm font-medium text-gray-400 tracking-wide">
            Syncing with Cloud...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff] text-[#1D1D1F] selection:bg-blue-100">
      <div className="container mx-auto max-w-5xl px-6 py-12 md:py-20">
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Websites
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              You have <span className="text-black">{sites.length}</span> active
              projects.
            </p>
          </div>
          <div className="flex items-center">
            <NewSiteClient
              onCreated={(site) => setSites((prev) => [site, ...prev])}
            />
          </div>
        </header>

        {/* Sites List */}
        {sites.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md border border-gray-200/60 rounded-[2.5rem] p-20 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-inner">
              <Globe className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold">Start your journey</h3>
            <p className="mt-2 text-gray-500">
              Create a new site to begin managing content.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sites.map((site) => (
              <div
                key={site._id}
                className="group relative bg-white border border-gray-200/50 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  {/* Site Info */}
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                      <Globe className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-blue-600 transition-colors">
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-sm font-medium text-gray-400">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider text-gray-500">
                          {site.handle}
                        </span>
                        <span>•</span>
                        <span className="font-mono opacity-60 uppercase text-[12px]">
                          {site._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/content/pages?site_id=${site._id}`}
                      className="group/link flex items-center gap-2 bg-gray-50 text-gray-900 px-6 py-3 rounded-full text-sm font-bold transition-all hover:bg-black hover:text-white"
                    >
                      Manage Content
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>

                    <button
                      onClick={() =>
                        setConfirm({ id: site._id, name: site.name })
                      }
                      className="p-3 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete site"
                    >
                      <Trash2 className="h-5 w-5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Futuristic Delete Modal */}
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-gray-100/80 backdrop-blur-xl animate-in fade-in duration-300"
              onClick={() => setConfirm(null)}
            />
            <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-gray-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  Confirm Deletion
                </h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  To permanently delete{" "}
                  <span className="font-bold text-gray-900 text-base">
                    "{confirm.name}"
                  </span>{" "}
                  and all its data, please type the site name below.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={confirm.name}
                  className="w-full rounded-2xl bg-gray-50 border border-transparent px-5 py-4 text-center text-sm font-bold transition-all focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none"
                />

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    disabled={confirmInput.trim() !== confirm.name}
                    onClick={handleDelete}
                    className="w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:shadow-none"
                  >
                    Permanently Delete Site
                  </button>
                  <button
                    onClick={() => setConfirm(null)}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
