"use client";

import { useEffect, useMemo, useState } from "react";
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
    const next = structuredClone(layout);
    const idx = next.sections.findIndex((s: any) => s.id === sectionId);
    if (idx <= 0) return;

    // if section has blocks, confirm
    const sec = next.sections[idx];
    if (sec.blocks?.length) {
      const ok = confirm("Section has blocks. Delete anyway?");
      if (!ok) return;
    }

    next.sections.splice(idx, 1);
    setLayout(next);

    // update selection
    const fallback = next.sections[0]?.id || "";
    setSelectedSectionId(fallback);
    setSelectedBlockId("");
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
  async function saveSectionAsTemplate() {
    if (!selectedSection) return;
    if (!selectedSection.blocks?.length) return alert("Section has no blocks.");

    const name = prompt(
      "Template name",
      selectedSection.label || "Section Template"
    );
    if (!name) return;

    const makeTenantWide = confirm(
      "Make this template tenant-wide?\n\nOK = Tenant-wide\nCancel = Site-only"
    );
    const scope = makeTenantWide ? "tenant" : "site";

    const tagsText = prompt("Tags (comma separated)", "");
    const tags = (tagsText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch(
      `/api/admin/section-templates?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tags,
          scope,
          section: {
            label: selectedSection.label || "",
            style: selectedSection.style || {},
            blocks: selectedSection.blocks,
          },
        }),
      }
    );

    const data = await res.json();
    if (!data.ok) return alert(data.error || "Failed to save template");
    alert(
      scope === "tenant"
        ? "Tenant-wide template saved ✅"
        : "Site template saved ✅"
    );
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

  if (!page) return <div className="p-6 opacity-70">Loading…</div>;
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

  return (
    <div className="h-screen grid grid-cols-[300px_1fr_420px]">
      {/* Left: block library + section actions */}
      <aside className="border-r p-3 overflow-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Builder</div>
          <button
            className="border rounded px-2 py-1 text-xs"
            type="button"
            onClick={addSection}
          >
            + Section
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className={`border rounded px-2 py-1 text-xs ${leftTab === "blocks" ? "bg-black text-white" : ""}`}
            type="button"
            onClick={() => setLeftTab("blocks")}
          >
            Blocks
          </button>
          <button
            className={`border rounded px-2 py-1 text-xs ${leftTab === "templates" ? "bg-black text-white" : ""}`}
            type="button"
            onClick={() => setLeftTab("templates")}
          >
            Templates
          </button>
        </div>

        <div className="border rounded p-2">
          <div className="text-xs opacity-70">Selected Section</div>
          <div className="text-sm font-medium">
            {selectedSection?.label || selectedSection?.id}
          </div>
          <button
            className="border rounded px-2 py-1 text-xs mt-2 w-full"
            type="button"
            onClick={saveSectionAsTemplate}
            disabled={!selectedSection}
          >
            Save Section as Template
          </button>
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

        <button
          className="bg-black text-white rounded px-3 py-2 text-sm w-full"
          type="button"
          onClick={async () => {
            await saveDraft();
            alert("Saved draft ✅");
          }}
        >
          Save Draft
        </button>
      </aside>

      {/* Center: section canvas + live preview */}
      <main className="p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm opacity-70">
            Canvas (drag blocks within/between sections, click to edit)
          </div>
          <div className="text-xs opacity-60">Site: {siteId} · Page: /</div>
        </div>

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

        <div className="mt-6 border rounded">
          <div className="text-xs opacity-70 border-b p-2">
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
      <aside className="border-l p-3 overflow-auto">
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
    </div>
  );
}

function defaultProps(type: string) {
  if (type === "Header/V1")
    return { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" };
  if (type === "Hero")
    return {
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
    };
  if (type === "ProductGrid/V1")
    return { title: "Featured Products", limit: 8 };
  if (type === "Footer/V1") return { menuId: "menu_footer" };
  if (type === "Form/V1")
    return { formId: "form_contact", title: "Contact us", submitText: "Send" };
  return {};
}
