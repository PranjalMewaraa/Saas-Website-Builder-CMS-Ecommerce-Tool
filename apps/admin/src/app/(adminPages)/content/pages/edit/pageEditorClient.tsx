"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
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

import EditorModeToggleVisual from "../../_component/EditorModeToggleVisual";
import { useEditorMode } from "../../_component/useEditorMode";
import ImageField from "../../_component/ImageField";
import { useAssetsMap } from "../../_component/useAssetsMap";
import StylePreviewCard from "../../_component/StylePreviewCard";
import { VisualInspector } from "../../_component/VisualInspector";
import { VisualCanvas } from "../../_component/VisualCanvas";
import { defaultPropsFor } from "./components/inspector/defaultPropsFor";
import LayoutInspector from "../../_component/LayoutInspector";
import type { LayoutSelection } from "../../_component/layout-utils";
import PageSeoEditor from "@/app/_components/PageSeoEditor";

import { BLOCK_TYPES as ALL_BLOCK_TYPES } from "@acme/blocks/registry/block-types";
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

const BLOCK_TYPES = ALL_BLOCK_TYPES.filter((t) => !t.startsWith("Atomic/"));

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
  const { toast, confirm, prompt } = useUI();
  const { mode, setMode } = useEditorMode("form", urlMode, ["form", "json"]);
  const { assetsMap } = useAssetsMap(siteId);
  const [tab, setTab] = useState<"layout" | "seo">("layout");
  const [selection, setSelection] = useState<LayoutSelection | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showOutlines, setShowOutlines] = useState(true);
  const [forms, setForms] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [page, setPage] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [themePalette, setThemePalette] = useState<string[]>([]);
  const [blockTemplates, setBlockTemplates] = useState<any[]>([]);
  const [layoutJson, setLayoutJson] = useState("");
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [addBlockSearch, setAddBlockSearch] = useState("");
  const [addBlockTab, setAddBlockTab] = useState<"templates" | "blocks">(
    "blocks",
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle",
  );
  const [dragBlockId, setDragBlockId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [pageRes, presetsRes, formsRes, themeRes, templatesRes] =
        await Promise.all([
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
          fetch(`/api/admin/theme?site_id=${encodeURIComponent(siteId)}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}`,
            { cache: "no-store" },
          ),
        ]);

      const [pageData, presetsData, formsData, themeData, templatesData] =
        await Promise.all([
          pageRes.json(),
          presetsRes.json(),
          formsRes.json(),
          themeRes.json(),
          templatesRes.json(),
        ]);

      setPresets(presetsData.presets ?? []);
      setForms(formsData.forms ?? []);
      setBlockTemplates(templatesData.templates ?? []);
      const tokens = themeData.theme?.draft_tokens || {};
      const palette = [
        tokens["--color-primary"],
        tokens["--color-bg"],
        tokens["--color-text"],
        tokens["--color-dark"],
        tokens["--color-light"],
      ].filter(Boolean);
      setThemePalette(palette);

      if (pageData.page) {
        setPage(pageData.page);
        setLayoutJson(
          JSON.stringify(pageData.page.draft_layout ?? {}, null, 2),
        );
      }
    })();
  }, [siteId, pageId]);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/admin/menus?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setMenus(data.menus ?? []);
    })();
  }, [siteId]);

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

  function openAddBlockDialog() {
    setAddBlockOpen(true);
    setAddBlockSearch("");
  }

  function addBlockOfType(type: string) {
    const id = `b_${Date.now()}`;

    const defaults = defaultPropsFor(type);
    if (type === "Header/V1") {
      const assigned = menus.find((m: any) => m.slot === "header");
      if (assigned?._id) defaults.menuId = assigned._id;
    }
    if (type === "Footer/V1") {
      const assigned = menus.find((m: any) => m.slot === "footer");
      if (assigned?._id) defaults.menuId = assigned._id;
    }
    if (type === "Form/V1" && forms.length) defaults.formId = forms[0]._id;

    const next = structuredClone(layout);
    next.sections[0].blocks.push({
      id,
      type,
      props: defaults,
      style: defaultStyleFor(type),
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

  function updateBlockById(blockId: string, nextBlock: any) {
    const next = structuredClone(layout);
    const idx = next.sections[0].blocks.findIndex((b: any) => b.id === blockId);
    if (idx < 0) return;
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

  function moveBlockTo(fromId: string, toId: string) {
    if (!fromId || !toId || fromId === toId) return;
    const next = structuredClone(layout);
    const arr = next.sections[0].blocks;
    const fromIndex = arr.findIndex((b: any) => b.id === fromId);
    const toIndex = arr.findIndex((b: any) => b.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    setPage({ ...page, draft_layout: next });
  }

  function deleteBlock(idx: number) {
    const next = structuredClone(layout);
    next.sections[0].blocks.splice(idx, 1);
    setPage({ ...page, draft_layout: next });
  }

  function duplicateBlockById(blockId: string) {
    const next = structuredClone(layout);
    const idx = next.sections[0].blocks.findIndex((b: any) => b.id === blockId);
    if (idx < 0) return;
    const copy = structuredClone(next.sections[0].blocks[idx]);
    copy.id = `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    next.sections[0].blocks.splice(idx + 1, 0, copy);
    setPage({ ...page, draft_layout: next });
  }

  async function saveBlockAsTemplate(block: any) {
    const name = await prompt({
      title: "Template name",
      defaultValue: block.type.replace("/V1", ""),
      placeholder: "Template name",
      confirmText: "Continue",
    });
    if (!name) return;
    const makeTenantWide = await confirm({
      title: "Template scope",
      description:
        "Make this template available across all sites (tenant-wide)?",
      confirmText: "Tenant-wide",
      cancelText: "This site only",
    });
    const scope = makeTenantWide ? "tenant" : "site";
    const tagsText = await prompt({
      title: "Tags",
      placeholder: "comma, separated, tags",
      defaultValue: "",
      confirmText: "Save",
    });
    const tags = (tagsText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch(
      `/api/admin/block-templates?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tags,
          scope,
          block: {
            id: block.id,
            type: block.type,
            props: block.props ?? {},
            style: block.style ?? {},
          },
        }),
      },
    );
    const data = await res.json();
    if (!data.ok) {
      toast({
        variant: "error",
        title: "Failed to save template",
        description: data.error || "Failed to save template",
      });
      return;
    }
    setBlockTemplates((prev) => [data.template, ...prev]);
  }

  function addBlockFromTemplate(tpl: any) {
    const next = structuredClone(layout);
    const block = structuredClone(tpl.block || {});
    block.id = `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    next.sections[0].blocks.push(block);
    setPage({ ...page, draft_layout: next });
    setAddBlockOpen(false);
  }

  return (
    <div className="space-y-6 w-full mx-auto p-8 md:p-8">
      {/* header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b pb-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {page.name || page.title || page.slug}
            </h1>
            <p className="text-sm text-muted-foreground">
              Site: {siteId} · Page: {page.slug}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openAddBlockDialog}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add New Block
            </button>
            <button
              onClick={() =>
                window.open(
                  `/content/pages/editor?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(pageId)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800"
            >
              Switch To Visual Builder
            </button>
            <div className="min-w-max">
              <EditorModeToggleVisual
                mode={mode}
                setMode={setMode}
                showVisual={false}
              />
            </div>
            {mode && (
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
      </div>

      <div>
        <div className="mb-4 inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("layout")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "layout"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Layout
          </button>
          <button
            onClick={() => setTab("seo")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "seo"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-50"
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
                    if (!res.ok)
                      return toast({
                        variant: "error",
                        title: "Invalid JSON",
                        description: res.error,
                      });
                    saveLayout(res.value);
                  }}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Save Draft
                </button>
              </div>
            ) : mode === "visual" ? (
              <div className="grid h-[calc(100vh-220px)] grid-cols-[1fr_320px] gap-6 min-h-0">
                <div className="visual-canvas-scroll space-y-4 overflow-y-auto pr-1 min-h-0">
                  <div className="flex flex-wrap items-center gap-3 bg-white border rounded-xl px-3 py-2">
                    <div className="text-xs text-gray-500">Zoom</div>
                    <select
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {[70, 80, 90, 100, 110, 125, 150].map((z) => (
                        <option key={z} value={z}>
                          {z}%
                        </option>
                      ))}
                    </select>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                      Grid
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={showOutlines}
                        onChange={(e) => setShowOutlines(e.target.checked)}
                      />
                      Outlines
                    </label>
                  </div>
                  <VisualCanvas
                    layout={layout}
                    selection={selection}
                    onSelect={setSelection}
                    onChangeBlock={(nextBlock: any) =>
                      updateBlockById(nextBlock.id, nextBlock)
                    }
                    assetsMap={assetsMap}
                    menus={menus}
                    forms={Object.fromEntries(
                      (forms || []).map((f: any) => [f._id, f]),
                    )}
                    showGrid={showGrid}
                    showOutlines={showOutlines}
                    zoom={zoom}
                    onAddBlock={addBlockOfType}
                    onDeleteBlock={(id: string) => {
                      const idx = blocks.findIndex((b: any) => b.id === id);
                      if (idx >= 0) deleteBlock(idx);
                    }}
                    onDuplicateBlock={(id: string) => duplicateBlockById(id)}
                    onMoveBlock={(fromId: string, toId: string) =>
                      moveBlockTo(fromId, toId)
                    }
                  />
                </div>

                <div className="border rounded-xl p-4 bg-white sticky top-24 h-[calc(100vh-220px)] overflow-y-auto">
                  {selection && selection.kind !== "block" ? (
                    <LayoutInspector
                      block={blocks.find(
                        (b: any) => b.id === selection.blockId,
                      )}
                      selection={selection}
                      siteId={siteId}
                      assetsMap={assetsMap}
                      menus={menus}
                      forms={forms}
                      themePalette={themePalette}
                      onDeleteBlock={(id: string) => {
                        const idx = blocks.findIndex((b: any) => b.id === id);
                        if (idx >= 0) deleteBlock(idx);
                      }}
                      onChangeBlock={(nextBlock: any) =>
                        updateBlockById(nextBlock.id, nextBlock)
                      }
                    />
                  ) : (
                    <VisualInspector
                      block={blocks.find(
                        (b: any) => b.id === selection?.blockId,
                      )}
                      siteId={siteId}
                      assetsMap={assetsMap}
                      forms={forms}
                      menus={menus}
                      themePalette={themePalette}
                      onDeleteBlock={(id: string) => {
                        const idx = blocks.findIndex((b: any) => b.id === id);
                        if (idx >= 0) deleteBlock(idx);
                      }}
                      onChange={(nextBlock: any) => {
                        const idx = blocks.findIndex(
                          (b: any) => b.id === nextBlock.id,
                        );
                        updateBlock(idx, nextBlock);
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* blocks */}
                <div className="space-y-4">
                  {blocks.map((b: any, i: number) => (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={(e) => {
                        setDragBlockId(b.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", b.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId =
                          dragBlockId || e.dataTransfer.getData("text/plain");
                        moveBlockTo(fromId, b.id);
                        setDragBlockId(null);
                      }}
                      onDragEnd={() => setDragBlockId(null)}
                    >
                      <BlockCard
                        block={b}
                        index={i}
                        total={blocks.length}
                        siteId={siteId}
                        menus={menus}
                        forms={forms}
                        presets={presets}
                        assetsMap={assetsMap}
                        themePalette={themePalette}
                        onSaveTemplate={saveBlockAsTemplate}
                        onChange={(nb: any) => updateBlock(i, nb)}
                        onMove={(d: any) => moveBlock(i, d)}
                        onDelete={() => deleteBlock(i)}
                      />
                    </div>
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

      {addBlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200/70 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                  Add Block
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pick a block type to insert into your page
                </p>
              </div>
              <button
                onClick={() => setAddBlockOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-auto">
              <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setAddBlockTab("blocks")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    addBlockTab === "blocks"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Blocks
                </button>
                <button
                  onClick={() => setAddBlockTab("templates")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    addBlockTab === "templates"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Templates
                </button>
              </div>

              <div className="mb-4">
                <input
                  value={addBlockSearch}
                  onChange={(e) => setAddBlockSearch(e.target.value)}
                  placeholder={
                    addBlockTab === "templates"
                      ? "Search templates…"
                      : "Search blocks…"
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>

              {addBlockTab === "templates" ? (
                <>
                  {getTemplateGroups(blockTemplates, addBlockSearch).map(
                    (group) => (
                      <div key={group.title}>
                        <div className="text-sm font-semibold text-gray-700 mb-3">
                          {group.title}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {group.items.map((t: any) => (
                            <button
                              key={t._id}
                              className="border rounded-xl p-3 text-left hover:bg-gray-50 transition"
                              onClick={() => addBlockFromTemplate(t)}
                            >
                              <div className="h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 mb-3 flex items-center justify-center text-xs text-gray-500">
                                {blockPreviewLabel(t.block?.type || "Block")}
                              </div>
                              <div className="text-sm font-medium">
                                {t.name || "Block Template"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {t.block?.type || "Block"} ·{" "}
                                {t.scope === "tenant" ? "Tenant" : "Site"}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </>
              ) : (
                <>
                  {getBlockGroups(BLOCK_TYPES, addBlockSearch).map((group) => (
                    <div key={group.title}>
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        {group.title}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {group.items.map((t) => (
                          <button
                            key={t}
                            className="border rounded-xl p-3 text-left hover:bg-gray-50 transition"
                            onClick={() => {
                              addBlockOfType(t);
                              setAddBlockOpen(false);
                            }}
                          >
                            <div className="h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 mb-3 flex items-center justify-center text-xs text-gray-500">
                              {blockPreviewLabel(t)}
                            </div>
                            <div className="text-sm font-medium">
                              {t.replace("/V1", "")}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {t}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="px-6 py-5 border-t bg-gray-50/70 flex justify-end">
              <button
                onClick={() => setAddBlockOpen(false)}
                className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getBlockGroups(types: string[], searchText: string) {
  const term = searchText.trim().toLowerCase();
  const filtered = term
    ? types.filter((t) => t.toLowerCase().includes(term))
    : types;

  const inSet = (prefixes: string[]) =>
    filtered.filter((t) => prefixes.some((p) => t.startsWith(p)));

  const groups = [
    {
      title: "Layout & Structure",
      items: inSet(["Layout/"]),
    },
    {
      title: "Site Essentials",
      items: inSet(["Header", "Hero", "Footer", "MegaMenu"]),
    },
    {
      title: "Catalog & Product Discovery",
      items: inSet([
        "ProductGrid",
        "ProductList",
        "CategoryGrid",
        "BrandGrid",
        "BestSellers",
        "StoreLocator",
      ]),
    },
    {
      title: "Product Details & Checkout",
      items: inSet(["ProductDetail", "AddToCart", "CartPage", "CartSummary"]),
    },
    {
      title: "Marketing",
      items: inSet([
        "Banner",
        "Features",
        "Testimonials",
        "TestimonialCarousel",
        "Stats",
        "Logos",
        "Newsletter",
        "FAQAccordion",
        "BentoGrid",
        "BeforeAfterSlider",
        "StickyPromoBar",
        "ComparisonTable",
        "MarqueeStrip",
        "SpotlightCards",
        "ProcessTimeline",
        "MediaGalleryMasonry",
        "VideoHeroLite",
        "KPIRibbon",
        "InteractiveTabs",
        "FloatingCTA",
        "ContentSplitShowcase",
        "SocialProofTicker",
      ]),
    },
    {
      title: "Pricing & Offers",
      items: inSet(["PricingTable", "ProductHighlight", "BundleOffer"]),
    },
    {
      title: "Forms",
      items: inSet(["Form/"]),
    },
    {
      title: "Utility",
      items: inSet(["Utility/"]),
    },
  ];

  return groups.filter((g) => g.items.length > 0);
}

function getTemplateGroups(templates: any[], searchText: string) {
  const term = searchText.trim().toLowerCase();
  const filtered = term
    ? (templates || []).filter((t) => {
        const name = String(t?.name || "").toLowerCase();
        const type = String(t?.block?.type || "").toLowerCase();
        const tags = (t?.tags || []).join(" ").toLowerCase();
        return (
          name.includes(term) || type.includes(term) || tags.includes(term)
        );
      })
    : templates || [];

  const groups = [
    {
      title: "Saved Templates",
      items: filtered,
    },
  ];

  return groups.filter((g) => g.items.length > 0);
}

function blockPreviewLabel(type: string) {
  if (type.startsWith("Hero")) return "Hero";
  if (type.startsWith("Header")) return "Header";
  if (type.startsWith("Footer")) return "Footer";
  if (type.startsWith("ProductGrid")) return "Products";
  if (type.startsWith("ProductList")) return "Product List";
  if (type.startsWith("ProductDetail")) return "Product Detail";
  if (type.startsWith("CategoryGrid")) return "Categories";
  if (type.startsWith("BrandGrid")) return "Brands";
  if (type.startsWith("BestSellers")) return "Best Sellers";
  if (type.startsWith("MegaMenu")) return "Mega Menu";
  if (type.startsWith("StoreLocator")) return "Store Locator";
  if (type.startsWith("BundleOffer")) return "Bundle Offer";
  if (type.startsWith("BentoGrid")) return "Bento";
  if (type.startsWith("BeforeAfterSlider")) return "Before/After";
  if (type.startsWith("StickyPromoBar")) return "Promo Bar";
  if (type.startsWith("TestimonialCarousel")) return "Reviews";
  if (type.startsWith("ComparisonTable")) return "Compare";
  if (type.startsWith("MarqueeStrip")) return "Marquee";
  if (type.startsWith("SpotlightCards")) return "Spotlight";
  if (type.startsWith("ProcessTimeline")) return "Timeline";
  if (type.startsWith("MediaGalleryMasonry")) return "Gallery";
  if (type.startsWith("VideoHeroLite")) return "Video Hero";
  if (type.startsWith("KPIRibbon")) return "KPI";
  if (type.startsWith("InteractiveTabs")) return "Tabs";
  if (type.startsWith("FloatingCTA")) return "Floating CTA";
  if (type.startsWith("ContentSplitShowcase")) return "Split";
  if (type.startsWith("SocialProofTicker")) return "Ticker";
  if (type.startsWith("CartPage")) return "Cart";
  if (type.startsWith("CartSummary")) return "Cart Summary";
  if (type.startsWith("AddToCart")) return "Add to Cart";
  if (type.startsWith("Form")) return "Form";
  if (type.startsWith("Banner")) return "CTA";
  if (type.startsWith("Features")) return "Features";
  if (type.startsWith("Testimonials")) return "Quotes";
  if (type.startsWith("Stats")) return "Stats";
  if (type.startsWith("Logos")) return "Logos";
  if (type.startsWith("Newsletter")) return "Newsletter";
  if (type.startsWith("FAQAccordion")) return "FAQ";
  if (type.startsWith("Pricing")) return "Pricing";
  if (type.startsWith("ProductHighlight")) return "Spotlight";
  if (type.startsWith("Layout/Section")) return "Section";
  if (type.startsWith("Utility/Spacer")) return "Spacer";
  if (type.startsWith("Utility/Divider")) return "Divider";
  if (type.startsWith("Utility/RichText")) return "Text";
  return "Block";
}

/* ---------------- block card & forms ---------------- */

/* ---------------- BlockPropsForm, Field, NumberField, Select ---------------- */
/* KEEP YOUR EXISTING IMPLEMENTATION BELOW THIS LINE UNCHANGED */


function defaultStyleFor(type: string) {
  if (type === "Footer/V1") {
    return {
      presetId: undefined,
      overrides: {
        bg: { type: "solid", color: "#0f172a" },
        textColor: "#94a3b8",
        padding: { top: 64, right: 24, bottom: 32, left: 24 },
      },
      responsive: {},
    };
  }
  // BannerCTA renders white text + a white pill button, so it needs a dark
  // surface to be legible. Seed one by default; published blocks keep their
  // own saved style, so this only affects newly inserted blocks.
  if (type === "BannerCTA/V1") {
    return {
      presetId: undefined,
      overrides: {
        bg: { type: "solid", color: "#0f172a" },
        textColor: "#ffffff",
      },
      responsive: {},
    };
  }
  return { presetId: undefined, overrides: {}, responsive: {} };
}
