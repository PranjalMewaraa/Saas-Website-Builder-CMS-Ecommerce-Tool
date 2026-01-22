"use client";

import { useState } from "react";
import ImageField from "../(adminPages)/content/_component/ImageField";

type SeoData = {
  title?: string;
  description?: string;
  ogImageAssetId?: string;
  // add other seo fields you might use later (keywords, canonical, etc.)
};

type PageSeoEditorProps = {
  siteId: string;
  slug: string;
  seo?: any;
  assetsMap: Record<string, any>;
};

export default function PageSeoEditor({
  siteId,
  slug,
  seo = {},
  assetsMap,
}: PageSeoEditorProps) {
  const [state, setState] = useState<SeoData>(seo);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaveStatus("idle");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/seo/page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_id: siteId,
          slug,
          seo: state,
        }),
      });

      if (!response.ok) {
        let errorDetail = "Failed to save SEO settings";
        try {
          const errorBody = await response.json();
          errorDetail = errorBody.error || errorDetail;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorDetail);
      }

      // Optional: you could refresh the seo data from response if the backend returns it
      // const result = await response.json();
      // setState(result.seo || state);

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      console.error("SEO save failed:", err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SEO Settings</h3>

        {saveStatus === "success" && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Saved successfully
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Page Title
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            placeholder="e.g. Best Wireless Headphones 2025 | MyStore"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            value={state.title || ""}
            onChange={(e) => setState({ ...state, title: e.target.value })}
            maxLength={70}
          />
          <p className="text-xs text-gray-500">
            {state.title?.length || 0} / 70 characters
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <textarea
            placeholder="Describe your page in 1-2 sentences (appears in search results)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 min-h-[100px] resize-y"
            value={state.description || ""}
            onChange={(e) =>
              setState({ ...state, description: e.target.value })
            }
            maxLength={160}
          />
          <p className="text-xs text-gray-500">
            {state.description?.length || 0} / 160 characters
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Open Graph / Social Preview Image
          </label>
          <ImageField
            siteId={siteId}
            label="OG Image (recommended: 1200×630)"
            assetIdValue={state.ogImageAssetId || ""}
            altValue="" // you can add ogImageAlt if you want
            onChangeAssetId={(v) => setState({ ...state, ogImageAssetId: v })}
            onChangeAlt={() => {}}
            assetsMap={assetsMap}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={save}
          disabled={saving}
          className={`
            inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm
            ${
              saving
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
            }
            transition-colors
          `}
        >
          {saving ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            "Save SEO Settings"
          )}
        </button>
      </div>
    </div>
  );
}
