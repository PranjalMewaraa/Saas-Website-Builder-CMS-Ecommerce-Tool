"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageField from "../_component/ImageField";
import { useAssetsMap } from "../_component/useAssetsMap";

// Make searchParams optional + Promise-typed (Next.js 15 style)
export default function SiteSeoPage({
  searchParams,
}: {
  searchParams?: Promise<{ site_id?: string }>;
}) {
  // We'll resolve it once and store in state
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

  // Resolve searchParams promise once on mount
  useEffect(() => {
    let cancelled = false;

    async function resolveSearchParams() {
      try {
        // Await the promise — this is the Next.js 15+ recommended way
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
  }, [searchParams]); // ← re-run only if searchParams ref changes (rare)

  // Only fetch when we have a valid siteId
  const { assetsMap } = useAssetsMap(siteId);

  useEffect(() => {
    if (!siteId) return;

    let isCurrent = true;

    async function fetchSeo() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/admin/seo/site?site_id=${siteId}`);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("SEO settings not found for this site");
          }
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        if (isCurrent) {
          setSeo(data.site_seo || {});
        }
      } catch (err) {
        console.error("Failed to load SEO:", err);
        if (isCurrent) {
          setError(
            err instanceof Error ? err.message : "Failed to load SEO settings",
          );
        }
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
    if (!siteId) {
      setError("Cannot save: missing site ID");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/admin/seo/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, site_seo: seo }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save (${res.status})`);
      }

      setSaveMessage("Settings saved successfully ✓");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save SEO settings",
      );
    } finally {
      setSaving(false);
    }
  }

  // Early return while resolving searchParams
  if (siteId === undefined && !error) {
    return (
      <div className="p-6 py-12 text-center text-gray-500">
        Loading page parameters...
      </div>
    );
  }

  if (!siteId) {
    return (
      <div className="p-6 text-red-600">
        Error: Missing or invalid site_id in URL parameters
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">Site SEO</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {saveMessage}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          Loading SEO settings...
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <input
              placeholder="Site Name"
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={seo.siteName || ""}
              onChange={(e) => setSeo({ ...seo, siteName: e.target.value })}
              disabled={saving}
            />

            <input
              placeholder="Title Template (e.g. %s | Site Name)"
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={seo.titleTemplate || ""}
              onChange={(e) =>
                setSeo({ ...seo, titleTemplate: e.target.value })
              }
              disabled={saving}
            />

            <textarea
              placeholder="Default Description (recommended 120–160 characters)"
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              value={seo.defaultDescription || ""}
              onChange={(e) =>
                setSeo({ ...seo, defaultDescription: e.target.value })
              }
              disabled={saving}
            />

            <ImageField
              siteId={siteId}
              label="Global OG Image"
              assetIdValue={seo.globalOgImageAssetId || ""}
              altValue=""
              onChangeAssetId={(v) =>
                setSeo({ ...seo, globalOgImageAssetId: v })
              }
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Custom Head HTML
              </label>
              <textarea
                placeholder="<meta name=&quot;verification&quot; content=&quot;...&quot; />"
                className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px] font-mono"
                value={seo.customHeadHtml || ""}
                onChange={(e) =>
                  setSeo({ ...seo, customHeadHtml: e.target.value })
                }
                disabled={saving}
              />
              <p className="text-xs text-gray-500">
                Inject meta/link/script tags into every page head for this site.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={save}
              disabled={saving || loading}
              className={`
                px-6 py-3 rounded font-medium text-white
                ${
                  saving
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800 active:bg-gray-900"
                }
                transition-colors
              `}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="pt-8">
            <div className="border border-red-200 rounded-xl p-4 bg-red-50/40">
              <div className="text-sm font-semibold text-red-700">
                Danger Zone
              </div>
              <div className="text-sm text-red-600 mt-1">
                Deleting a site removes its pages, assets, menus, templates, and
                drafts. This cannot be undone.
              </div>
              <button
                className="mt-3 inline-flex items-center px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Site
              </button>
            </div>
          </div>
        </>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/70 overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="text-lg font-semibold">Delete Site</div>
              <div className="text-sm text-gray-600">
                Permanently delete this site? This will remove pages, assets,
                menus, templates, and all drafts.
              </div>
              <div className="text-xs text-gray-500">
                Type <b>{siteName || "this site"}</b> to confirm.
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
                  setConfirmDelete(false);
                  setConfirmInput("");
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  confirmInput.trim() &&
                  siteName &&
                  confirmInput.trim() === siteName
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
                onClick={async () => {
                  if (!siteName || confirmInput.trim() !== siteName) return;
                  setConfirmDelete(false);
                  setConfirmInput("");
                  await fetch(`/api/admin/sites?site_id=${siteId}`, {
                    method: "DELETE",
                  });
                  router.push("/content/sites");
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
