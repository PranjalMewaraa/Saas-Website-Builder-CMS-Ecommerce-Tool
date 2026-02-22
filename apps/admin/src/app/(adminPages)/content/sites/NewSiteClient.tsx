"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  AI_SITE_TAXONOMY,
  listArchetypes,
  type IndustryKey,
} from "@/lib/ai/site-taxonomy";
import { isAiSiteCreationEnabledClient } from "@/lib/ai/feature";

function easySummary(summary: string) {
  return summary
    .replace(/\bUX\b/gi, "experience")
    .replace(/conversion/gi, "sales")
    .replace(/catalog/gi, "product listing")
    .replace(/merchandising/gi, "product display")
    .replace(/spec-heavy/gi, "detail-focused")
    .replace(/narrative-first/gi, "story-first");
}

type NewSiteClientProps = {
  onCreated: (site: any) => void;
};

export default function NewSiteClient({ onCreated }: NewSiteClientProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site_id") || "";
  const aiEnvEnabled = isAiSiteCreationEnabledClient();
  const [aiModuleEnabled, setAiModuleEnabled] = useState(true);
  const aiEnabled = aiEnvEnabled && aiModuleEnabled;
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [industry, setIndustry] = useState<IndustryKey>("generic");
  const archetypes = useMemo(() => listArchetypes(industry), [industry]);
  const [archetype, setArchetype] = useState("");
  const [prompt, setPrompt] = useState("");
  const [ecommerce, setEcommerce] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectedArchetype = archetype || archetypes[0]?.id || "";
  const selectedArchetypeObj =
    archetypes.find((a) => a.id === selectedArchetype) || archetypes[0];

  useEffect(() => {
    let cancelled = false;
    async function loadAiModuleState() {
      if (!siteId) {
        setAiModuleEnabled(true);
        return;
      }
      try {
        const res = await fetch(`/api/admin/sites?site_id=${siteId}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          const enabled = data?.site?.modules_enabled?.ai_site_builder;
          setAiModuleEnabled(enabled !== false);
        }
      } catch {
        if (!cancelled) setAiModuleEnabled(true);
      }
    }
    loadAiModuleState();
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  useEffect(() => {
    if (!aiEnabled && mode === "ai") {
      setMode("manual");
      setBlueprint(null);
    }
  }, [aiEnabled, mode]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !loading) {
        setOpen(false);
        setError(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, loading]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a site name");
      return;
    }
    const selectedArchetype = archetype || archetypes[0]?.id || "";

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === "ai" && aiEnabled
          ? "/api/admin/ai/site/create"
          : "/api/admin/sites/create";
      const payload =
        mode === "ai" && aiEnabled
          ? {
              name: trimmed,
              handle: handle.trim(),
              industry,
              archetype: selectedArchetype,
              prompt: prompt.trim(),
              ecommerce,
              blueprint,
            }
          : { name: trimmed };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to create site");
      }

      onCreated(data.site);
      setName("");
      setHandle("");
      setPrompt("");
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setName("");
    setHandle("");
    setPrompt("");
    setBlueprint(null);
  };

  const handleGeneratePreview = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a site name before generating preview");
      return;
    }
    setPreviewLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai/site/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          handle: handle.trim(),
          industry,
          archetype: archetype || archetypes[0]?.id || "",
          prompt: prompt.trim(),
          ecommerce,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to generate preview");
      }
      setBlueprint(data.blueprint || null);
    } catch (err: any) {
      setError(err.message || "Failed to generate preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`
          inline-flex items-center gap-2 rounded-lg 
          bg-gradient-to-b from-gray-900 to-black 
          px-5 py-2.5 text-sm font-medium text-white 
          shadow-md hover:from-gray-800 hover:to-black 
          transition-all active:scale-[0.98]
        `}
      >
        <span className="text-lg leading-none">+</span> New Site
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose} // click outside to close
        >
          {/* Stop propagation so clicks inside modal don't close it */}
          <div
            className="relative w-[80%] max-w-none max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Create New Site
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="inline-flex rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("manual");
                    setBlueprint(null);
                  }}
                  disabled={loading}
                  className={`px-3 py-1.5 text-sm rounded-md ${mode === "manual" ? "bg-black text-white" : "text-slate-700"}`}
                >
                  Manual
                </button>
                {aiEnabled ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("ai");
                      setBlueprint(null);
                    }}
                    disabled={loading}
                    className={`px-3 py-1.5 text-sm rounded-md ${mode === "ai" ? "bg-black text-white" : "text-slate-700"}`}
                  >
                    Create with AI
                  </button>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="site-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Site Name
                </label>
                <input
                  id="site-name"
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setBlueprint(null);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="e.g. My Online Store"
                  className={`
                    w-full rounded-lg border px-4 py-2.5 text-sm 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-black/30
                    ${error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-black"}
                  `}
                  disabled={loading}
                />

                {error && (
                  <p className="text-sm text-red-600 mt-1.5">{error}</p>
                )}
              </div>

              {mode === "ai" && aiEnabled ? (
                <div className="space-y-2 rounded-lg border p-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Handle (optional)
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      setHandle(e.target.value);
                      setBlueprint(null);
                    }}
                    placeholder="my-store"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    disabled={loading}
                  />

                  <label className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    value={industry}
                    onChange={(e) => {
                      const next = e.target.value as IndustryKey;
                      setIndustry(next);
                      const nextArchetypes = listArchetypes(next);
                      setArchetype(nextArchetypes[0]?.id || "");
                      setBlueprint(null);
                    }}
                    disabled={loading}
                  >
                    {AI_SITE_TAXONOMY.map((i) => (
                      <option key={i.key} value={i.key}>
                        {i.label}
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm font-medium text-gray-700">
                    Archetype
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    value={archetype || archetypes[0]?.id || ""}
                    onChange={(e) => {
                      setArchetype(e.target.value);
                      setBlueprint(null);
                    }}
                    disabled={loading}
                  >
                    {archetypes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {`${a.name} - ${easySummary(a.summary)}`}
                      </option>
                    ))}
                  </select>
                  {selectedArchetypeObj ? (
                    <p className="text-xs text-gray-600 rounded border bg-gray-50 p-2">
                      <span className="font-medium">How it will feel:</span>{" "}
                      {easySummary(selectedArchetypeObj.summary)}. You can edit layout, text and style later.
                    </p>
                  ) : null}

                  <label className="block text-sm font-medium text-gray-700">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      setBlueprint(null);
                    }}
                    placeholder="Describe your brand, audience and desired style..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm min-h-[92px]"
                    disabled={loading}
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={ecommerce}
                      onChange={(e) => {
                        setEcommerce(e.target.checked);
                        setBlueprint(null);
                      }}
                      disabled={loading || previewLoading}
                    />
                    Generate commerce pages
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGeneratePreview}
                      disabled={loading || previewLoading || !name.trim()}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-60"
                    >
                      {previewLoading ? "Generating..." : "Generate Preview"}
                    </button>
                    {blueprint ? (
                      <span className="text-xs text-emerald-700">
                        Ready: {Array.isArray(blueprint.pages) ? blueprint.pages.length : 0} pages
                      </span>
                    ) : null}
                  </div>
                  {blueprint?.pages?.length ? (
                    <div className="max-h-36 overflow-auto rounded border bg-gray-50 p-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Preview Pages</div>
                      <ul className="space-y-1">
                        {blueprint.pages.map((p: any) => (
                          <li
                            key={p.slug}
                            className="text-xs text-gray-600 flex items-center justify-between gap-2"
                          >
                            <span>{p.title}</span>
                            <span>{p.slug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-500">
                    AI generation uses taxonomy + archetype + prompt intent and remains fully editable in the visual builder.
                  </p>
                </div>
              ) : null}

              <p className="text-xs text-gray-500">
                The site name can be changed later in settings.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className={`
                  px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300
                  hover:bg-gray-100 transition disabled:opacity-50
                `}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={
                  loading ||
                  !name.trim() ||
                  (mode === "ai" && aiEnabled && !blueprint)
                }
                className={`
                  inline-flex items-center gap-2 px-6 py-2.5 
                  font-medium rounded-lg text-white shadow-sm
                  transition-all active:scale-[0.98]
                  ${
                    loading
                      ? "bg-gray-400 cursor-wait"
                      : "bg-black hover:bg-gray-900"
                  }
                `}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? "Creating..."
                  : mode === "ai" && aiEnabled
                    ? "Create with AI"
                    : "Create Site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
