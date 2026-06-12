"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import SectionInspectorPanel from "./components/SectionInspectorPanel";
import TemplatesPanel from "./components/TemplatesPanel";

import { arrayMove } from "@dnd-kit/sortable";
import { RenderPageBuilder } from "../../../../../packages/renderer/render-page-builder";

import BlockLibraryPanel from "./components/BlockLibraryPanel";
import SectionCanvas from "./components/SectionCanvas";
import InspectorPanel from "./components/InspectorPanel";
import TemplateInsertWizard from "./components/TemplateInsertWizard";
import {
  Button,
  Skeleton,
  EmptyState,
  ConfirmDialog,
  Dialog,
  Input,
  Select,
  Badge,
} from "@acme/ui";

// builder-safe registry (NO mysql imports)
import { getBlockBuilder } from "@acme/blocks/registry/builder";

function defaultProps(type: string): Record<string, any> {
  const def = getBlockBuilder(type);
  if (!def) return {};
  const parsed = def.schema.safeParse({});
  return parsed.success ? parsed.data : {};
}

function firstKey(obj: any) {
  const keys = Object.keys(obj || {});
  return keys.length ? keys[0] : "";
}

function remapBlockRefsForSite(block: any, snapshotLike: any) {
  const menus = snapshotLike.menus || {};
  const forms = snapshotLike.forms || {};
  const assets = snapshotLike.assets || {};

  // menuId
  if (block.props?.menuId && !menus[block.props.menuId]) {
    block.props.menuId = firstKey(menus);
  }

  // formId
  if (block.props?.formId && !forms[block.props.formId]) {
    block.props.formId = firstKey(forms);
  }

  // block-level assets
  if (block.props?.imageAssetId && !assets[block.props.imageAssetId]) {
    block.props.imageAssetId = "";
    // keep imageAlt; url will be resolved later if asset exists
  }
  if (block.props?.logoAssetId && !assets[block.props.logoAssetId]) {
    block.props.logoAssetId = "";
  }

  // block style assets (bg image)
  if (
    block.style?.overrides?.bg?.imageAssetId &&
    !assets[block.style.overrides.bg.imageAssetId]
  ) {
    block.style.overrides.bg.imageAssetId = "";
  }
  if (
    block.style?.responsive?.tablet?.bg?.imageAssetId &&
    !assets[block.style.responsive.tablet.bg.imageAssetId]
  ) {
    block.style.responsive.tablet.bg.imageAssetId = "";
  }
  if (
    block.style?.responsive?.mobile?.bg?.imageAssetId &&
    !assets[block.style.responsive.mobile.bg.imageAssetId]
  ) {
    block.style.responsive.mobile.bg.imageAssetId = "";
  }
}

function remapSectionStyleAssets(sectionStyle: any, snapshotLike: any) {
  const assets = snapshotLike.assets || {};

  if (
    sectionStyle?.overrides?.bg?.imageAssetId &&
    !assets[sectionStyle.overrides.bg.imageAssetId]
  ) {
    sectionStyle.overrides.bg.imageAssetId = "";
  }
  if (
    sectionStyle?.responsive?.tablet?.bg?.imageAssetId &&
    !assets[sectionStyle.responsive.tablet.bg.imageAssetId]
  ) {
    sectionStyle.responsive.tablet.bg.imageAssetId = "";
  }
  if (
    sectionStyle?.responsive?.mobile?.bg?.imageAssetId &&
    !assets[sectionStyle.responsive.mobile.bg.imageAssetId]
  ) {
    sectionStyle.responsive.mobile.bg.imageAssetId = "";
  }
}
function resolveAssetReplacement(
  oldId: string,
  assetMap: Record<string, string>
) {
  const v = assetMap[oldId];
  if (!v || v === "__clear__") return "";
  return v;
}

