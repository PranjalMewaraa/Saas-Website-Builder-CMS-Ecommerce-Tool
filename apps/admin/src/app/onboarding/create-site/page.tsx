"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "../../_components/ui/UiProvider";
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

export default function CreateSitePage() {
  const { toast } = useUI();
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const aiEnabled = isAiSiteCreationEnabledClient();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [industry, setIndustry] = useState<IndustryKey>("generic");
  const archetypes = useMemo(() => listArchetypes(industry), [industry]);
  const [archetype, setArchetype] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [ecommerce, setEcommerce] = useState(true);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [blueprint, setBlueprint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedArchetype = archetype || archetypes[0]?.id || "";
  const selectedArchetypeObj =
    archetypes.find((a) => a.id === selectedArchetype) || archetypes[0];

  async function generatePreview() {
    if (!name.trim()) {
      toast({
        variant: "error",
        title: "Site name required",
        description: "Enter site name before generating preview.",
      });
      return;
    }
    setGeneratingPreview(true);
    const res = await fetch("/api/admin/ai/site/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        handle,
        industry,
        archetype: selectedArchetype,
        prompt,
        ecommerce,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      toast({
        variant: "error",
        title: "Preview generation failed",
        description: data?.error || "Please try again.",
      });
      setGeneratingPreview(false);
      return;
    }
    setBlueprint(data.blueprint || null);
    toast({
      variant: "success",
      title: "Preview ready",
      description: "You can now create the site using this generated blueprint.",
    });
    setGeneratingPreview(false);
  }

  async function submit() {
    setLoading(true);
    const endpoint =
      mode === "ai"
        ? "/api/onboarding/create-site/ai"
        : "/api/onboarding/create-site";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        handle,
        industry,
        archetype: selectedArchetype,
        prompt,
        ecommerce,
        blueprint: mode === "ai" ? blueprint : undefined,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      toast({
        variant: "error",
        title: "Could not create site",
        description: data.error || "Please try again.",
      });
      setLoading(false);
      return;
    }

    router.push(`/content/pages?site_id=${data.site_id}&onboarding=1`);
  }

  return (
    <div className="max-w-2xl mx-auto p-10 space-y-4">
      <h1 className="text-xl font-bold">Create your site</h1>
      <div className="inline-flex rounded-lg border p-1">
        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setBlueprint(null);
          }}
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
            className={`px-3 py-1.5 text-sm rounded-md ${mode === "ai" ? "bg-black text-white" : "text-slate-700"}`}
          >
            Create with AI
          </button>
        ) : null}
      </div>

      <input
        placeholder="Site name"
        className="border p-2 w-full"
        onChange={(e) => {
          setName(e.target.value);
          setBlueprint(null);
        }}
      />

      <input
        placeholder="Handle (demo-site)"
        className="border p-2 w-full"
        onChange={(e) => {
          setHandle(e.target.value);
          setBlueprint(null);
        }}
      />

      {mode === "ai" && aiEnabled ? (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="text-sm font-medium">AI Configuration</div>
          <select
            className="border p-2 w-full"
            value={industry}
            onChange={(e) => {
              const next = e.target.value as IndustryKey;
              setIndustry(next);
              const nextArchetypes = listArchetypes(next);
              setArchetype(nextArchetypes[0]?.id || "");
              setBlueprint(null);
            }}
          >
            {AI_SITE_TAXONOMY.map((i) => (
              <option key={i.key} value={i.key}>
                {i.label}
              </option>
            ))}
          </select>
          <select
            className="border p-2 w-full"
            value={selectedArchetype}
            onChange={(e) => {
              setArchetype(e.target.value);
              setBlueprint(null);
            }}
          >
            {archetypes.map((a) => (
              <option key={a.id} value={a.id}>
                {`${a.name} - ${easySummary(a.summary)}`}
              </option>
            ))}
          </select>
          {selectedArchetypeObj ? (
            <p className="text-xs text-slate-600 rounded border bg-slate-50 p-2">
              <span className="font-medium">How it will feel:</span>{" "}
              {easySummary(selectedArchetypeObj.summary)}. You can change everything later in visual builder.
            </p>
          ) : null}
          <textarea
            placeholder="Describe your business, audience, and style goals..."
            className="border p-2 w-full min-h-[110px]"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setBlueprint(null);
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ecommerce}
              onChange={(e) => {
                setEcommerce(e.target.checked);
                setBlueprint(null);
              }}
            />
            Generate commerce pages (products, product detail, cart)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generatePreview}
              disabled={generatingPreview || !name.trim()}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-60"
            >
              {generatingPreview ? "Generating..." : "Generate Preview"}
            </button>
            {blueprint ? (
              <span className="text-xs text-emerald-700">
                Ready: {Array.isArray(blueprint.pages) ? blueprint.pages.length : 0} pages
              </span>
            ) : null}
          </div>
          {blueprint?.pages?.length ? (
            <div className="max-h-40 overflow-auto rounded border bg-slate-50 p-2">
              <div className="text-xs font-medium text-slate-700 mb-1">Preview Pages</div>
              <ul className="space-y-1">
                {blueprint.pages.map((p: any) => (
                  <li key={p.slug} className="text-xs text-slate-600 flex justify-between gap-2">
                    <span>{p.title}</span>
                    <span>{p.slug}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-xs text-slate-500">
            AI generation uses an additive rules engine (taxonomy + archetype + prompt intent) and is fully editable after creation.
          </p>
        </div>
      ) : null}

      <button
        disabled={
          loading ||
          !name.trim() ||
          !handle.trim() ||
          (mode === "ai" && aiEnabled && !blueprint)
        }
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Creating..." : mode === "ai" && aiEnabled ? "Create with AI" : "Create site"}
      </button>
    </div>
  );
}
