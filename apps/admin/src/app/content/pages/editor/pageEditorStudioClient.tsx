"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/app/_components/ui/UiProvider";
import { Plus, Save, Trash2 } from "lucide-react";

import { useEditorMode } from "../../../(adminPages)/content/_component/useEditorMode";
import ImageField from "../../../(adminPages)/content/_component/ImageField";
import { useAssetsMap } from "../../../(adminPages)/content/_component/useAssetsMap";
import StylePreviewCard from "../../../(adminPages)/content/_component/StylePreviewCard";
import { VisualInspector } from "../../../(adminPages)/content/_component/VisualInspector";
import { VisualCanvas } from "../../../(adminPages)/content/_component/VisualCanvas";
import LayoutInspector from "../../../(adminPages)/content/_component/LayoutInspector";
import type { LayoutSelection } from "../../../(adminPages)/content/_component/layout-utils";
import PageSeoEditor from "@/app/_components/PageSeoEditor";

import { BLOCK_TYPES as ALL_BLOCK_TYPES } from "@acme/blocks/registry/block-types";
import BlockCard from "../../../(adminPages)/content/pages/edit/components/BlockCard";

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

export default function PageEditorStudioClient({
  siteId,
  pageId,
  urlMode,
}: {
  siteId: string;
  pageId: string;
  urlMode?: string;
}) {
  const { toast, confirm, prompt } = useUI();
  const { mode } = useEditorMode("visual", "visual", ["visual"]);
  const { assetsMap } = useAssetsMap(siteId);
  const [tab, setTab] = useState<"layout" | "seo">("layout");
  const [selection, setSelection] = useState<LayoutSelection | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showOutlines, setShowOutlines] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState<"layers" | "inspector">(
    "layers",
  );
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

  useEffect(() => {
    if (selection) setLeftPanelTab("inspector");
  }, [selection]);

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
    <div className="w-full h-screen mx-auto p-4 md:p-4">
      <div>
        {tab === "layout" && (
          <>
            {mode === "json" ? (
              <div className="shadow-2xl rounded-xl p-5 bg-white space-y-4">
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
              <div className="grid h-[calc(100vh-20px)] gap-4 min-h-0 grid-cols-[320px_minmax(0,1fr)]">
                <div className="shadow-2xl rounded-xl bg-white p-3 min-h-0 flex flex-col">
                  <div className="space-y-3 shrink-0 border-b border-gray-100 pb-3">
                    <div className="text-base font-semibold text-gray-900 leading-tight">
                      {page.name || page.title || page.slug}
                    </div>
                    <div className="text-xs font-mono text-gray-500 truncate">
                      {page.slug || "/"}
                    </div>
                    <button
                      onClick={openAddBlockDialog}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Block
                    </button>
                    <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1">
                      <button
                        onClick={() => setLeftPanelTab("layers")}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          leftPanelTab === "layers"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Layers
                      </button>
                      <button
                        onClick={() => setLeftPanelTab("inspector")}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          leftPanelTab === "inspector"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Inspector
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 overflow-y-auto min-h-0 pr-1">
                    {leftPanelTab === "layers" ? (
                      <>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Layers
                        </div>
                        <div className="space-y-2">
                          {blocks.map((b: any) => (
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
                                  dragBlockId ||
                                  e.dataTransfer.getData("text/plain");
                                moveBlockTo(fromId, b.id);
                                setDragBlockId(null);
                              }}
                              onDragEnd={() => setDragBlockId(null)}
                              onClick={() =>
                                setSelection({ kind: "block", blockId: b.id })
                              }
                              className={`cursor-grab active:cursor-grabbing rounded-lg border flex items-center justify-between gap-4 px-3 py-2 text-sm ${
                                selection?.blockId === b.id
                                  ? "border-blue-400 bg-blue-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="font-medium text-gray-900 truncate">
                                {b.type}
                              </div>

                              <button
                                type="button"
                                className="text-[10px] px-2 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-50 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveBlockAsTemplate(b);
                                }}
                              >
                                Save Template
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : selection ? (
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        {selection.kind !== "block" ? (
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
                              const idx = blocks.findIndex(
                                (b: any) => b.id === id,
                              );
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
                              const idx = blocks.findIndex(
                                (b: any) => b.id === id,
                              );
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
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                        Select a block from canvas or layers to edit it.
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t bg-white sticky bottom-0 shrink-0">
                    <button
                      onClick={() => saveLayout(layout)}
                      disabled={saveStatus === "saving"}
                      className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        saveStatus === "success"
                          ? "bg-green-600 text-white"
                          : "bg-black text-white"
                      }`}
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </button>
                  </div>
                </div>

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
                    onSelect={(sel) => {
                      setSelection(sel);
                      setLeftPanelTab("inspector");
                    }}
                    onChangeBlock={(nextBlock: any) =>
                      updateBlockById(nextBlock.id, nextBlock)
                    }
                    assetsMap={assetsMap}
                    menus={menus}
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
          <div className="grid h-full min-h-[calc(100vh-20px)] grid-cols-[280px_1fr] gap-4 ">
            <div className="border rounded-xl bg-white p-3 min-h-0 flex flex-col">
              <div className="space-y-3 shrink-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {page.name || page.title || page.slug}
                </div>
                <div className="text-xs font-mono text-gray-500 truncate">
                  {page.slug || "/"}
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setTab("layout")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition text-gray-700 hover:bg-gray-50"
                  >
                    Layout
                  </button>
                  <button
                    onClick={() => setTab("seo")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition bg-black text-white"
                  >
                    SEO
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto min-h-0">
              <PageSeoEditor
                siteId={siteId}
                slug={page.slug}
                seo={page?.seo}
                assetsMap={assetsMap}
              />
            </div>
          </div>
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

function defaultPropsFor(type: string) {
  if (type === "Header/V1")
    return {
      menuId: "menu_main",
      layout: "three-col",
      menuGap: 24,
      actionGap: 8,
      ctaText: "Shop",
      ctaHref: "/products",
      ctaSecondaryText: "Learn more",
      ctaSecondaryHref: "/about",
      contentWidth: "xl",
    };
  if (type === "Footer/V1")
    return {
      menuId: "menu_footer",
      menuGroups: [
        {
          menuId: "menu_footer",
          title: "Links",
          textSize: "sm",
          textStyle: "normal",
        },
      ],
      layout: "multi-column",
      menuColumnGap: 32,
      menuLinkGapX: 24,
      description: "Building better digital experiences since 2023.",
      badgeText: "Designed for modern storefronts",
      showSocials: true,
      socialLinks: [],
    };
  if (type === "Hero/V1")
    return {
      heroPreset: "Basic",
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
        color: "#0f172a",
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
    return {
      title: "Featured Products",
      limit: 8,
      detailPathPrefix: "/products",
      cardVariant: "default",
    };
  if (type === "ProductList/V1")
    return {
      title: "All Products",
      limit: 12,
      showFilters: true,
      showSearch: true,
      detailPathPrefix: "/products",
      cardVariant: "default",
    };
  if (type === "ProductDetail/V1")
    return {
      showRelated: true,
      relatedLimit: 4,
      detailPathPrefix: "/products",
      relatedCardVariant: "default",
    };
  if (type === "CartPage/V1")
    return {
      title: "Your cart",
      emptyTitle: "Your cart is empty",
      emptyCtaText: "Browse products",
      emptyCtaHref: "/products",
      checkoutText: "Checkout",
      checkoutMode: "create-order",
      checkoutHref: "/checkout",
    };
  if (type === "CartSummary/V1")
    return {
      title: "Summary",
      checkoutText: "Checkout",
      checkoutHref: "/checkout",
    };
  if (type === "AddToCart/V1")
    return {
      productId: "",
      title: "Product",
      priceCents: 12900,
      image: "",
      buttonText: "Add to cart",
      variant: "default",
      size: "md",
      showTitle: false,
      showPrice: false,
      showImage: false,
      fullWidth: true,
      badgeText: "",
      noteText: "",
      accentColor: "",
      textColor: "",
      surfaceColor: "",
      radius: 10,
      quantity: 1,
    };
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
  if (type === "FAQAccordion/V1")
    return {
      title: "Frequently Asked Questions",
      subtitle: "Everything customers ask before buying.",
      items: [
        {
          question: "How long does shipping take?",
          answer: "Delivery usually takes 3-7 business days.",
        },
        {
          question: "Can I return an item?",
          answer: "Yes, returns are supported within 7 days.",
        },
      ],
    };
  if (type === "CategoryGrid/V1")
    return {
      title: "Shop by Category",
      subtitle: "Pick a category to explore products.",
      categories: [
        { title: "T-Shirts", href: "/products?category=t-shirts" },
        { title: "Jeans", href: "/products?category=jeans" },
        { title: "Footwear", href: "/products?category=footwear" },
        { title: "Accessories", href: "/products?category=accessories" },
      ],
    };
  if (type === "BrandGrid/V1")
    return {
      title: "Shop by Brand",
      subtitle: "Browse your trusted brands.",
      ctaText: "View all brands",
      ctaHref: "/brands",
      gap: 16,
      brands: [
        { name: "Urban Co", href: "#", logo: "" },
        { name: "Nova Fit", href: "#", logo: "" },
        { name: "Northline", href: "#", logo: "" },
      ],
    };
  if (type === "BestSellers/V1")
    return {
      title: "Best Sellers",
      subtitle: "Top products customers are buying right now.",
      products: [
        { title: "Premium Hoodie", price: "₹1,999", href: "#" },
        { title: "Everyday Sneakers", price: "₹2,499", href: "#" },
        { title: "Classic Denim", price: "₹1,799", href: "#" },
      ],
    };
  if (type === "MegaMenu/V1")
    return {
      title: "Explore",
      subtitle: "Navigate your catalog quickly.",
      columns: 4,
      ctaText: "View all products",
      ctaHref: "/products",
      showSearch: true,
      searchPlaceholder: "Search products, collections, brands...",
      sections: [
        {
          title: "New Arrivals",
          links: [
            { label: "Latest Drop", href: "/products", badge: "New" },
            { label: "Trending", href: "/products?sort=newest" },
          ],
        },
        {
          title: "Collections",
          links: [
            { label: "Summer", href: "/products?collection=summer" },
            { label: "Essentials", href: "/products?collection=essentials" },
          ],
        },
      ],
      promo: {
        title: "Weekend Drop",
        description: "Up to 40% off selected items.",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        ctaText: "Shop Offer",
        ctaHref: "/products",
      },
    };
  if (type === "StoreLocator/V1")
    return {
      title: "Find a store near you",
      subtitle: "See address, contact and opening hours.",
      searchPlaceholder: "Search city or area",
      showMap: true,
      ctaText: "Contact support",
      ctaHref: "/contact",
      stores: [
        {
          name: "Flagship Store",
          badge: "Open",
          address: "21 Market Street",
          city: "Mumbai",
          state: "MH",
          phone: "+91 90000 00001",
          email: "flagship@example.com",
          hours: "Mon-Sat 10 AM - 9 PM",
          mapUrl: "https://maps.google.com/?q=Mumbai",
        },
      ],
    };
  if (type === "BundleOffer/V1")
    return {
      title: "Bundle and save more",
      subtitle: "Get instant discount when buying together.",
      currency: "INR",
      discountType: "percent",
      discountValue: 10,
      ctaText: "Buy bundle",
      ctaHref: "/cart",
      note: "Discount applies at checkout.",
      items: [
        { name: "Classic Tee", qty: 1, price: 899, image: "" },
        { name: "Athletic Jogger", qty: 1, price: 1499, image: "" },
        { name: "Everyday Cap", qty: 1, price: 499, image: "" },
      ],
    };
  if (type === "BentoGrid/V1")
    return {
      title: "Why customers choose us",
      subtitle: "Designed for clarity, speed, and conversion.",
      items: [
        {
          title: "Built for conversion",
          description: "High-impact layout patterns optimized for ecommerce.",
          badge: "Growth",
          size: "lg",
          href: "#",
        },
        {
          title: "Fast checkout flow",
          description: "Reduced friction from product page to order completion.",
          badge: "Speed",
          size: "sm",
          href: "#",
        },
        {
          title: "Content + commerce",
          description: "Blend storytelling and catalog blocks in one page.",
          badge: "Flexible",
          size: "sm",
          href: "#",
        },
      ],
    };
  if (type === "BeforeAfterSlider/V1")
    return {
      title: "See the transformation",
      subtitle: "Drag the slider to compare before and after.",
      beforeImageAssetId: "",
      afterImageAssetId: "",
      beforeLabel: "Before",
      afterLabel: "After",
      height: 420,
    };
  if (type === "StickyPromoBar/V1")
    return {
      text: "Free shipping on orders above ₹999",
      ctaText: "Shop Now",
      ctaHref: "/products",
      position: "top",
      align: "center",
      offsetX: 12,
      offsetY: 8,
      radius: 12,
      maxWidth: "1152px",
      dismissible: false,
      theme: "dark",
    };
  if (type === "TestimonialCarousel/V1")
    return {
      title: "Loved by growing brands",
      subtitle: "Real stories from teams using this builder.",
      autoplayMs: 5000,
      testimonials: [
        {
          quote: "The builder helped us launch our store in days, not weeks.",
          name: "Aarav Shah",
          role: "Founder, Northline",
          rating: 5,
        },
        {
          quote: "Visual editing is clean and fast. We ship pages much quicker now.",
          name: "Riya Mehta",
          role: "Marketing Lead, Nova Fit",
          rating: 5,
        },
      ],
    };
  if (type === "ComparisonTable/V1")
    return {
      title: "Compare plans",
      subtitle: "Find the right plan for your stage of growth.",
      columns: ["Starter", "Growth", "Scale"],
      rows: [
        { feature: "Monthly Projects", values: ["5", "25", "Unlimited"] },
        { feature: "Team Members", values: ["1", "5", "Unlimited"] },
        { feature: "Custom Domain", values: ["No", "Yes", "Yes"] },
      ],
    };
  if (type === "MarqueeStrip/V1")
    return {
      items: ["Free Shipping", "Easy Returns", "Secure Checkout", "24x7 Support"],
      speedSec: 30,
      pauseOnHover: true,
      itemGap: 24,
    };
  if (type === "SpotlightCards/V1")
    return {
      title: "Why Choose Us",
      subtitle: "Everything built to improve conversion.",
      cards: [
        { title: "Fast Setup", description: "Go live quickly with visual blocks.", icon: "⚡", href: "#" },
        { title: "Design Flexibility", description: "Customize every section deeply.", icon: "🎨", href: "#" },
        { title: "Commerce Ready", description: "Catalog, cart, and checkout included.", icon: "🛒", href: "#" },
      ],
    };
  if (type === "ProcessTimeline/V1")
    return {
      title: "How It Works",
      subtitle: "A simple three-step process.",
      steps: [
        { title: "Create Site", description: "Setup your store and theme." },
        { title: "Build Pages", description: "Compose sections and blocks." },
        { title: "Launch", description: "Publish and track growth." },
      ],
    };
  if (type === "MediaGalleryMasonry/V1")
    return {
      title: "Gallery",
      subtitle: "Showcase your brand visuals.",
      columns: 3,
      items: [{}, {}, {}, {}, {}],
    };
  if (type === "VideoHeroLite/V1")
    return {
      title: "Build and launch faster",
      subtitle: "Modern pages with visual control.",
      ctaText: "Get Started",
      ctaHref: "/",
      minHeight: 520,
      overlayOpacity: 0.45,
      videoAssetId: "",
      videoUrl: "",
      posterAssetId: "",
      posterUrl: "",
    };
  if (type === "KPIRibbon/V1")
    return {
      items: [
        { value: "120K+", label: "Orders Processed", icon: "📦" },
        { value: "99.9%", label: "Platform Uptime", icon: "⚡" },
        { value: "4.8/5", label: "Customer Rating", icon: "⭐" },
        { value: "24/7", label: "Support", icon: "💬" },
      ],
    };
  if (type === "InteractiveTabs/V1")
    return {
      title: "Explore",
      subtitle: "Keep content organized in tabs.",
      tabs: [
        { label: "Overview", title: "Overview", content: "Explain your core value." },
        { label: "Features", title: "Features", content: "List key capabilities." },
        { label: "Use Cases", title: "Use Cases", content: "Show who it is for." },
      ],
    };
  if (type === "FloatingCTA/V1")
    return {
      text: "Need help choosing?",
      buttonText: "Talk to us",
      buttonHref: "/contact",
      position: "bottom-right",
    };
  if (type === "ContentSplitShowcase/V1")
    return {
      title: "Build beautiful pages with confidence",
      subtitle: "Combine storytelling and commerce in one clean layout.",
      bullets: ["Visual editor", "Reusable blocks", "Store-ready flow"],
      ctaText: "Get Started",
      ctaHref: "/",
      reverse: false,
      mediaUrl: "",
      mediaAlt: "",
    };
  if (type === "SocialProofTicker/V1")
    return {
      items: [
        "A customer from Mumbai just purchased Premium Hoodie",
        "45 people bought in the last 24 hours",
        "Rated 4.8/5 by 1200+ customers",
      ],
      speedSec: 35,
      itemGap: 24,
    };
  if (type === "Layout/Section")
    return {
      style: {
        display: "flex",
        justify: "center",
      },
      rows: [],
    };
  return {};
}

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
  return { presetId: undefined, overrides: {}, responsive: {} };
}