function applyBlockMapping(block: any, snapshotLike: any, mapping: any) {
  const menus = snapshotLike.menus || {};
  const forms = snapshotLike.forms || {};
  const assets = snapshotLike.assets || {};

  // menuId
  if (block.props?.menuId && !menus[block.props.menuId]) {
    const repl = mapping.menuMap[block.props.menuId];
    block.props.menuId = repl || "";
  }

  // formId
  if (block.props?.formId && !forms[block.props.formId]) {
    const repl = mapping.formMap[block.props.formId];
    block.props.formId = repl || "";
  }

  // props assets
  if (block.props?.imageAssetId && !assets[block.props.imageAssetId]) {
    block.props.imageAssetId = resolveAssetReplacement(
      block.props.imageAssetId,
      mapping.assetMap
    );
  }
  if (block.props?.logoAssetId && !assets[block.props.logoAssetId]) {
    block.props.logoAssetId = resolveAssetReplacement(
      block.props.logoAssetId,
      mapping.assetMap
    );
  }

  // style assets (bg)
  if (
    block.style?.overrides?.bg?.imageAssetId &&
    !assets[block.style.overrides.bg.imageAssetId]
  ) {
    block.style.overrides.bg.imageAssetId = resolveAssetReplacement(
      block.style.overrides.bg.imageAssetId,
      mapping.assetMap
    );
  }
  if (
    block.style?.responsive?.tablet?.bg?.imageAssetId &&
    !assets[block.style.responsive.tablet.bg.imageAssetId]
  ) {
    block.style.responsive.tablet.bg.imageAssetId = resolveAssetReplacement(
      block.style.responsive.tablet.bg.imageAssetId,
      mapping.assetMap
    );
  }
  if (
    block.style?.responsive?.mobile?.bg?.imageAssetId &&
    !assets[block.style.responsive.mobile.bg.imageAssetId]
  ) {
    block.style.responsive.mobile.bg.imageAssetId = resolveAssetReplacement(
      block.style.responsive.mobile.bg.imageAssetId,
      mapping.assetMap
    );
  }
}

function applySectionMapping(
  sectionStyle: any,
  snapshotLike: any,
  mapping: any
) {
  const assets = snapshotLike.assets || {};

  if (
    sectionStyle?.overrides?.bg?.imageAssetId &&
    !assets[sectionStyle.overrides.bg.imageAssetId]
  ) {
    sectionStyle.overrides.bg.imageAssetId = resolveAssetReplacement(
      sectionStyle.overrides.bg.imageAssetId,
      mapping.assetMap
    );
  }
  if (
    sectionStyle?.responsive?.tablet?.bg?.imageAssetId &&
    !assets[sectionStyle.responsive.tablet.bg.imageAssetId]
  ) {
    sectionStyle.responsive.tablet.bg.imageAssetId = resolveAssetReplacement(
      sectionStyle.responsive.tablet.bg.imageAssetId,
      mapping.assetMap
    );
  }
  if (
    sectionStyle?.responsive?.mobile?.bg?.imageAssetId &&
    !assets[sectionStyle.responsive.mobile.bg.imageAssetId]
  ) {
    sectionStyle.responsive.mobile.bg.imageAssetId = resolveAssetReplacement(
      sectionStyle.responsive.mobile.bg.imageAssetId,
      mapping.assetMap
    );
  }
}

