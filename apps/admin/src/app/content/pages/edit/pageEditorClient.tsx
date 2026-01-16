"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Plus,
  Save,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Code,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"; // npm install lucide-react if needed

import EditorModeToggle from "../../_component/EditorModeToggle";
import { useEditorMode } from "../../_component/useEditorMode";
import { useAssetsMap } from "../../_component/useAssetsMap";
import ImageField from "../../_component/ImageField";

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

export default function PageEditorClient({
  siteId,
  pageId,
}: {
  siteId: string;
  pageId: string;
}) {
  const { mode, setMode } = useEditorMode("form", undefined);
  const { assetsMap } = useAssetsMap(siteId);

  const [page, setPage] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [layoutJson, setLayoutJson] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle"
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!pageId) return;

    startTransition(async () => {
      const [pageRes, formsRes] = await Promise.all([
        fetch(
          `/api/admin/pages?site_id=${encodeURIComponent(siteId)}&page_id=${encodeURIComponent(pageId)}`,
          { cache: "no-store" }
        ),
        fetch(`/api/admin/forms?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
      ]);

      const pageData = await pageRes.json();
      const formsData = await formsRes.json();

      if (pageData.page) {
        setPage(pageData.page);
        setLayoutJson(
          JSON.stringify(pageData.page.draft_layout ?? {}, null, 2)
        );
      }
      setForms(formsData.forms ?? []);
    });
  }, [siteId, pageId]);

  async function savePageDraft(nextLayout: any) {
    setSaveStatus("saving");
    const res = await fetch(
      `/api/admin/pages?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_id: pageId, draft_layout: nextLayout }),
      }
    );
    const data = await res.json();

    if (!data.ok) {
      alert(data.error || "Save failed");
      setSaveStatus("idle");
      return;
    }

    setPage({ ...page, draft_layout: nextLayout });
    setLayoutJson(JSON.stringify(nextLayout, null, 2));
    setSaveStatus("success");
    setTimeout(() => setSaveStatus("idle"), 2200);
  }

  if (!page) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading page draft...</p>
        </div>
      </div>
    );
  }

  const layout = page.draft_layout || {
    version: 1,
    sections: [{ id: "sec_main", label: "Main", blocks: [] }],
  };
  const blocks = layout.sections?.[0]?.blocks ?? [];

  function addBlock(type: string) {
    const id = `b_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
    const defaults = defaultPropsFor(type);

    if (type === "Form/V1" && forms.length > 0) {
      defaults.formId = forms[0]._id;
    }

    const next = structuredClone(layout);
    next.sections[0].blocks.push({
      id,
      type,
      props: defaults,
      style: { overrides: {}, responsive: {} },
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
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setPage({ ...page, draft_layout: next });
    setLayoutJson(JSON.stringify(next, null, 2));
  }

  function deleteBlock(idx: number) {
    const next = structuredClone(layout);
    next.sections[0].blocks.splice(idx, 1);
    setPage({ ...page, draft_layout: next });
    setLayoutJson(JSON.stringify(next, null, 2));
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {page.name || page.slug || "Untitled Page"}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {page.slug} · Site: {siteId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EditorModeToggle mode={mode} setMode={setMode} />

          <button
            onClick={() => savePageDraft(layout)}
            disabled={saveStatus === "saving" || isPending}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              ${
                saveStatus === "success"
                  ? "bg-green-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
              disabled:opacity-60 transition-colors shadow-sm
            `}
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saveStatus === "success" ? (
              <>Saved ✓</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Draft
              </>
            )}
          </button>
        </div>
      </div>

      {mode === "json" ? (
        <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code className="h-5 w-5" />
            <h2 className="font-medium">Raw Layout JSON</h2>
          </div>
          <textarea
            className="w-full h-[60vh] min-h-[400px] font-mono text-sm p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
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
              className="px-5 py-2 border rounded-lg text-sm hover:bg-muted"
            >
              Apply to Preview
            </button>
            <button
              onClick={() => {
                const res = safeJsonParse(layoutJson);
                if (!res.ok) return alert(res.error);
                savePageDraft(res.value);
              }}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Add Block Bar */}
          <div className="flex flex-wrap items-end gap-3 bg-card p-4 border rounded-xl shadow-sm">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Add new block
              </label>
              <select
                id="blockType"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
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
              onClick={() => {
                const sel = document.getElementById(
                  "blockType"
                ) as HTMLSelectElement;
                if (sel.value) addBlock(sel.value);
              }}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm shadow-sm disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add Block
            </button>
          </div>

          {blocks.length === 0 ? (
            <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/30">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 opacity-60" />
              </div>
              <h3 className="font-medium text-lg mb-2">No blocks yet</h3>
              <p className="text-sm max-w-md mx-auto">
                Start building your page by adding a Header, Hero, Product Grid,
                Form, or Footer.
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
                  assetsMap={assetsMap}
                  forms={forms}
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
  assetsMap,
  forms,
  onChange,
  onMove,
  onDelete,
}: any) {
  const [propsOpen, setPropsOpen] = useState(false);

  function setProp(key: string, val: any) {
    const next = structuredClone(block);
    next.props = { ...(next.props ?? {}), [key]: val };
    onChange(next);
  }

  function setPath(path: string, val: any) {
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

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-card transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
        <div className="flex items-center gap-3">
          <button
            title="Drag to reorder (coming soon)"
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
            className="p-1.5 rounded hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            title="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            title="Delete block"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5 bg-background/60">
        <button
          onClick={() => setPropsOpen(!propsOpen)}
          className="flex items-center justify-between w-full text-left font-medium py-2"
        >
          <div className="flex items-center gap-2">
            <span>Block Properties</span>
          </div>
          {propsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {propsOpen && (
          <div className="pt-4 border-t">
            <BlockPropsEditor
              siteId={siteId}
              assetsMap={assetsMap}
              forms={forms}
              block={block}
              onChange={onChange}
              setProp={setProp}
              setPath={setPath}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function BlockPropsEditor({
  siteId,
  assetsMap,
  forms,
  block,
  onChange,
  setProp,
  setPath,
}: any) {
  const props = block.props ?? {};

  if (block.type === "Form/V1") {
    return (
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <div className="text-sm font-medium">Form</div>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={props.formId || ""}
            onChange={(e) => setProp("formId", e.target.value)}
          >
            <option value="">(select a form)</option>
            {forms.map((f: any) => (
              <option key={f._id} value={f._id}>
                {f.name || "Untitled"} — {f._id}
              </option>
            ))}
          </select>
        </label>

        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Submit Text"
          value={props.submitText || ""}
          onChange={(v: any) => setProp("submitText", v)}
        />
      </div>
    );
  }

  if (block.type === "Hero" || block.type === "Hero/V1") {
    const variant = props.variant || "basic";
    const bg = props.bg || { type: "none" };

    return (
      <div className="space-y-5">
        <Select
          label="Variant"
          value={variant}
          onChange={(v: string) => {
            setProp("variant", v);
            if (v === "image") setPath("bg.type", "image");
            else if (v === "video") setPath("bg.type", "video");
            else setPath("bg.type", "none");
          }}
          options={["basic", "image", "video"]}
        />

        <Field
          label="Headline"
          value={props.headline || ""}
          onChange={(v: any) => setProp("headline", v)}
        />
        <Field
          label="Subhead"
          value={props.subhead || ""}
          onChange={(v: any) => setProp("subhead", v)}
        />

        {variant === "image" && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="text-sm font-medium">Background Image</div>
            <ImageField
              siteId={siteId}
              label="Image"
              assetIdValue={bg.imageAssetId || ""}
              altValue={bg.imageAlt || ""}
              onChangeAssetId={(v) => setPath("bg.imageAssetId", v)}
              onChangeAlt={(v) => setPath("bg.imageAlt", v)}
              assetsMap={assetsMap}
            />
            <Field
              label="Overlay Color"
              value={bg.overlayColor || "#000000"}
              onChange={(v: any) => setPath("bg.overlayColor", v)}
              placeholder="#000000 or rgba(0,0,0,0.5)"
            />
            <NumberField
              label="Overlay Opacity (0–1)"
              value={Number(bg.overlayOpacity ?? 0.45)}
              onChange={(n: any) => setPath("bg.overlayOpacity", n)}
            />
          </div>
        )}

        {variant === "video" && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="text-sm font-medium">Background Video</div>
            <ImageField
              siteId={siteId}
              label="Video Asset (mp4/webm)"
              assetIdValue={bg.videoAssetId || ""}
              altValue=""
              onChangeAssetId={(v) => setPath("bg.videoAssetId", v)}
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
            />
            <ImageField
              siteId={siteId}
              label="Poster Image"
              assetIdValue={bg.posterAssetId || ""}
              altValue=""
              onChangeAssetId={(v) => setPath("bg.posterAssetId", v)}
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
            />
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Tip: Asset IDs are resolved at render time from the site's assets
          snapshot.
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-sm text-muted-foreground italic">
      No dedicated form for <strong>{block.type}</strong>. Edit via JSON mode or
      extend the editor.
    </div>
  );
}

// Reusable field components (same as before, but styled consistently)
function Field({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
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
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
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
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
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
  if (type === "Hero" || type === "Hero/V1")
    return {
      variant: "basic",
      headline: "Welcome Headline",
      subhead: "Compelling subheadline text goes here",
      ctaText: "Get Started",
      ctaHref: "/signup",
      align: "left",
      contentWidth: "xl",
      minHeight: 520,
      bg: { type: "none", overlayColor: "#000000", overlayOpacity: 0.45 },
    };
  if (type === "ProductGrid/V1")
    return { title: "Featured Products", limit: 8 };
  if (type === "Form/V1")
    return { formId: "", title: "Get in Touch", submitText: "Send Message" };
  return {};
}
