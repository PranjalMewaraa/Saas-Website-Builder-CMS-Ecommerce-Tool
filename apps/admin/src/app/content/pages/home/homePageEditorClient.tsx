"use client";

import { useEffect, useMemo, useState } from "react";
import EditorModeToggle from "../../_component/EditorModeToggle";
import { useEditorMode } from "../../_component/useEditorMode";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

const BLOCK_TYPES = [
  "Header/V1",
  "Hero/V1",
  "ProductGrid/V1",
  "Footer/V1",
] as const;

export default function HomePageEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);

  const [page, setPage] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [layoutJson, setLayoutJson] = useState("");

  useEffect(() => {
    (async () => {
      const [pagesRes, presetsRes] = await Promise.all([
        fetch(`/api/admin/pages?site_id=${encodeURIComponent(siteId)}`, {
          cache: "no-store",
        }),
        fetch(
          `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
          { cache: "no-store" }
        ),
      ]);
      const pagesData = await pagesRes.json();
      const presetsData = await presetsRes.json();

      setPresets(presetsData.presets ?? []);

      const home = (pagesData.pages ?? []).find((p: any) => p.slug === "/");
      setPage(home);
      setLayoutJson(JSON.stringify(home?.draft_layout ?? {}, null, 2));
    })();
  }, [siteId]);

  async function saveLayout(nextLayout: any) {
    await fetch(`/api/admin/pages?site_id=${encodeURIComponent(siteId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_id: page._id, draft_layout: nextLayout }),
    });
    alert("Saved page draft ✅");
  }

  if (!page) return <div className="opacity-70">Loading…</div>;

  const layout = page.draft_layout || {
    version: 1,
    sections: [{ id: "sec_home", blocks: [] }],
  };
  const blocks = layout.sections?.[0]?.blocks ?? [];

  return (
    <div className="space-y-3 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">
          Site: <b>{siteId}</b> · Page: <b>/</b>
        </div>
        <EditorModeToggle mode={mode} setMode={setMode} />
      </div>

      {mode === "json" ? (
        <div className="border rounded p-4 space-y-2">
          <textarea
            className="w-full border rounded p-2 font-mono text-sm min-h-[360px]"
            value={layoutJson}
            onChange={(e) => setLayoutJson(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="border rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(layoutJson);
                if (!parsed.ok) return alert(parsed.error);
                const next = { ...page, draft_layout: parsed.value };
                setPage(next);
              }}
            >
              Apply JSON to Form
            </button>
            <button
              className="bg-black text-white rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(layoutJson);
                if (!parsed.ok) return alert(parsed.error);
                saveLayout(parsed.value);
              }}
            >
              Save Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <select id="blockType" className="border rounded p-2">
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              className="border rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => addBlock()}
            >
              + Add Block
            </button>
            <button
              className="bg-black text-white rounded px-3 py-2 text-sm"
              type="button"
              onClick={() => saveDraftFromForm()}
            >
              Save Draft
            </button>
          </div>

          <div className="space-y-3">
            {blocks.map((b: any, idx: number) => (
              <BlockCard
                key={b.id}
                block={b}
                index={idx}
                total={blocks.length}
                presets={presets}
                onChange={(nextBlock) => updateBlock(idx, nextBlock)}
                onMove={(dir) => moveBlock(idx, dir)}
                onDelete={() => deleteBlock(idx)}
              />
            ))}
            {blocks.length === 0 ? (
              <div className="opacity-70 text-sm">
                No blocks yet. Add Header/Hero/ProductGrid/Footer.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  function addBlock() {
    const sel = document.getElementById("blockType") as HTMLSelectElement;
    const type = sel.value as string;
    const id = `b_${Date.now()}`;

    const defaults = defaultPropsFor(type);

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
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
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
}

function defaultPropsFor(type: string) {
  if (type === "Header/V1")
    return { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" };
  if (type === "Footer/V1") return { menuId: "menu_footer" };
  if (type === "Hero/V1")
    return {
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
    };
  if (type === "ProductGrid/V1")
    return { title: "Featured Products", limit: 8 };
  return {};
}

function BlockCard({
  block,
  index,
  total,
  presets,
  onChange,
  onMove,
  onDelete,
}: {
  block: any;
  index: number;
  total: number;
  presets: any[];
  onChange: (b: any) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [localJsonMode, setLocalJsonMode] = useState(false);
  const [propsJson, setPropsJson] = useState(
    JSON.stringify(block.props ?? {}, null, 2)
  );
  const [styleJson, setStyleJson] = useState(
    JSON.stringify(block.style ?? {}, null, 2)
  );

  useEffect(() => {
    setPropsJson(JSON.stringify(block.props ?? {}, null, 2));
    setStyleJson(JSON.stringify(block.style ?? {}, null, 2));
  }, [block.id]);

  const presetOptions = useMemo(
    () => presets.map((p) => ({ id: p._id, name: p.name })),
    [presets]
  );

  function setProp(key: string, val: any) {
    const next = structuredClone(block);
    next.props = { ...(next.props ?? {}), [key]: val };
    onChange(next);
  }

  function setStyle(path: string, val: any) {
    const next = structuredClone(block);
    next.style = next.style ?? {};
    next.style.overrides = next.style.overrides ?? {};
    const parts = path.split(".");
    let cur = next.style.overrides;
    for (let i = 0; i < parts.length - 1; i++)
      cur = cur[parts[i]] ?? (cur[parts[i]] = {});
    cur[parts[parts.length - 1]] = val;
    onChange(next);
  }

  function setPreset(id: string) {
    const next = structuredClone(block);
    next.style = next.style ?? {};
    next.style.presetId = id || undefined;
    onChange(next);
  }

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-medium">{block.type}</div>
          <div className="text-xs opacity-70">{block.id}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 text-sm"
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            ↑
          </button>
          <button
            className="border rounded px-2 py-1 text-sm"
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(+1)}
          >
            ↓
          </button>
          <button
            className="border rounded px-2 py-1 text-sm"
            type="button"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className={`border rounded px-2 py-1 text-sm ${localJsonMode ? "bg-black text-white" : ""}`}
            type="button"
            onClick={() => setLocalJsonMode(!localJsonMode)}
          >
            JSON
          </button>
        </div>
      </div>

      {localJsonMode ? (
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div>
            <div className="text-sm opacity-70">Props JSON</div>
            <textarea
              className="w-full border rounded p-2 font-mono text-sm min-h-[180px]"
              value={propsJson}
              onChange={(e) => setPropsJson(e.target.value)}
            />
            <button
              className="border rounded px-3 py-2 text-sm mt-2"
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(propsJson);
                if (!parsed.ok) return alert(parsed.error);
                onChange({ ...block, props: parsed.value });
              }}
            >
              Apply Props
            </button>
          </div>
          <div>
            <div className="text-sm opacity-70">Style JSON</div>
            <textarea
              className="w-full border rounded p-2 font-mono text-sm min-h-[180px]"
              value={styleJson}
              onChange={(e) => setStyleJson(e.target.value)}
            />
            <button
              className="border rounded px-3 py-2 text-sm mt-2"
              type="button"
              onClick={() => {
                const parsed = safeJsonParse(styleJson);
                if (!parsed.ok) return alert(parsed.error);
                onChange({ ...block, style: parsed.value });
              }}
            >
              Apply Style
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <div className="space-y-3">
            <div className="font-medium text-sm">Props</div>
            <BlockPropsForm
              type={block.type}
              props={block.props ?? {}}
              setProp={setProp}
            />
          </div>

          <div className="space-y-3">
            <div className="font-medium text-sm">Style</div>
            <label className="space-y-1 block">
              <div className="text-sm opacity-70">Preset</div>
              <select
                className="border rounded p-2 w-full"
                value={block.style?.presetId || ""}
                onChange={(e) => setPreset(e.target.value)}
              >
                <option value="">(none)</option>
                {presetOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Minimal style controls (you can add more anytime) */}
            <div className="grid grid-cols-4 gap-2">
              <NumberField
                label="Pad T"
                value={block.style?.overrides?.padding?.top ?? 0}
                onChange={(n: any) => setStyle("padding.top", n)}
              />
              <NumberField
                label="Pad R"
                value={block.style?.overrides?.padding?.right ?? 0}
                onChange={(n: any) => setStyle("padding.right", n)}
              />
              <NumberField
                label="Pad B"
                value={block.style?.overrides?.padding?.bottom ?? 0}
                onChange={(n: any) => setStyle("padding.bottom", n)}
              />
              <NumberField
                label="Pad L"
                value={block.style?.overrides?.padding?.left ?? 0}
                onChange={(n: any) => setStyle("padding.left", n)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field
                label="BG Color"
                value={block.style?.overrides?.bg?.color ?? ""}
                onChange={(v: any) => {
                  setStyle("bg.type", v ? "solid" : "none");
                  setStyle("bg.color", v);
                }}
                placeholder="var(--color-bg) or #fff"
              />
              <Field
                label="Text Color"
                value={block.style?.overrides?.textColor ?? ""}
                onChange={(v: any) => setStyle("textColor", v)}
                placeholder="var(--color-text) or #111"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Radius"
                value={block.style?.overrides?.radius ?? 0}
                onChange={(n: any) => setStyle("radius", n)}
              />
              <Select
                label="Shadow"
                value={block.style?.overrides?.shadow ?? "none"}
                onChange={(v: any) => setStyle("shadow", v)}
                options={["none", "sm", "md", "lg"]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockPropsForm({ type, props, setProp }: any) {
  if (type === "Header/V1") {
    return (
      <div className="space-y-2">
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
      </div>
    );
  }
  if (type === "Footer/V1") {
    return (
      <Field
        label="menuId"
        value={props.menuId || ""}
        onChange={(v: any) => setProp("menuId", v)}
        placeholder="menu_footer"
      />
    );
  }
  if (type === "Hero/V1") {
    return (
      <div className="space-y-2">
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
    );
  }
  if (type === "ProductGrid/V1") {
    return (
      <div className="space-y-2">
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
    <div className="text-sm opacity-70">
      No form available for this block type yet.
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: any) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <input
        className="border rounded p-2 w-full"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="space-y-1 block">
      <div className="text-sm opacity-70">{label}</div>
      <select
        className="border rounded p-2 w-full"
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
