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

import BlockLibraryPanel from "./components/BlockLibraryPanel";
import SectionCanvas from "./components/SectionCanvas";
import InspectorPanel from "./components/InspectorPanel";
import TemplateInsertWizard from "./components/TemplateInsertWizard";
import {
  Plus,
  Save,
  Trash,
  Edit,
  Layout,
  Eye,
  Globe,
  Settings,
} from "lucide-react";
import { RenderPageBuilder } from "../../../../../../packages/renderer/render-page-builder";

function firstKey(obj: any) {
  const keys = Object.keys(obj || {});
  return keys.length ? keys[0] : "";
}

function remapBlockRefsForSite(block: any, snapshotLike: any) {
  const menus = snapshotLike.menus || {};
  const forms = snapshotLike.forms || {};
  const assets = snapshotLike.assets || {};

  if (block.props?.menuId && !menus[block.props.menuId]) {
    block.props.menuId = firstKey(menus);
  }

  if (block.props?.formId && !forms[block.props.formId]) {
    block.props.formId = firstKey(forms);
  }

  if (block.props?.imageAssetId && !assets[block.props.imageAssetId]) {
    block.props.imageAssetId = "";
  }
  if (block.props?.logoAssetId && !assets[block.props.logoAssetId]) {
    block.props.logoAssetId = "";
  }

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
  assetMap: Record<string, string>,
) {
  const v = assetMap[oldId];
  if (!v || v === "__clear__") return "";
  return v;
}

function applyBlockMapping(block: any, snapshotLike: any, mapping: any) {
  const menus = snapshotLike.menus || {};
  const forms = snapshotLike.forms || {};
  const assets = snapshotLike.assets || {};

  if (block.props?.menuId && !menus[block.props.menuId]) {
    const repl = mapping.menuMap[block.props.menuId];
    block.props.menuId = repl || "";
  }

  if (block.props?.formId && !forms[block.props.formId]) {
    const repl = mapping.formMap[block.props.formId];
    block.props.formId = repl || "";
  }

  if (block.props?.imageAssetId && !assets[block.props.imageAssetId]) {
    block.props.imageAssetId = resolveAssetReplacement(
      block.props.imageAssetId,
      mapping.assetMap,
    );
  }
  if (block.props?.logoAssetId && !assets[block.props.logoAssetId]) {
    block.props.logoAssetId = resolveAssetReplacement(
      block.props.logoAssetId,
      mapping.assetMap,
    );
  }

  if (
    block.style?.overrides?.bg?.imageAssetId &&
    !assets[block.style.overrides.bg.imageAssetId]
  ) {
    block.style.overrides.bg.imageAssetId = resolveAssetReplacement(
      block.style.overrides.bg.imageAssetId,
      mapping.assetMap,
    );
  }
  if (
    block.style?.responsive?.tablet?.bg?.imageAssetId &&
    !assets[block.style.responsive.tablet.bg.imageAssetId]
  ) {
    block.style.responsive.tablet.bg.imageAssetId = resolveAssetReplacement(
      block.style.responsive.tablet.bg.imageAssetId,
      mapping.assetMap,
    );
  }
  if (
    block.style?.responsive?.mobile?.bg?.imageAssetId &&
    !assets[block.style.responsive.mobile.bg.imageAssetId]
  ) {
    block.style.responsive.mobile.bg.imageAssetId = resolveAssetReplacement(
      block.style.responsive.mobile.bg.imageAssetId,
      mapping.assetMap,
    );
  }
}

function applySectionMapping(
  sectionStyle: any,
  snapshotLike: any,
  mapping: any,
) {
  const assets = snapshotLike.assets || {};

  if (
    sectionStyle?.overrides?.bg?.imageAssetId &&
    !assets[sectionStyle.overrides.bg.imageAssetId]
  ) {
    sectionStyle.overrides.bg.imageAssetId = resolveAssetReplacement(
      sectionStyle.overrides.bg.imageAssetId,
      mapping.assetMap,
    );
  }
  if (
    sectionStyle?.responsive?.tablet?.bg?.imageAssetId &&
    !assets[sectionStyle.responsive.tablet.bg.imageAssetId]
  ) {
    sectionStyle.responsive.tablet.bg.imageAssetId = resolveAssetReplacement(
      sectionStyle.responsive.tablet.bg.imageAssetId,
      mapping.assetMap,
    );
  }
  if (
    sectionStyle?.responsive?.mobile?.bg?.imageAssetId &&
    !assets[sectionStyle.responsive.mobile.bg.imageAssetId]
  ) {
    sectionStyle.responsive.mobile.bg.imageAssetId = resolveAssetReplacement(
      sectionStyle.responsive.mobile.bg.imageAssetId,
      mapping.assetMap,
    );
  }
}