export default function BuilderClient({ siteId }: { siteId: string }) {
  const [page, setPage] = useState<any>(null);
  const [rightBp, setRightBp] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [insertWizardOpen, setInsertWizardOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<any>(null);

  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [leftTab, setLeftTab] = useState<"blocks" | "templates">("blocks");

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [pendingDeleteSectionId, setPendingDeleteSectionId] = useState<
    string | null
  >(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [templateScope, setTemplateScope] = useState<"site" | "tenant">("site");
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [templateSaved, setTemplateSaved] = useState(false);

  const [snapshotLike, setSnapshotLike] = useState<any>({
    __mode: "builder",
    is_draft: true,
    handle: "demo-site",
    previewToken: "",
    theme: { tokens: {} },
    stylePresets: {},
    menus: {},
    assets: {},
    forms: {},
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    (async () => {
      const pagesRes = await fetch(
        `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const pagesData = await pagesRes.json();
      const home = (pagesData.pages ?? []).find((p: any) => p.slug === "/");
      setPage(home);

      // ensure at least 1 section exists
      const layout = home?.draft_layout;
      const firstSection = layout?.sections?.[0]?.id;
      setSelectedSectionId(firstSection || "sec_home");

      // load preview dependencies for accurate canvas preview
      const [themeRes, menusRes, presetsRes, assetsRes, formsRes] =
        await Promise.all([
          fetch(`/api/admin/theme?site_id=${encodeURIComponent(siteId)}`, {
            cache: "no-store",
          }),
          fetch(`/api/admin/menus?site_id=${encodeURIComponent(siteId)}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
            { cache: "no-store" }
          ),
          fetch(`/api/admin/assets?site_id=${encodeURIComponent(siteId)}`, {
            cache: "no-store",
          }),
          fetch(`/api/admin/forms?site_id=${encodeURIComponent(siteId)}`, {
            cache: "no-store",
          }),
        ]);

      const themeData = await themeRes.json();
      const menusData = await menusRes.json();
      const presetsData = await presetsRes.json();
      const assetsData = await assetsRes.json();
      const formsData = await formsRes.json();

      const menusMap = Object.fromEntries(
        (menusData.menus ?? []).map((m: any) => [m._id, { tree: m.draft_tree }])
      );
      const presetsMap = Object.fromEntries(
        (presetsData.presets ?? []).map((p: any) => [
          p._id,
          { name: p.name, style: p.style, target: p.target },
        ])
      );
      const assetsMap = Object.fromEntries(
        (assetsData.assets ?? []).map((a: any) => [
          a._id,
          {
            url: a.url,
            alt: a.alt || "",
            width: a.width,
            height: a.height,
            mime: a.mime,
          },
        ])
      );
      const formsMap = Object.fromEntries(
        (formsData.forms ?? []).map((f: any) => [
          f._id,
          { name: f.name, schema: f.draft_schema },
        ])
      );

      setSnapshotLike((prev: any) => ({
        ...prev,
        theme: { tokens: themeData.theme?.draft_tokens || {} },
        menus: menusMap,
        stylePresets: presetsMap,
        assets: assetsMap,
        forms: formsMap,
      }));
    })();
  }, [siteId]);

  const layout = page?.draft_layout || {
    version: 1,
    sections: [{ id: "sec_home", label: "Home", blocks: [] }],
  };

  async function saveDraft(nextLayout?: any) {
    const toSave = nextLayout ?? layout;
    await fetch(`/api/admin/pages?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_id: page._id, draft_layout: toSave }),
    });
  }

  function setLayout(nextLayout: any) {
    setPage({ ...page, draft_layout: nextLayout });
  }

  async function handleSaveDraft() {
    setSaveState("saving");
    try {
      await saveDraft();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } catch {
      setSaveState("idle");
    }
  }

  function ensureSectionId() {
    const ids = (layout.sections ?? []).map((s: any) => s.id);
    return selectedSectionId && ids.includes(selectedSectionId)
      ? selectedSectionId
      : ids[0];
  }

  function addSection() {
    const id = `sec_${Date.now()}`;
    const next = structuredClone(layout);
    next.sections.push({ id, label: "New section", blocks: [] });
    setLayout(next);
    setSelectedSectionId(id);
    setSelectedBlockId("");
  }

  function renameSection(sectionId: string, label: string) {
    const next = structuredClone(layout);
    const sec = next.sections.find((s: any) => s.id === sectionId);
    if (sec) sec.label = label || sec.label;
    setLayout(next);
  }

  function deleteSection(sectionId: string) {
    // MVP rule: don't delete first section (home)
    const idx = (layout.sections ?? []).findIndex(
      (s: any) => s.id === sectionId
    );
    if (idx <= 0) return;

    // if section has blocks, confirm via dialog; otherwise delete immediately
    const sec = layout.sections[idx];
    if (sec.blocks?.length) {
      setPendingDeleteSectionId(sectionId);
      return;
    }
    performDeleteSection(sectionId);
  }

  function performDeleteSection(sectionId: string) {
    const next = structuredClone(layout);
    const idx = next.sections.findIndex((s: any) => s.id === sectionId);
    if (idx <= 0) return;

    next.sections.splice(idx, 1);
    setLayout(next);

    // update selection
    const fallback = next.sections[0]?.id || "";
    setSelectedSectionId(fallback);
    setSelectedBlockId("");
    setPendingDeleteSectionId(null);
  }

  function addBlock(type: string) {
    const secId = ensureSectionId();
    const id = `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const next = structuredClone(layout);
    const sec = next.sections.find((s: any) => s.id === secId);
    if (!sec) return;

    sec.blocks.push({
      id,
      type,
      props: defaultProps(type),
      style: { overrides: {}, responsive: {} },
    });

    setLayout(next);
    setSelectedSectionId(secId);
    setSelectedBlockId(id);
  }

  function findSectionAndIndexByBlockId(blockId: string) {
    for (let si = 0; si < (layout.sections ?? []).length; si++) {
      const blocks = layout.sections[si].blocks ?? [];
      const bi = blocks.findIndex((b: any) => b.id === blockId);
      if (bi >= 0) return { sectionIndex: si, blockIndex: bi };
    }
    return null;
  }

  function updateBlock(blockId: string, nextBlock: any) {
    const loc = findSectionAndIndexByBlockId(blockId);
    if (!loc) return;
    const next = structuredClone(layout);
    next.sections[loc.sectionIndex].blocks[loc.blockIndex] = nextBlock;
    setLayout(next);
  }

  function deleteBlock(blockId: string) {
    const loc = findSectionAndIndexByBlockId(blockId);
    if (!loc) return;
    const next = structuredClone(layout);
    next.sections[loc.sectionIndex].blocks.splice(loc.blockIndex, 1);
    setLayout(next);
    if (selectedBlockId === blockId) setSelectedBlockId("");
  }
  function openTemplateDialog() {
    if (!selectedSection?.blocks?.length) return;
    setTemplateName(selectedSection.label || "Section Template");
    setTemplateTags("");
    setTemplateScope("site");
    setTemplateError("");
    setTemplateOpen(true);
  }

  async function submitSectionTemplate() {
    if (!selectedSection?.blocks?.length) return;
    const name = templateName.trim();
    if (!name) {
      setTemplateError("Give the template a name.");
      return;
    }
    const tags = templateTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setTemplateSaving(true);
    setTemplateError("");
    try {
      const res = await fetch(
        `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            tags,
            scope: templateScope,
            section: {
              label: selectedSection.label || "",
              style: selectedSection.style || {},
              blocks: selectedSection.blocks,
            },
          }),
        }
      );
      const data = await res.json();
      if (!data.ok) {
        setTemplateError(data.error || "Failed to save template.");
        return;
      }
      setTemplateOpen(false);
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 2200);
    } catch {
      setTemplateError("Failed to save template.");
    } finally {
      setTemplateSaving(false);
    }
  }

  function insertTemplateAsSectionWithMapping(
    tpl: any,
    mapping: {
      menuMap: Record<string, string>;
      formMap: Record<string, string>;
      assetMap: Record<string, string>;
    }
  ) {
    const next = structuredClone(layout);
    const newSectionId = `sec_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const sectionStyle = structuredClone(tpl.section?.style || {});
    applySectionMapping(sectionStyle, snapshotLike, mapping);

    const blocks = (tpl.section?.blocks || []).map((b: any) => {
      const block = structuredClone(b);
      block.id = `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      applyBlockMapping(block, snapshotLike, mapping);
      return block;
    });

    next.sections.push({
      id: newSectionId,
      label: tpl.section?.label || tpl.name,
      style: sectionStyle,
      blocks,
    });

    setLayout(next);
    setSelectedSectionId(newSectionId);
    setSelectedBlockId("");
  }

  function duplicateBlock(blockId: string) {
    const loc = findSectionAndIndexByBlockId(blockId);
    if (!loc) return;
    const next = structuredClone(layout);
    const src = next.sections[loc.sectionIndex].blocks[loc.blockIndex];
    const copy = structuredClone(src);
    copy.id = `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    next.sections[loc.sectionIndex].blocks.splice(loc.blockIndex + 1, 0, copy);
    setLayout(next);
    setSelectedBlockId(copy.id);
  }
  function updateSection(sectionId: string, nextSection: any) {
    const next = structuredClone(layout);
    const i = next.sections.findIndex((s: any) => s.id === sectionId);
    if (i >= 0) next.sections[i] = nextSection;
    setLayout(next);
  }

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // active is always a block id
    const fromLoc = findSectionAndIndexByBlockId(activeId);
    if (!fromLoc) return;

    // over can be a block id or a section droppable id
    const overLoc = findSectionAndIndexByBlockId(overId);
    const next = structuredClone(layout);

    // moving within same section
    if (overLoc && overLoc.sectionIndex === fromLoc.sectionIndex) {
      next.sections[fromLoc.sectionIndex].blocks = arrayMove(
        next.sections[fromLoc.sectionIndex].blocks,
        fromLoc.blockIndex,
        overLoc.blockIndex
      );
      setLayout(next);
      return;
    }

    // moving across sections:
    // target section is either the section containing over block OR the section droppable id
    const targetSectionIndex = overLoc
      ? overLoc.sectionIndex
      : next.sections.findIndex((s: any) => s.id === overId);

    if (targetSectionIndex < 0) return;

    const fromBlocks = next.sections[fromLoc.sectionIndex].blocks;
    const [moved] = fromBlocks.splice(fromLoc.blockIndex, 1);

    const toBlocks = next.sections[targetSectionIndex].blocks;
    const insertIndex = overLoc ? overLoc.blockIndex : toBlocks.length;
    toBlocks.splice(insertIndex, 0, moved);

    setLayout(next);
    setSelectedSectionId(next.sections[targetSectionIndex].id);
  }

  if (!page) {
    return (
      <div className="h-screen grid grid-cols-[300px_1fr_420px]">
        <aside className="border-r border-line p-3 space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </aside>
        <main className="p-4 space-y-3" aria-hidden="true">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
        <aside className="border-l border-line p-3 space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </aside>
        <span className="sr-only" role="status">
          Loading builder…
        </span>
      </div>
    );
  }
  const selectedSection =
    layout.sections.find((s: any) => s.id === selectedSectionId) ||
    layout.sections[0];

  const selectedBlock = (() => {
    for (const s of layout.sections) {
      const b = (s.blocks ?? []).find((x: any) => x.id === selectedBlockId);
      if (b) return b;
    }
    return null;
  })();

  const totalBlocks = (layout.sections ?? []).reduce(
    (n: number, s: any) => n + (s.blocks?.length || 0),
    0
  );
  const pendingDeleteSection = pendingDeleteSectionId
    ? layout.sections.find((s: any) => s.id === pendingDeleteSectionId)
    : null;

  return (
    <div className="h-screen grid grid-cols-[300px_1fr_420px]">
      {/* Left: block library + section actions */}
      <aside className="border-r border-line p-3 overflow-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Builder</div>
          <button
            className="border border-line rounded-control px-2 py-1 text-xs"
            type="button"
            onClick={addSection}
          >
            + Section
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className={`border border-line rounded-control px-2 py-1 text-xs ${leftTab === "blocks" ? "bg-ink text-white" : ""}`}
            type="button"
            onClick={() => setLeftTab("blocks")}
          >
            Blocks
          </button>
          <button
            className={`border border-line rounded-control px-2 py-1 text-xs ${leftTab === "templates" ? "bg-ink text-white" : ""}`}
            type="button"
            onClick={() => setLeftTab("templates")}
          >
            Templates
          </button>
        </div>

        <div className="border border-line rounded-control p-2">
          <div className="flex items-center justify-between">
            <div className="text-xs opacity-70">Selected Section</div>
            {templateSaved ? (
              <Badge tone="accent" dot>
                Saved
              </Badge>
            ) : null}
          </div>
          <div className="text-sm font-medium">
            {selectedSection?.label || selectedSection?.id}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2 w-full"
            onClick={openTemplateDialog}
            disabled={!selectedSection?.blocks?.length}
          >
            Save Section as Template
          </Button>
        </div>

        {leftTab === "blocks" ? (
          <BlockLibraryPanel onAdd={(t) => addBlock(t)} />
        ) : (
          <TemplatesPanel
            siteId={siteId}
            snapshotLike={snapshotLike}
            onInsertRequest={(tpl) => {
              setPendingTemplate(tpl);
              setInsertWizardOpen(true);
            }}
          />
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleSaveDraft}
          loading={saveState === "saving"}
        >
          {saveState === "saved" ? "Saved ✓" : "Save Draft"}
        </Button>
      </aside>

      {/* Center: section canvas + live preview */}
      <main className="p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm opacity-70">
            Canvas (drag blocks within/between sections, click to edit)
          </div>
          <div className="text-xs opacity-60">Site: {siteId} · Page: /</div>
        </div>

        {totalBlocks === 0 ? (
          <div className="mb-4 border border-line rounded-card">
            <EmptyState
              title="This page is empty"
              description="Add a block from the library on the left to start building. Drag to reorder, click any block to edit it."
              action={
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setLeftTab("blocks")}
                >
                  Browse blocks
                </Button>
              }
            />
          </div>
        ) : null}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SectionCanvas
            layout={layout}
            selectedBlockId={selectedBlockId}
            selectedSectionId={selectedSectionId}
            onSelectBlock={(id) => {
              setSelectedBlockId(id);
              // auto select the section that contains the block
              const loc = findSectionAndIndexByBlockId(id);
              if (loc)
                setSelectedSectionId(layout.sections[loc.sectionIndex].id);
            }}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setSelectedBlockId("");
            }}
            onDeleteBlock={deleteBlock}
            onDuplicateBlock={duplicateBlock}
            onRenameSection={renameSection}
            onDeleteSection={deleteSection}
          />
        </DndContext>

        <div className="mt-6 border border-line rounded-control">
          <div className="text-xs opacity-70 border-b border-line p-2">
            Live Draft Preview (Renderer)
          </div>
          <div style={(snapshotLike.theme?.tokens || {}) as any}>
            <RenderPageBuilder
              layout={layout}
              ctx={{
                tenantId: "t_demo",
                storeId: "s_demo",
                snapshot: snapshotLike,
              }}
            />
            <TemplateInsertWizard
              open={insertWizardOpen}
              onClose={() => {
                setInsertWizardOpen(false);
                setPendingTemplate(null);
              }}
              template={pendingTemplate}
              snapshotLike={snapshotLike}
              onConfirm={({ menuMap, formMap, assetMap }) => {
                insertTemplateAsSectionWithMapping(pendingTemplate, {
                  menuMap,
                  formMap,
                  assetMap,
                });
                setInsertWizardOpen(false);
                setPendingTemplate(null);
              }}
            />
          </div>
        </div>
      </main>

      {/* Right: inspector */}
      <aside className="border-l border-line p-3 overflow-auto">
        {selectedBlock ? (
          <InspectorPanel
            siteId={siteId}
            snapshotLike={snapshotLike}
            block={selectedBlock}
            onChange={(nextBlock: any) => {
              if (!selectedBlockId) return;
              updateBlock(selectedBlockId, nextBlock);
            }}
          />
        ) : (
          <SectionInspectorPanel
            siteId={siteId}
            snapshotLike={snapshotLike}
            section={selectedSection}
            breakpoint={rightBp}
            onChangeBreakpoint={setRightBp}
            onChangeSection={(nextSection: any) =>
              updateSection(selectedSection.id, nextSection)
            }
          />
        )}
      </aside>

      <ConfirmDialog
        open={!!pendingDeleteSection}
        onClose={() => setPendingDeleteSectionId(null)}
        onConfirm={() => performDeleteSection(pendingDeleteSectionId!)}
        title="Delete this section?"
        description={
          pendingDeleteSection
            ? `“${pendingDeleteSection.label || pendingDeleteSection.id}” contains ${pendingDeleteSection.blocks?.length || 0} block(s). This can't be undone.`
            : undefined
        }
        confirmLabel="Delete section"
        destructive
      />

      <Dialog
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title="Save section as template"
        description="Reuse this section's blocks and styles on other pages or sites."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setTemplateOpen(false)}
              disabled={templateSaving}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={submitSectionTemplate}
              loading={templateSaving}
            >
              Save template
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Template name"
            required
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            error={templateError && !templateName.trim() ? templateError : undefined}
          />
          <Input
            label="Tags"
            hint="Comma-separated, e.g. hero, marketing"
            value={templateTags}
            onChange={(e) => setTemplateTags(e.target.value)}
          />
          <Select
            label="Scope"
            hint="Where this template can be reused."
            value={templateScope}
            onChange={(e) =>
              setTemplateScope(e.target.value as "site" | "tenant")
            }
          >
            <option value="site">This site only</option>
            <option value="tenant">All sites in this account</option>
          </Select>
          {templateError && templateName.trim() ? (
            <p className="text-sm text-danger" role="alert">
              {templateError}
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
