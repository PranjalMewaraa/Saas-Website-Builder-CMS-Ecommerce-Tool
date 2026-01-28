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

/* ---------------- helpers ---------------- */

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

const BLOCK_TYPES = Object.keys(BLOCKS);

function colorForType(type: string) {
  if (type.startsWith("Header")) return "bg-blue-50 border-blue-200";
  if (type.startsWith("Hero")) return "bg-purple-50 border-purple-200";
  if (type.startsWith("ProductGrid")) return "bg-green-50 border-green-200";
  if (type.startsWith("Form")) return "bg-amber-50 border-amber-200";
  if (type.startsWith("Footer")) return "bg-slate-50 border-slate-200";
  if (type.startsWith("Utility")) return "bg-zinc-50 border-zinc-200";
  return "bg-gray-50 border-gray-200";
}

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

function BlockCard({
  block,
  index,
  total,
  siteId,
  forms,
  presets,
  assetsMap,
  onChange,
  onMove,
  onDelete,
}: any) {
  const [localJsonMode, setLocalJsonMode] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [propsJson, setPropsJson] = useState(
    JSON.stringify(block.props ?? {}, null, 2),
  );
  const [styleJson, setStyleJson] = useState(
    JSON.stringify(block.style ?? {}, null, 2),
  );

  function setPropPath(path: string, val: any) {
    const next = structuredClone(block);
    next.props = next.props ?? {};
    const parts = path.split(".");
    let cur = next.props;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]] ?? (cur[parts[i]] = {});
    }
    cur[parts[parts.length - 1]] = val;
    onChange(next);
  }

  useEffect(() => {
    setPropsJson(JSON.stringify(block.props ?? {}, null, 2));
    setStyleJson(JSON.stringify(block.style ?? {}, null, 2));
  }, [block]);

  const presetOptions = useMemo(
    () => presets.map((p: any) => ({ id: p._id, name: p.name })),
    [presets],
  );

  function setProp(key: string, val: any) {
    const next = structuredClone(block);
    next.props = { ...(next.props ?? {}), [key]: val };
    onChange(next);
  }

  function setStyle(path: string, val: any) {
    const next = structuredClone(block);
    next.style = next.style ?? { overrides: {} };
    next.style.overrides = next.style.overrides ?? {};
    const parts = path.split(".");
    let cur: any = next.style.overrides;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]] = cur[parts[i]] ?? {};
    }
    cur[parts[parts.length - 1]] = val;
    onChange(next);
  }

  function setPreset(id: string) {
    const next = structuredClone(block);
    next.style = { ...next.style, presetId: id || undefined };
    onChange(next);
  }

  const overrides = block.style?.overrides ?? {};
  let bg = overrides.bg ?? { type: "none" };
  if (
    bg.type === "image" &&
    bg.imageAssetId &&
    assetsMap[bg.imageAssetId]?.url
  ) {
    bg = { ...bg, imageUrl: assetsMap[bg.imageAssetId].url };
  }

  const previewStyle = { ...overrides, bg };

  return (
    <div
      className={`
        border rounded-xl overflow-hidden shadow-sm
        ${colorForType(block.type)}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-white/60 border-b">
        <div className="flex items-center gap-3">
          <button
            title="Drag to reorder"
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div>
            <h3 className="font-medium">{block.type.replace("/V1", "")}</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {block.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            title="Move up"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="p-1.5 rounded hover:bg-black/5 disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            title="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="p-1.5 rounded hover:bg-black/5 disabled:opacity-40"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            title="Delete block"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            title="Edit raw JSON"
            onClick={() => setLocalJsonMode(!localJsonMode)}
            className={`p-1.5 rounded ${localJsonMode ? "bg-black/10" : "hover:bg-black/5"}`}
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
      </div>

      {localJsonMode ? (
        <div className="grid md:grid-cols-2 gap-5 p-5 bg-white/40">
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Block Props
            </div>
            <textarea
              className="w-full h-48 font-mono text-sm p-3 border rounded-lg bg-white/70 resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={propsJson}
              onChange={(e) => setPropsJson(e.target.value)}
            />
            <button
              onClick={() => {
                const res = safeJsonParse(propsJson);
                if (!res.ok) return alert(res.error);
                onChange({ ...block, props: res.value });
              }}
              className="text-sm px-4 py-1.5 border rounded hover:bg-gray-50"
            >
              Apply Props
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Block Style
            </div>
            <textarea
              className="w-full h-48 font-mono text-sm p-3 border rounded-lg bg-white/70 resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={styleJson}
              onChange={(e) => setStyleJson(e.target.value)}
            />
            <button
              onClick={() => {
                const res = safeJsonParse(styleJson);
                if (!res.ok) return alert(res.error);
                onChange({ ...block, style: res.value });
              }}
              className="text-sm px-4 py-1.5 border rounded hover:bg-gray-50"
            >
              Apply Style
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-6 bg-white/30">
          <div className="space-y-4">
            <button
              onClick={() => setPropsOpen(!propsOpen)}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span>Content & Props</span>
              </div>
              {propsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {propsOpen && (
              <div className="pl-1 pt-2 border-t">
                <BlockPropsForm
                  type={block.type}
                  props={block.props ?? {}}
                  setProp={setProp}
                  siteId={siteId}
                  assetsMap={assetsMap}
                  forms={forms}
                  setPropPath={setPropPath}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStyleOpen(!styleOpen)}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <span>Appearance & Style</span>
              </div>
              {styleOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {styleOpen && (
              <div className="pl-1 pt-2 border-t space-y-5">
                <label className="block space-y-1.5">
                  <div className="text-sm font-medium">Style Preset</div>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={block.style?.presetId || ""}
                    onChange={(e) => setPreset(e.target.value)}
                  >
                    <option value="">(No preset)</option>
                    {presetOptions.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <NumberField
                      key={side}
                      label={`Padding ${side.toUpperCase()}`}
                      value={overrides.padding?.[side] ?? 0}
                      onChange={(n: number) => setStyle(`padding.${side}`, n)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Background Color"
                    value={overrides.bg?.color ?? ""}
                    onChange={(v: string) => {
                      setStyle("bg.type", v ? "solid" : "none");
                      setStyle("bg.color", v);
                    }}
                    placeholder="#ffffff or var(--bg)"
                  />
                  <Field
                    label="Text Color"
                    value={overrides.textColor ?? ""}
                    onChange={(v: string) => setStyle("textColor", v)}
                    placeholder="#111111 or var(--text)"
                  />
                </div>

                <Select
                  label="Background Type"
                  value={overrides.bg?.type ?? "none"}
                  onChange={(v: string) => setStyle("bg.type", v)}
                  options={["none", "solid", "gradient", "image"]}
                />

                {overrides.bg?.type === "image" && (
                  <div className="space-y-4 pt-2 border-t">
                    <Field
                      label="Overlay Color"
                      value={overrides.bg?.overlayColor ?? ""}
                      onChange={(v: string) => setStyle("bg.overlayColor", v)}
                      placeholder="rgba(0,0,0,0.4)"
                    />
                    <div className="space-y-1.5">
                      <div className="text-sm font-medium">Overlay Opacity</div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={overrides.bg?.overlayOpacity ?? 0.35}
                        onChange={(e) =>
                          setStyle("bg.overlayOpacity", Number(e.target.value))
                        }
                        className="w-full"
                      />
                      <div className="text-xs text-right text-muted-foreground">
                        {(overrides.bg?.overlayOpacity ?? 0.35).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Border Radius"
                    value={overrides.radius ?? 0}
                    onChange={(n: number) => setStyle("radius", n)}
                  />
                  <Select
                    label="Shadow"
                    value={overrides.shadow ?? "none"}
                    onChange={(v: string) => setStyle("shadow", v)}
                    options={["none", "sm", "md", "lg"]}
                  />
                </div>

                <StylePreviewCard
                  style={previewStyle}
                  title="Live Style Preview"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- BlockPropsForm, Field, NumberField, Select ---------------- */
/* KEEP YOUR EXISTING IMPLEMENTATION BELOW THIS LINE UNCHANGED */

export function BlockPropsForm({
  type,
  props,
  setProp,
  setPropPath,
  propPath,
  siteId,
  assetsMap,
  forms,
}: any) {
  console.log(type);
  if (type === "Header/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="menuId"
          value={props.menuId || ""}
          onChange={(v: any) => setProp("menuId", v)}
          placeholder="menu_main"
        />
        <Field
          label="ctaText"
          value={props.ctaText || ""}
          onChange={(v: any) => setProp("ctaText", v)}
          placeholder="Shop"
        />
        <Field
          label="ctaHref"
          value={props.ctaHref || ""}
          onChange={(v: any) => setProp("ctaHref", v)}
          placeholder="/products"
        />
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Logo</div>
          <div className="flex gap-2">
            <input
              className="border rounded p-2 w-full text-sm"
              value={props.logoAssetId || ""}
              onChange={(e) => setProp("logoAssetId", e.target.value)}
              placeholder="logoAssetId"
            />
          </div>
          <Field
            label="logoAlt"
            value={props.logoAlt || ""}
            onChange={(v: any) => setProp("logoAlt", v)}
            placeholder="Logo alt text"
          />
        </div>
      </div>
    );
  }

  if (type === "Form/V1") {
    return (
      <div className="space-y-3">
        <label className="block space-y-1.5">
          <div className="text-sm font-medium">Form</div>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={props.formId || ""}
            onChange={(e) => setProp("formId", e.target.value)}
          >
            <option value="">(select a form)</option>
            {forms.map((f: any) => (
              <option key={f._id} value={f._id}>
                {f.name} — {f._id}
              </option>
            ))}
          </select>
        </label>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
          placeholder="Contact us"
        />
        <Field
          label="submitText"
          value={props.submitText || ""}
          onChange={(v: any) => setProp("submitText", v)}
          placeholder="Send"
        />
      </div>
    );
  }

  if (type === "Footer/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="menuId"
          value={props.menuId || ""}
          onChange={(v: any) => setProp("menuId", v)}
          placeholder="menu_footer"
        />
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
      </div>
    );
  }

  if (type === "Hero" || type === "Hero/V1") {
    const [variant, setVariant] = useState(props.variant || "basic");
    const bg = props.bg || { type: "none" };

    return (
      <div className="space-y-3">
        <Select
          label="Variant"
          value={variant}
          onChange={(v: any) => {
            setVariant(v);
            setProp("variant", v);
            // keep bg.type aligned with variant
            if (v === "image") setPropPath("bg.type", "image");
            else if (v === "video") setPropPath("bg.type", "video");
            else setPropPath("bg.type", "none");
          }}
          options={["basic", "image", "video"]}
        />

        <Field
          label="headline"
          value={props.headline || ""}
          onChange={(v: any) => setProp("headline", v)}
          placeholder="Headline"
        />
        <Field
          label="subhead"
          value={props.subhead || ""}
          onChange={(v: any) => setProp("subhead", v)}
          placeholder="Subhead"
        />

        <div className="grid grid-cols-2 gap-2">
          <Field
            label="ctaText"
            value={props.ctaText || ""}
            onChange={(v: any) => setProp("ctaText", v)}
            placeholder="Browse"
          />
          <Field
            label="ctaHref"
            value={props.ctaHref || ""}
            onChange={(v: any) => setProp("ctaHref", v)}
            placeholder="/products"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select
            label="Align"
            value={props.align || "left"}
            onChange={(v: any) => setProp("align", v)}
            options={["left", "center", "right"]}
          />
          <Select
            label="Width"
            value={props.contentWidth || "xl"}
            onChange={(v: any) => setProp("contentWidth", v)}
            options={["sm", "md", "lg", "xl"]}
          />
          <NumberField
            label="Min Height"
            value={Number(props.minHeight ?? 520)}
            onChange={(n: any) => setProp("minHeight", n)}
          />
        </div>

        {/* Background controls */}
        {variant === "image" ? (
          <div className="border rounded p-2 space-y-2">
            <div className="text-sm opacity-70">Background Image</div>

            <ImageField
              siteId={siteId}
              label="BG Image"
              assetIdValue={bg.imageAssetId || ""}
              altValue={bg.imageAlt || ""}
              onChangeAssetId={(v: any) => {
                console.log("Id", v);

                setPropPath("bg.imageAssetId", v);
                setPropPath(
                  "bg.imageUrl",
                  `https://d64ppqfrcykxw.cloudfront.net/${v}`,
                );
              }}
              onChangeAlt={(v: any) => setPropPath("bg.imageAlt", v)}
              assetsMap={assetsMap}
            />

            <Field
              label="Overlay Color"
              value={bg.overlayColor || "#000000"}
              onChange={(v: any) => setPropPath("bg.overlayColor", v)}
              placeholder="#000000"
            />

            <label className="space-y-1 block">
              <div className="text-sm opacity-70">Overlay Opacity (0–1)</div>
              <input
                className="w-full"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bg.overlayOpacity ?? 0.45}
                onChange={(e) =>
                  setPropPath("bg.overlayOpacity", Number(e.target.value))
                }
              />
              <div className="text-xs opacity-60">
                {bg.overlayOpacity ?? 0.45}
              </div>
            </label>
          </div>
        ) : null}

        {variant === "video" ? (
          <div className="border rounded p-2 space-y-2">
            <div className="text-sm opacity-70">Background Video</div>

            <ImageField
              siteId={siteId}
              label="Video Asset (mp4/webm)"
              assetIdValue={bg.videoAssetId || ""}
              altValue={""}
              onChangeAssetId={(v: any) => setPropPath("bg.videoAssetId", v)}
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
            />

            <ImageField
              siteId={siteId}
              label="Poster Image"
              assetIdValue={bg.posterAssetId || ""}
              altValue={""}
              onChangeAssetId={(v: any) => setPropPath("bg.posterAssetId", v)}
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
            />

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 border rounded p-2">
                <input
                  type="checkbox"
                  checked={!!bg.videoAutoplay}
                  onChange={(e) =>
                    setPropPath("bg.videoAutoplay", e.target.checked)
                  }
                />
                <span className="text-sm">Autoplay</span>
              </label>

              <label className="flex items-center gap-2 border rounded p-2">
                <input
                  type="checkbox"
                  checked={!!bg.videoMuted}
                  onChange={(e) =>
                    setPropPath("bg.videoMuted", e.target.checked)
                  }
                />
                <span className="text-sm">Muted</span>
              </label>

              <label className="flex items-center gap-2 border rounded p-2">
                <input
                  type="checkbox"
                  checked={!!bg.videoLoop}
                  onChange={(e) =>
                    setPropPath("bg.videoLoop", e.target.checked)
                  }
                />
                <span className="text-sm">Loop</span>
              </label>

              <label className="flex items-center gap-2 border rounded p-2">
                <input
                  type="checkbox"
                  checked={!!bg.videoControls}
                  onChange={(e) =>
                    setPropPath("bg.videoControls", e.target.checked)
                  }
                />
                <span className="text-sm">Controls</span>
              </label>
            </div>

            <Select
              label="Preload"
              value={bg.videoPreload || "metadata"}
              onChange={(v: any) => setPropPath("bg.videoPreload", v)}
              options={["none", "metadata", "auto"]}
            />

            <Field
              label="Overlay Color"
              value={bg.overlayColor || "#000000"}
              onChange={(v: any) => setPropPath("bg.overlayColor", v)}
              placeholder="#000000"
            />

            <label className="space-y-1 block">
              <div className="text-sm opacity-70">Overlay Opacity (0–1)</div>
              <input
                className="w-full"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bg.overlayOpacity ?? 0.45}
                onChange={(e) =>
                  setPropPath("bg.overlayOpacity", Number(e.target.value))
                }
              />
              <div className="text-xs opacity-60">
                {bg.overlayOpacity ?? 0.45}
              </div>
            </label>
          </div>
        ) : null}

        <div className="text-xs opacity-60">
          Tip: For Image/Video variants, only store Asset IDs. Renderer will
          resolve URLs from snapshot assets.
        </div>
      </div>
    );
  }

  if (type === "ProductGrid/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
          placeholder="Featured Products"
        />{" "}
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <NumberField
          label="limit"
          value={Number(props.limit ?? 8)}
          onChange={(n: any) => setProp("limit", n)}
        />
      </div>
    );
  }
  if (type === "Utility/Spacer") {
    return (
      <div className="space-y-3">
        <NumberField
          label="height"
          value={Number(props.height ?? 40)}
          onChange={(n: any) => setProp("height", n)}
        />
      </div>
    );
  }

  if (type === "Utility/Divider") {
    return (
      <div className="space-y-3">
        <NumberField
          label="thickness"
          value={Number(props.thickness ?? 1)}
          onChange={(n: any) => setProp("thickness", n)}
        />
        <Field
          label="color"
          value={props.color || "#e5e7eb"}
          onChange={(v: any) => setProp("color", v)}
        />
        <NumberField
          label="marginY"
          value={Number(props.marginY ?? 20)}
          onChange={(n: any) => setProp("marginY", n)}
        />
      </div>
    );
  }

  if (type === "Utility/RichText") {
    return (
      <div className="space-y-3">
        <label className="block space-y-1">
          <div className="text-sm font-medium">HTML</div>
          <textarea
            className="w-full border rounded p-2 text-sm min-h-[120px]"
            value={props.html || ""}
            onChange={(e) => setProp("html", e.target.value)}
          />
        </label>
      </div>
    );
  }
  if (type === "BannerCTA/V1") {
    return (
      <div className="space-y-3">
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        <Field
          label="buttonText"
          value={props.buttonText || ""}
          onChange={(v: any) => setProp("buttonText", v)}
        />
        <Field
          label="buttonHref"
          value={props.buttonHref || ""}
          onChange={(v: any) => setProp("buttonHref", v)}
        />
        <Select
          label="align"
          value={props.align || "center"}
          onChange={(v: any) => setProp("align", v)}
          options={["left", "center", "right"]}
        />
      </div>
    );
  }
  if (type === "FeaturesGrid/V1") {
    const features = props.features || [];

    function addFeature() {
      setProp("features", [
        ...features,
        { title: "New Feature", description: "" },
      ]);
    }

    function removeFeature(i: number) {
      setProp(
        "features",
        features.filter((_: any, idx: number) => idx !== i),
      );
    }

    return (
      <div className="space-y-3">
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />

        {features.map((f: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Feature #{i + 1}</div>
              <button
                className="text-xs text-red-500"
                onClick={() => removeFeature(i)}
              >
                Remove
              </button>
            </div>

            <Field
              label="title"
              value={f.title || ""}
              onChange={(v: any) => setPropPath(`features.${i}.title`, v)}
            />
            <Field
              label="description"
              value={f.description || ""}
              onChange={(v: any) => setPropPath(`features.${i}.description`, v)}
            />
          </div>
        ))}

        <button
          onClick={addFeature}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Feature
        </button>
      </div>
    );
  }

  if (type === "Testimonials/V1") {
    const testimonials = props.testimonials || [];

    function addTestimonial() {
      setProp("testimonials", [
        ...testimonials,
        { quote: "", name: "", role: "" },
      ]);
    }

    function removeTestimonial(i: number) {
      setProp(
        "testimonials",
        testimonials.filter((_: any, idx: number) => idx !== i),
      );
    }

    return (
      <div className="space-y-3">
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />

        {testimonials.map((t: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Testimonial #{i + 1}</div>
              <button
                className="text-xs text-red-500"
                onClick={() => removeTestimonial(i)}
              >
                Remove
              </button>
            </div>

            <Field
              label="quote"
              value={t.quote || ""}
              onChange={(v: any) => setPropPath(`testimonials.${i}.quote`, v)}
            />
            <Select
              label="Width"
              value={props.contentWidth || "xl"}
              onChange={(v: any) => setProp("contentWidth", v)}
              options={["sm", "md", "lg", "xl", "2xl"]}
            />
            <Field
              label="name"
              value={t.name || ""}
              onChange={(v: any) => setPropPath(`testimonials.${i}.name`, v)}
            />
            <Field
              label="role"
              value={t.role || ""}
              onChange={(v: any) => setPropPath(`testimonials.${i}.role`, v)}
            />
          </div>
        ))}

        <button
          onClick={addTestimonial}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Testimonial
        </button>
      </div>
    );
  }

  if (type === "ProductHighlight/V1") {
    return (
      <div className="space-y-3">
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="description"
          value={props.description || ""}
          onChange={(v: any) => setProp("description", v)}
        />
        <Field
          label="image"
          value={props.image || ""}
          onChange={(v: any) => setProp("image", v)}
        />
        <Field
          label="ctaText"
          value={props.ctaText || ""}
          onChange={(v: any) => setProp("ctaText", v)}
        />
        <Field
          label="ctaHref"
          value={props.ctaHref || ""}
          onChange={(v: any) => setProp("ctaHref", v)}
        />
        <Field
          label="price"
          value={props.price || ""}
          onChange={(v: any) => setProp("price", v)}
        />
      </div>
    );
  }
  if (type === "PricingTable/V1") {
    const plans = props.plans || [];

    function addPlan() {
      setProp("plans", [
        ...plans,
        {
          name: "New Plan",
          feature: "",
          price: "",
          ctaText: "",
          ctaHref: "",
        },
      ]);
    }

    function removePlan(i: number) {
      setProp(
        "plans",
        plans.filter((_: any, idx: number) => idx !== i),
      );
    }

    return (
      <div className="space-y-3">
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />

        {plans.map((p: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Plan #{i + 1}</div>
              <button
                className="text-xs text-red-500"
                onClick={() => removePlan(i)}
              >
                Remove
              </button>
            </div>

            <Field
              label="name"
              value={p.name || ""}
              onChange={(v: any) => setPropPath(`plans.${i}.name`, v)}
            />
            <Field
              label="feature"
              value={p.feature || ""}
              onChange={(v: any) => setPropPath(`plans.${i}.feature`, v)}
            />
            <Field
              label="price"
              value={p.price || ""}
              onChange={(v: any) => setPropPath(`plans.${i}.price`, v)}
            />
            <Field
              label="ctaText"
              value={p.ctaText || ""}
              onChange={(v: any) => setPropPath(`plans.${i}.ctaText`, v)}
            />
            <Field
              label="ctaHref"
              value={p.ctaHref || ""}
              onChange={(v: any) => setPropPath(`plans.${i}.ctaHref`, v)}
            />
          </div>
        ))}

        <button
          onClick={addPlan}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Plan
        </button>
      </div>
    );
  }

  if (type === "StatsCounter/V1") {
    const stats = props.stats || [];

    function addStat() {
      setProp("stats", [...stats, { value: "", label: "" }]);
    }

    function removeStat(i: number) {
      setProp(
        "stats",
        stats.filter((_: any, idx: number) => idx !== i),
      );
    }

    return (
      <div className="space-y-3">
        {stats.map((s: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Stat #{i + 1}</div>
              <button
                className="text-xs text-red-500"
                onClick={() => removeStat(i)}
              >
                Remove
              </button>
            </div>
            <Select
              label="Width"
              value={props.contentWidth || "xl"}
              onChange={(v: any) => setProp("contentWidth", v)}
              options={["sm", "md", "lg", "xl", "2xl"]}
            />

            <Field
              label="value"
              value={s.value || ""}
              onChange={(v: any) => setPropPath(`stats.${i}.value`, v)}
            />
            <Field
              label="label"
              value={s.label || ""}
              onChange={(v: any) => setPropPath(`stats.${i}.label`, v)}
            />
          </div>
        ))}

        <button
          onClick={addStat}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Stat
        </button>
      </div>
    );
  }

  if (type === "LogosCloud/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <div className="text-xs opacity-60">
          Logos are managed via asset picker in renderer
        </div>
      </div>
    );
  }
  if (type === "NewsletterSignup/V1") {
    return (
      <div className="space-y-3">
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />

        <Field
          label="subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      No form available for this block type {type}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <select
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

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