export default function BuilderClient({ siteId }: { siteId: string }) {
  const [page, setPage] = useState<any>(null);
  const [rightBp, setRightBp] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [insertWizardOpen, setInsertWizardOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<any>(null);

  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [leftTab, setLeftTab] = useState<"sections" | "blocks" | "templates">(
    "sections",
  );
  const [centerTab, setCenterTab] = useState<"canvas" | "preview" | "website">(
    "canvas",
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");

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
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    (async () => {
      const pagesRes = await fetch(
        `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" },
      );
      const pagesData = await pagesRes.json();
      const home = (pagesData.pages ?? []).find((p: any) => p.slug === "/");
      setPage(home);

      const layout = home?.draft_layout;
      const firstSection = layout?.sections?.[0]?.id;
      setSelectedSectionId(firstSection || "sec_home");

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
            { cache: "no-store" },
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
        (menusData.menus ?? []).map((m: any) => [
          m._id,
          { tree: m.draft_tree },
        ]),
      );
      const presetsMap = Object.fromEntries(
        (presetsData.presets ?? []).map((p: any) => [
          p._id,
          { name: p.name, style: p.style, target: p.target },
        ]),
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
        ]),
      );
      const formsMap = Object.fromEntries(
        (formsData.forms ?? []).map((f: any) => [
          f._id,
          { name: f.name, schema: f.draft_schema },
        ]),
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
    next.sections.push({ id, label: "New Section", blocks: [] });
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
    const next = structuredClone(layout);
    const idx = next.sections.findIndex((s: any) => s.id === sectionId);
    if (idx <= 0) return;

    const sec = next.sections[idx];
    if (sec.blocks?.length) {
      const ok = confirm(
        "This section has blocks. Are you sure you want to delete it?",
      );
      if (!ok) return;
    }

    next.sections.splice(idx, 1);
    setLayout(next);

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
      style: defaultStyle(type),
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
    if (!selectedSection.blocks?.length)
      return alert("This section has no blocks to save as a template.");

    const name = prompt(
      "Enter a name for this template",
      selectedSection.label || "My Section Template",
    );
    if (!name) return;

    const makeTenantWide = confirm(
      "Make this template available across all sites (tenant-wide)?\n\nOK = Yes (tenant-wide)\nCancel = No (this site only)",
    );
    const scope = makeTenantWide ? "tenant" : "site";

    const tagsText = prompt(
      "Enter tags (comma-separated, e.g., hero, footer)",
      "",
    );
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
      },
    );

    const data = await res.json();
    if (!data.ok) return alert(data.error || "Failed to save template");
    alert(
      scope === "tenant"
        ? "Template saved and available across all sites ✅"
        : "Template saved for this site ✅",
    );
  }

  function insertTemplateAsSectionWithMapping(
    tpl: any,
    mapping: {
      menuMap: Record<string, string>;
      formMap: Record<string, string>;
      assetMap: Record<string, string>;
    },
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

    const fromLoc = findSectionAndIndexByBlockId(activeId);
    if (!fromLoc) return;

    const overLoc = findSectionAndIndexByBlockId(overId);
    const next = structuredClone(layout);

    if (overLoc && overLoc.sectionIndex === fromLoc.sectionIndex) {
      next.sections[fromLoc.sectionIndex].blocks = arrayMove(
        next.sections[fromLoc.sectionIndex].blocks,
        fromLoc.blockIndex,
        overLoc.blockIndex,
      );
      setLayout(next);
      return;
    }

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
      <div className="p-6 opacity-70 flex items-center justify-center h-screen">
        Loading your page builder...
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

  return (
    <div className="h-screen grid grid-cols-[280px_1fr_360px] bg-gray-50">
      <aside className="border-r border-gray-200 p-4 overflow-auto space-y-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg text-gray-800">
            Page Builder
          </div>
          <button
            className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition"
            type="button"
            onClick={addSection}
            title="Add a new section to your page"
          >
            <Plus size={16} /> New Section
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              leftTab === "sections"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
            onClick={() => setLeftTab("sections")}
          >
            Sections
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              leftTab === "blocks"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
            onClick={() => setLeftTab("blocks")}
          >
            Blocks
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              leftTab === "templates"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
            onClick={() => setLeftTab("templates")}
          >
            Templates
          </button>
        </div>

        {leftTab === "sections" ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Your Sections
            </div>
            {layout.sections.map((sec: any) => (
              <div
                key={sec.id}
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition ${
                  selectedSectionId === sec.id
                    ? "bg-blue-50 border-blue-300"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  setSelectedBlockId("");
                }}
              >
                <span className="text-sm text-gray-800">
                  {sec.label || sec.id}
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newLabel = prompt("Rename section", sec.label);
                      if (newLabel) renameSection(sec.id, newLabel);
                    }}
                    title="Rename this section"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-gray-500 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(sec.id);
                    }}
                    title="Delete this section"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              className="w-full flex items-center justify-center gap-1 border border-dashed border-gray-300 rounded-md py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              onClick={addSection}
            >
              <Plus size={16} /> Add Section
            </button>
          </div>
        ) : leftTab === "blocks" ? (
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
          className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
          type="button"
          onClick={async () => {
            await saveDraft();
            alert("Your draft has been saved successfully ✅");
          }}
        >
          <Save size={16} /> Save Changes
        </button>
      </aside>

      <main className="p-4 overflow-auto bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-800">
            Build Your Page
          </div>
          <div className="text-sm text-gray-500">
            Site: {siteId} · Page: Home (/)
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
              centerTab === "canvas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setCenterTab("canvas")}
          >
            <Layout size={16} /> Canvas (Edit & Arrange)
          </button>
          <button
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
              centerTab === "preview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setCenterTab("preview")}
          >
            <Eye size={16} /> Preview (Embedded)
          </button>
          <button
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
              centerTab === "website"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={async () => {
              setCenterTab("website");
              if (!previewUrl) {
                const res = await fetch(
                  `/api/admin/preview?site_id=${encodeURIComponent(siteId)}`,
                  { method: "POST" },
                );
                const data = await res.json();
                if (data.ok) {
                  setPreviewUrl(data.previewUrl);
                } else {
                  alert(data.error || "Failed to generate preview");
                }
              }
            }}
          >
            <Globe size={16} /> Live Website
          </button>
        </div>

        {centerTab === "canvas" ? (
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
        ) : centerTab === "preview" ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-sm text-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Eye size={16} /> Embedded Preview
              </div>
              <div className="text-xs opacity-70">
                Exact render as in builder (may differ slightly from real site)
              </div>
            </div>
            <div
              className="p-4"
              style={(snapshotLike.theme?.tokens || {}) as any}
            >
              <RenderPageBuilder
                layout={layout}
                ctx={{
                  tenantId: "t_demo",
                  storeId: "s_demo",
                  snapshot: snapshotLike,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden h-[calc(100vh-140px)]">
            <div className="bg-gray-100 p-3 text-sm text-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Globe size={16} /> Full Website Preview
              </div>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                disabled={!previewUrl}
              >
                Open in new tab →
              </button>
            </div>

            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Generating preview...
              </div>
            )}
          </div>
        )}

        {selectedSection && centerTab === "canvas" && (
          <div className="mt-6 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                Selected Section: {selectedSection.label || selectedSection.id}
              </div>
              <button
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                onClick={saveSectionAsTemplate}
              >
                <Save size={16} /> Save as Template
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Click blocks to edit, drag to rearrange or move between sections.
            </p>
          </div>
        )}
      </main>

      <aside className="border-l border-gray-200 p-4 overflow-auto bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-800">
            {selectedBlock ? "Block Settings" : "Section Settings"}
          </div>
          <div className="flex gap-2">
            {["desktop", "tablet", "mobile"].map((bp) => (
              <button
                key={bp}
                className={`px-3 py-1 text-sm rounded-md ${
                  rightBp === bp
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
                onClick={() => setRightBp(bp as any)}
                title={`${bp.charAt(0).toUpperCase() + bp.slice(1)} view`}
              >
                {bp.charAt(0).toUpperCase() + bp.slice(1)}
              </button>
            ))}
          </div>
        </div>

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

        <div className="mt-6 text-xs text-gray-500 border-t pt-3">
          <Settings size={14} className="inline mr-1" />
          Tip: All changes are made to your draft. Use "Save Changes" on the
          left when you're ready.
        </div>
      </aside>

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
  );
}
function defaultProps(type: string) {
  if (type === "Header/V1")
    return { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" };
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
    };
  if (type === "Hero")
    return {
      heroPreset: "Basic",
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
    };
  if (type === "Hero")
    return {
      heroPreset: "Basic",
      variant: "basic", // basic | image | video
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
        type: "none", // none | image | video
        color: "#0f172a",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        imageAssetId: "",
        imageUrl: "",
        imageAlt: "",
        videoAssetId: "",
        videoUrl: "",
        posterAssetId: "",
        posterUrl: "",
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
  return {};
}

function defaultStyle(type: string) {
  if (type === "Footer/V1") {
    return {
      presetId: undefined,
      overrides: {
        bg: { type: "solid", color: "#0f172a" },
        textColor: "#94a3b8",
      },
      responsive: {},
    };
  }
  return { presetId: undefined, overrides: {}, responsive: {} };
}
