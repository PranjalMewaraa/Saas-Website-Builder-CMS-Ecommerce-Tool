"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageField from "../_component/ImageField";
import { useAssetsMap } from "../_component/useAssetsMap";

export default function SiteSeoPage({
  searchParams,
}: {
  searchParams?: Promise<{ site_id?: string }>;
}) {
  const [siteId, setSiteId] = useState<string | undefined>(undefined);
  const [seo, setSeo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [siteName, setSiteName] = useState<string>("");
  const [confirmInput, setConfirmInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function resolveSearchParams() {
      try {
        const params = await searchParams;
        if (cancelled) return;
        const id = params?.site_id;
        if (!id) {
          setError("No site_id provided in URL");
          setLoading(false);
          return;
        }
        setSiteId(id);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to read URL parameters");
          setLoading(false);
        }
      }
    }
    resolveSearchParams();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const { assetsMap } = useAssetsMap(siteId);

  useEffect(() => {
    if (!siteId) return;
    let isCurrent = true;
    async function fetchSeo() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/seo/site?site_id=${siteId}`);
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        if (isCurrent) setSeo(data.site_seo || {});
      } catch (err) {
        if (isCurrent) setError("Failed to load SEO settings");
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    fetchSeo();
    return () => {
      isCurrent = false;
    };
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;
    let active = true;
    async function fetchSite() {
      try {
        const res = await fetch(`/api/admin/sites?site_id=${siteId}`);
        const data = await res.json();
        if (active) setSiteName(data.site?.name || "");
      } catch {
        if (active) setSiteName("");
      }
    }
    fetchSite();
    return () => {
      active = false;
    };
  }, [siteId]);

  async function save() {
    if (!siteId) return;
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/seo/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, site_seo: seo }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveMessage("Changes synced successfully");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  // --- Styles ---
  const glassCard =
    "bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8";
  const inputStyle =
    "w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder:text-gray-400 font-medium";
  const labelStyle =
    "block text-[13px] font-semibold text-gray-500 ml-1 mb-2 uppercase tracking-wider";

  if (siteId === undefined && !error)
    return (
      <div className="flex items-center justify-center h-screen animate-pulse text-gray-400 font-medium">
        Initializing...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] p-8 md:p-12 font-sans antialiased">
      <div className="max-w-full mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-blue-600 font-semibold text-sm mb-1 uppercase tracking-[0.2em]">
              Configuration
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Site SEO
            </h1>
          </div>
          <button
            onClick={save}
            disabled={saving || loading}
            className={`px-8 py-3 rounded-full font-semibold transition-all shadow-lg active:scale-95 ${
              saving
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:shadow-xl hover:bg-gray-800"
            }`}
          >
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </header>

        {/* Notifications */}
        {(error || saveMessage) && (
          <div
            className={`p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${error ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
          >
            {error || saveMessage}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Main Form Card */}
            <div className={glassCard}>
              <div className="space-y-8">
                <div>
                  <label className={labelStyle}>Brand Identity</label>
                  <input
                    placeholder="Site Name"
                    className={inputStyle}
                    value={seo.siteName || ""}
                    onChange={(e) =>
                      setSeo({ ...seo, siteName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className={labelStyle}>Search Appearance</label>
                  <input
                    placeholder="Title Template (e.g. %s | Site Name)"
                    className={inputStyle}
                    value={seo.titleTemplate || ""}
                    onChange={(e) =>
                      setSeo({ ...seo, titleTemplate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className={labelStyle}>Meta Description</label>
                  <textarea
                    placeholder="Provide a brief summary for search engines..."
                    className={`${inputStyle} min-h-[120px] resize-none`}
                    value={seo.defaultDescription || ""}
                    onChange={(e) =>
                      setSeo({ ...seo, defaultDescription: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <ImageField
                    siteId={siteId!}
                    label="Social Graph Image"
                    assetIdValue={seo.globalOgImageAssetId || ""}
                    altValue=""
                    onChangeAssetId={(v) =>
                      setSeo({ ...seo, globalOgImageAssetId: v })
                    }
                    onChangeAlt={() => {}}
                    assetsMap={assetsMap}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Section */}
            <div className={glassCard}>
              <label className={labelStyle}>Custom Header Scripts</label>
              <textarea
                placeholder=" <meta name=... content=...>"
                className={`${inputStyle} min-h-[160px] font-mono text-xs bg-gray-100 text-gray-900 border-none focus:ring-blue-500/40`}
                value={seo.customHeadHtml || ""}
                onChange={(e) =>
                  setSeo({ ...seo, customHeadHtml: e.target.value })
                }
              />
              <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                Use this to verify site ownership or inject global styles. Code
                is injected directly into the <code>&lt;head&gt;</code> of all
                pages.
              </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/30 border border-red-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-red-600 font-bold mb-1">
                  Destructive Actions
                </h3>
                <p className="text-red-500/70 text-sm">
                  Remove this site and all associated data permanently.
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-6 py-3 rounded-2xl bg-white border border-red-200 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                Delete Site
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Futuristic Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-gray-100/60 backdrop-blur-xl transition-opacity"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Are you sure?</h3>
              <p className="text-gray-500 text-sm mb-8">
                This action is irreversible. Enter <b>{siteName}</b> to confirm
                deletion.
              </p>

              <input
                className={`${inputStyle} text-center mb-6`}
                placeholder="Enter site name"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
              />

              <div className="flex flex-col gap-3">
                <button
                  disabled={confirmInput !== siteName}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${
                    confirmInput === siteName
                      ? "bg-red-600 text-white shadow-lg shadow-red-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={async () => {
                    await fetch(`/api/admin/sites?site_id=${siteId}`, {
                      method: "DELETE",
                    });
                    router.push("/content/sites");
                  }}
                >
                  Confirm Delete
                </button>
                <button
                  className="w-full py-4 text-gray-500 font-semibold hover:text-black transition-colors"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
