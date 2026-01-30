"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  Code,
  ChevronDown,
  ChevronUp,
  Layout,
  Paintbrush,
} from "lucide-react";

import EditorModeToggle from "../../_component/EditorModeToggle";
import { useEditorMode } from "../../_component/useEditorMode";
import ImageField from "../../_component/ImageField";
import { useAssetsMap } from "../../_component/useAssetsMap";
import StylePreviewCard from "../../_component/StylePreviewCard";
import { VisualInspector } from "../../_component/VisualInspector";
import { VisualCanvas } from "../../_component/VisualCanvas";
import PageSeoEditor from "@/app/_components/PageSeoEditor";

import { BLOCKS, getBlock } from "@acme/blocks/registry";
import { title } from "process";
import BlockCard from "./components/BlockCard";

/* ---------------- helpers ---------------- */

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

const BLOCK_TYPES = Object.keys(BLOCKS);

/* ---------------- main ---------------- */

export default function PageEditorClient({
  siteId,
  pageId,
  urlMode,
}: {
  siteId: string;
  pageId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);
  const { assetsMap } = useAssetsMap(siteId);
  const [tab, setTab] = useState<"layout" | "seo">("layout");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [page, setPage] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [layoutJson, setLayoutJson] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle",
  );

  useEffect(() => {
    (async () => {
      const [pageRes, presetsRes, formsRes] = await Promise.all([
        fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(
            siteId,
          )}&page_id=${encodeURIComponent(pageId)}`,
          { cache: "no-store" },
        ),
        fetch(
          `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
          { cache: "no-store" },
        ),
        fetch(`/api/admin/forms?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
      ]);

      const [pageData, presetsData, formsData] = await Promise.all([
        pageRes.json(),
        presetsRes.json(),
        formsRes.json(),
      ]);

      setPresets(presetsData.presets ?? []);
      setForms(formsData.forms ?? []);

      if (pageData.page) {
        setPage(pageData.page);
        setLayoutJson(
          JSON.stringify(pageData.page.draft_layout ?? {}, null, 2),
        );
      }
    })();
  }, [siteId, pageId]);

  async function saveLayout(nextLayout: any) {
    setSaveStatus("saving");

    await fetch(`/api/admin/pages?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_id: page._id, draft_layout: nextLayout }),
    });

    setPage({ ...page, draft_layout: nextLayout });
    setLayoutJson(JSON.stringify(nextLayout, null, 2));

    setSaveStatus("success");
    setTimeout(() => setSaveStatus("idle"), 2200);
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const layout = page.draft_layout || {
    version: 1,
    sections: [{ id: "sec_main", blocks: [] }],
  };

  const blocks = layout.sections?.[0]?.blocks ?? [];

  function addBlock() {
    const sel = document.getElementById(
      "blockType",
    ) as HTMLSelectElement | null;
    if (!sel || !sel.value) return;

    const type = sel.value;
    const id = `b_${Date.now()}`;

    const defaults = defaultPropsFor(type);
    if (type === "Form/V1" && forms.length) defaults.formId = forms[0]._id;

    const next = structuredClone(layout);
    next.sections[0].blocks.push({
      id,
      type,
      props: defaults,
      style: { presetId: undefined, overrides: {} },
    });

    setPage({ ...page, draft_layout: next });
    setLayoutJson(JSON.stringify(next, null, 2));
  }

  function updateBlock(idx: number, nextBlock: any) {
    const next = structuredClone(layout);
    next.sections[0].blocks[idx] = nextBlock;
    setPage({ ...page, draft_layout: next });
    setLayoutJson(JSON.stringify(next, null, 2));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    const next = structuredClone(layout);
    const arr = next.sections[0].blocks;
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setPage({ ...page, draft_layout: next });
  }

  function deleteBlock(idx: number) {
    const next = structuredClone(layout);
    next.sections[0].blocks.splice(idx, 1);
    setPage({ ...page, draft_layout: next });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* header */}
      <div className="flex justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold">{page.name || page.slug}</h1>
          <p className="text-sm text-muted-foreground">
            Site: {siteId} · Page: {page.slug}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EditorModeToggle mode={mode} setMode={setMode} />
          {mode !== "json" && (
            <button
              onClick={() => saveLayout(layout)}
              disabled={saveStatus === "saving"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                saveStatus === "success"
                  ? "bg-green-600 text-white"
                  : "bg-black text-white"
              }`}
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b mb-4">
        <button
          onClick={() => setTab("layout")}
          className={`px-4 py-2 ${
            tab === "layout" ? "border-b-2 border-black" : ""
          }`}
        >
          Layout
        </button>

        <button
          onClick={() => setTab("seo")}
          className={`px-4 py-2 ${
            tab === "seo" ? "border-b-2 border-black" : ""
          }`}
        >
          SEO
        </button>
      </div>

      {tab === "layout" && (
        <>
          {mode === "json" ? (
            <div className="border rounded-xl p-5 bg-white space-y-4">
              <textarea
                className="w-full h-[60vh] font-mono border p-3"
                value={layoutJson}
                onChange={(e) => setLayoutJson(e.target.value)}
              />
              <button
                onClick={() => {
                  const res = safeJsonParse(layoutJson);
                  if (!res.ok) return alert(res.error);
                  saveLayout(res.value);
                }}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save Draft
              </button>
            </div>
          ) : mode === "visual" ? (
            <div className="grid grid-cols-[1fr_360px] gap-6">
              <VisualCanvas
                layout={layout}
                selectedId={selectedBlockId}
                setSelectedId={setSelectedBlockId}
              />

              <div className="border rounded-xl p-4 bg-white">
                <VisualInspector
                  block={blocks.find((b: any) => b.id === selectedBlockId)}
                  siteId={siteId}
                  assetsMap={assetsMap}
                  forms={forms}
                  onChange={(nextBlock: any) => {
                    const idx = blocks.findIndex(
                      (b: any) => b.id === nextBlock.id,
                    );
                    updateBlock(idx, nextBlock);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* add bar */}
              <div className="flex flex-wrap items-end gap-3 bg-white p-4 border rounded-xl shadow-sm">
                <div className="flex-1 min-w-45">
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Add new block
                  </label>
                  <select
                    id="blockType"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose block type...
                    </option>
                    {BLOCK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addBlock}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add Block
                </button>
              </div>

              {/* blocks */}
              <div className="space-y-4">
                {blocks.map((b: any, i: number) => (
                  <BlockCard
                    key={b.id}
                    block={b}
                    index={i}
                    total={blocks.length}
                    siteId={siteId}
                    forms={forms}
                    presets={presets}
                    assetsMap={assetsMap}
                    onChange={(nb: any) => updateBlock(i, nb)}
                    onMove={(d: any) => moveBlock(i, d)}
                    onDelete={() => deleteBlock(i)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === "seo" && (
        <PageSeoEditor
          siteId={siteId}
          slug={page.slug}
          seo={page?.seo}
          assetsMap={assetsMap}
        />
      )}
    </div>
  );
}

/* ---------------- block card & forms ---------------- */

/* ---------------- BlockPropsForm, Field, NumberField, Select ---------------- */
/* KEEP YOUR EXISTING IMPLEMENTATION BELOW THIS LINE UNCHANGED */

function defaultPropsFor(type: string) {
  if (type === "Header/V1")
    return { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" };
  if (type === "Footer/V1") return { menuId: "menu_footer" };
  if (type === "Hero/V1")
    return {
      variant: "basic",
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
      secondaryCtaText: "",
      secondaryCtaHref: "",
      align: "left",
      contentWidth: "xl",
      minHeight: 520,
      bg: {
        type: "none",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        imageAssetId: "",
        imageAlt: "",
        videoAssetId: "",
        posterAssetId: "",
        videoAutoplay: true,
        videoMuted: true,
        videoLoop: true,
        videoControls: false,
        videoPreload: "metadata",
      },
    };

  if (type === "ProductGrid/V1")
    return { title: "Featured Products", limit: 8 };
  if (type === "Form/V1")
    return { formId: "", title: "Contact us", submitText: "Send" };

  if (type === "Utility/Spacer") return { height: 40 };
  if (type === "Utility/Divider")
    return { thickness: 1, color: "#e5e7eb", marginY: 20 };
  if (type === "Utility/RichText")
    return { html: `<h2>Your heading</h2><p>Your paragraph text here.</p>` };
  if (type === "BannerCTA/V1")
    return {
      title: "Title",
      subtitle: "Subtitle",
      buttonText: "Click Here",
      buttonHref: "/",
      align: "center",
    };
  if (type === "FeatureGrid/V1")
    return {
      title: "Section title here",
      features: [
        {
          title: "Lightning Fast Performance",
          description:
            "Built for speed. Pages load in under a second, giving your users the best experience possible.",
        },
        {
          title: "Fully Responsive Design",
          description:
            "Looks perfect on every device — mobile, tablet, desktop — no compromises.",
        },
        {
          title: "Easy Customization",
          description:
            "Change colors, fonts, spacing, and layout with simple Tailwind classes or your own CSS.",
        },
        {
          title: "SEO Optimized",
          description:
            "Clean semantic HTML, fast load times, and meta tags ready to help you rank higher.",
        },
        {
          title: "Dark Mode Ready",
          description:
            "Built-in support for dark mode — just toggle your system preference.",
        },
        {
          title: "Regular Updates",
          description:
            "Continuously improved with new components, patterns, and best practices.",
        },
      ],
    };
  if (type === "Testimonial/V1")
    return {
      title: "Section Title Here",
      testimonials: [
        {
          quote:
            "This product completely changed how we approach our workflow. Highly recommended!",
          name: "Sarah Chen",
          role: "Product Designer at TechCorp",
        },
        {
          quote:
            "The best investment we've made this year. Support is outstanding.",
          name: "Michael Reyes",
          role: "CTO at StartupX",
        },
        {
          quote: "Intuitive, fast, and reliable. Exactly what we needed.",
          name: "Priya Sharma",
          role: "Marketing Lead at Growthify",
        },
      ],
    };
  if (type === "ProductHighlight/V1")
    return {
      title: "Product Title",
      description: "Product Description",
      image: "Pick an Image",
      ctaText: "Button Text",
      ctaHref: "Button Link",
      price: "500",
    };
  if (type === "PricingTable/V1")
    return {
      title: "Title Here",
      plans: [
        {
          name: "Product Title",
          feature: "Product Description",
          ctaText: "Button Text",
          ctaHref: "Button Link",
          price: "500",
        },
        {
          name: "Product Title",
          feature: "Product Description",
          ctaText: "Button Text",
          ctaHref: "Button Link",
          price: "500",
        },
        {
          name: "Product Title",
          feature: "Product Description",
          ctaText: "Button Text",
          ctaHref: "Button Link",
          price: "500",
        },
      ],
    };
  if (type === "StatsCounter/V1")
    return {
      stats: [
        { value: "99.9%", label: "Uptime" },
        { value: "500K+", label: "API Calls Daily" },
        { value: "2.3s", label: "Avg Response Time" },
        { value: "120K+", label: "Deployments" },
      ],
    };
  if (type === "LogosCloud/V1")
    return {
      title: "Your Title here",
      logos: [],
    };
  if (type === "NewsletterSignup/V1")
    return {
      title: "Your Title here",
      subtitle: "Subtitle Here",
    };
  return {};
}
