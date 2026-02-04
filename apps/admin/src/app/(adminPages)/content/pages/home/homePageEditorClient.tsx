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
import AssetPickerModal from "../../_component/AssetPickerModal";
import ImageField from "../../_component/ImageField";
import { useAssetsMap } from "../../_component/useAssetsMap";
import StylePreviewCard from "../../_component/StylePreviewCard";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

const BLOCK_TYPES = [
  "Header/V1",
  "Hero",
  "ProductGrid/V1",
  "Form/V1",
  "Footer/V1",
] as const;

type BlockType = (typeof BLOCK_TYPES)[number];

const BLOCK_COLORS: Record<BlockType, string> = {
  "Header/V1": "bg-blue-50 border-blue-200",
  Hero: "bg-purple-50 border-purple-200",
  "ProductGrid/V1": "bg-green-50 border-green-200",
  "Form/V1": "bg-amber-50 border-amber-200",
  "Footer/V1": "bg-slate-50 border-slate-200",
};

export default function HomePageEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode, ["form", "json"]);
  const { assetsMap } = useAssetsMap(siteId);
  const [forms, setForms] = useState<any[]>([]);
  const [page, setPage] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [layoutJson, setLayoutJson] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle"
  );

  useEffect(() => {
    (async () => {
      const [pagesRes, presetsRes, formsRes] = await Promise.all([
        fetch(`/api/admin/pages?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
        fetch(
          `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
          { cache: "no-store" }
        ),
        fetch(`/api/admin/forms?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
      ]);

      const [pagesData, presetsData, formsData] = await Promise.all([
        pagesRes.json(),
        presetsRes.json(),
        formsRes.json(),
      ]);

      setPresets(presetsData.presets ?? []);
      setForms(formsData.forms ?? []);

      const home = (pagesData.pages ?? []).find((p: any) => p.slug === "/");
      if (home) {
        setPage(home);
        setLayoutJson(JSON.stringify(home.draft_layout ?? {}, null, 2));
      }
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
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
          <p>Loading page draft...</p>
        </div>
      </div>
    );
  }

  const layout = page.draft_layout || {
    version: 1,
    sections: [{ id: "sec_home", blocks: [] }],
  };
  const blocks = layout.sections?.[0]?.blocks ?? [];

  function addBlock() {
    const sel = document.getElementById(
      "blockType"
    ) as HTMLSelectElement | null;
    if (!sel) return;
    const type = sel.value as BlockType;
    if (!type) return;

    const id = `b_${Date.now()}`;
    const defaults = defaultPropsFor(type);

    if (type === "Form/V1" && forms.length > 0) {
      defaults.formId = forms[0]._id;
    }

    const nextLayout = structuredClone(layout);
    nextLayout.sections[0].blocks.push({
      id,
      type,
      props: defaults,
      style: { presetId: undefined, overrides: {} },
    });

    setPage({ ...page, draft_layout: nextLayout });
    setLayoutJson(JSON.stringify(nextLayout, null, 2));
  }

  function updateBlock(idx: number, nextBlock: any) {
    const nextLayout = structuredClone(layout);
    nextLayout.sections[0].blocks[idx] = nextBlock;
    setPage({ ...page, draft_layout: nextLayout });
    setLayoutJson(JSON.stringify(nextLayout, null, 2));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    const nextLayout = structuredClone(layout);
    const arr = nextLayout.sections[0].blocks;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setPage({ ...page, draft_layout: nextLayout });
    setLayoutJson(JSON.stringify(nextLayout, null, 2));
  }

  function deleteBlock(idx: number) {
    const nextLayout = structuredClone(layout);
    nextLayout.sections[0].blocks.splice(idx, 1);
    setPage({ ...page, draft_layout: nextLayout });
    setLayoutJson(JSON.stringify(nextLayout, null, 2));
  }

  function saveDraftFromForm() {
    saveLayout(layout);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Homepage Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Site: <strong>{siteId}</strong> · Location: <strong>/</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EditorModeToggle mode={mode} setMode={setMode} />
          {mode !== "json" && (
            <button
              onClick={saveDraftFromForm}
              disabled={saveStatus === "saving"}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                ${saveStatus === "success" ? "bg-green-600 text-white" : "bg-black text-white hover:bg-black/90"}
                disabled:opacity-60 transition-colors
              `}
            >
              {saveStatus === "saving" ? (
                <>Saving…</>
              ) : saveStatus === "success" ? (
                <>Saved ✓</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Draft
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {mode === "json" ? (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code className="h-5 w-5" />
            <h2 className="font-medium">Raw Layout JSON</h2>
          </div>
          <textarea
            className="w-full h-[min(70vh,600px)] font-mono text-sm p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50/70"
            value={layoutJson}
            onChange={(e) => setLayoutJson(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                const res = safeJsonParse(layoutJson);
                if (!res.ok) return alert(res.error);
                setPage({ ...page, draft_layout: res.value });
              }}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              Apply to Preview
            </button>
            <button
              onClick={() => {
                const res = safeJsonParse(layoutJson);
                if (!res.ok) return alert(res.error);
                saveLayout(res.value);
              }}
              className="px-5 py-2 bg-black text-white rounded-lg text-sm hover:bg-black/90 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3 bg-white p-4 border rounded-xl shadow-sm">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Add new block
              </label>
              <select
                id="blockType"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose block type...
                </option>
                {BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("/V1", "")}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addBlock}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Block
            </button>
            {blocks.length > 0 && (
              <button
                onClick={saveDraftFromForm}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 ml-auto"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            )}
          </div>

          {blocks.length === 0 ? (
            <div className="border border-dashed rounded-xl p-10 text-center text-muted-foreground bg-slate-50/60">
              <Layout className="h-10 w-10 mx-auto mb-4 opacity-60" />
              <h3 className="font-medium text-lg mb-1">No blocks yet</h3>
              <p className="text-sm max-w-md mx-auto mb-6">
                Start building your homepage by adding a Header, Hero, Product
                Grid, Form or Footer.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((b: any, idx: number) => (
                <BlockCard
                  key={b.id}
                  block={b}
                  index={idx}
                  total={blocks.length}
                  siteId={siteId}
                  forms={forms}
                  presets={presets}
                  assetsMap={assetsMap}
                  onChange={(next: any) => updateBlock(idx, next)}
                  onMove={(dir: -1 | 1) => moveBlock(idx, dir)}
                  onDelete={() => deleteBlock(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [propsOpen, setPropsOpen] = useState(false); // ← changed to false (closed by default)
  const [styleOpen, setStyleOpen] = useState(false); // ← changed to false (closed by default)
  const [propsJson, setPropsJson] = useState(
    JSON.stringify(block.props ?? {}, null, 2)
  );
  const [styleJson, setStyleJson] = useState(
    JSON.stringify(block.style ?? {}, null, 2)
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
    [presets]
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
        ${BLOCK_COLORS[block.type as BlockType] || "bg-gray-50 border-gray-200"}
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

function BlockPropsForm({
  type,
  props,
  setProp,
  setPropPath,
  propPath,
  siteId,
  assetsMap,
  forms,
}: any) {
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
      </div>
    );
  }

  if (type === "Hero" || type === "Hero/V1") {
    const variant = props.variant || "basic";
    const bg = props.bg || { type: "none" };

    return (
      <div className="space-y-3">
        <Select
          label="Variant"
          value={variant}
          onChange={(v: any) => {
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
              onChangeAssetId={(v: any) => setPropPath("bg.imageAssetId", v)}
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
        />
        <NumberField
          label="limit"
          value={Number(props.limit ?? 8)}
          onChange={(n: any) => setProp("limit", n)}
        />
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      No form available for this block type
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
  if (type === "Hero")
    return {
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
    };
  if (type === "Hero")
    return {
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
