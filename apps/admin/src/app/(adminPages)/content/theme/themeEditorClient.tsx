"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Plus,
  Save,
  Trash2,
  AlertCircle,
  Palette,
  Settings2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import EditorModeToggle from "../_component/EditorModeToggle";
import { useEditorMode } from "../_component/useEditorMode";
import { useAssetsMap } from "../_component/useAssetsMap";
import ImageField from "../_component/ImageField";
import ColorPickerInput from "../_component/ColorPickerInput";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

export default function ThemeEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode, ["form", "json"]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [jsonText, setJsonText] = useState("");
  const { assetsMap } = useAssetsMap(siteId);
  const [brand, setBrand] = useState({ logoAssetId: "", logoAlt: "" });

  const [basicOpen, setBasicOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [assetValueId, setAssetValueId] = useState("");
  const [assetValueUrl, setAssetValueUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/theme?site_id=${encodeURIComponent(siteId)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to load theme");
        const data = await res.json();
        const t = data.theme?.draft_tokens || {};
        const b = data.theme?.brand || { logoAssetId: "", logoAlt: "" };
        setBrand(b);
        setTokens(t);
        setJsonText(JSON.stringify(t, null, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  const common = useMemo(
    () => ({
      primary: tokens["--color-primary"] || "#2563eb",
      bg: tokens["--color-bg"] || "#ffffff",
      text: tokens["--color-text"] || "#111827",
      dark: tokens["--color-dark"] || "#1f2937",
      light: tokens["--color-light"] || "#f3f4f6",
    }),
    [tokens],
  );

  const themePalette = useMemo(
    () =>
      [
        common.primary,
        common.bg,
        common.text,
        common.dark,
        common.light,
      ].filter(Boolean),
    [common],
  );

  async function save(nextTokens: Record<string, string>, nextBrand: any) {
    setSaveStatus("saving");
    try {
      const res = await fetch(
        `/api/admin/theme?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokens: nextTokens,
            brand: {
              ...nextBrand,
              logoAssetId: assetValueId,
              logoUrl: assetValueUrl,
            },
          }),
        },
      );
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2400);
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
          Syncing Theme Engine
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
              Design System
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">
            Theme Architecture
          </h1>
          <p className="text-gray-400 font-medium">
            Configure tokens for{" "}
            <span className="text-black font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
              {siteId}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EditorModeToggle mode={mode} setMode={setMode} />
          {mode === "form" && (
            <button
              onClick={() => save(tokens, brand)}
              disabled={saveStatus === "saving"}
              className={`
                relative overflow-hidden group flex items-center gap-3 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95
                ${saveStatus === "success" ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800 shadow-xl shadow-black/10"}
                disabled:opacity-50
              `}
            >
              {saveStatus === "saving" ? (
                "Processing..."
              ) : saveStatus === "success" ? (
                "Committed ✓"
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Apply Tokens
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {mode === "form" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Core Palette Card */}
            <div className="bg-white border border-gray-200/60 rounded-[2.5rem] overflow-hidden shadow-sm transition-all hover:shadow-xl hover:shadow-black/5">
              <button
                onClick={() => setBasicOpen(!basicOpen)}
                className="w-full flex items-center justify-between px-8 py-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    Core Color Palette
                  </span>
                </div>
                {basicOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-300" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-300" />
                )}
              </button>

              {basicOpen && (
                <div className="p-8 pt-0 grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                  <ColorPickerInput
                    label="Primary Action"
                    value={common.primary}
                    onChange={(v) => updateToken("--color-primary", v)}
                    palette={themePalette}
                  />
                  <ColorPickerInput
                    label="Canvas Background"
                    value={common.bg}
                    onChange={(v) => updateToken("--color-bg", v)}
                    palette={themePalette}
                  />
                  <ColorPickerInput
                    label="Base Typography"
                    value={common.text}
                    onChange={(v) => updateToken("--color-text", v)}
                    palette={themePalette}
                  />
                  <ColorPickerInput
                    label="Deep Accents"
                    value={common.dark}
                    onChange={(v) => updateToken("--color-dark", v)}
                    palette={themePalette}
                  />
                  <ColorPickerInput
                    label="Soft Surfaces"
                    value={common.light}
                    onChange={(v) => updateToken("--color-light", v)}
                    palette={themePalette}
                  />

                  <div className="md:col-span-2 mt-4 pt-8 border-t border-gray-50 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Identity Branding
                      </h3>
                    </div>
                    <ImageField
                      siteId={siteId}
                      label="Primary Navigation Logo"
                      assetIdValue={brand.logoAssetId || ""}
                      altValue={brand.logoAlt || ""}
                      onChangeAssetId={(v) => {
                        setAssetValueId(v);
                        setBrand({ ...brand, logoAssetId: v });
                      }}
                      onChangeAlt={(v) => setBrand({ ...brand, logoAlt: v })}
                      assetsMap={assetsMap}
                      onChangeAssetUrl={(v) => setAssetValueUrl(v)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Token Workspace */}
            <div className="bg-white border border-gray-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full flex items-center justify-between px-8 py-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Settings2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    System Variables
                  </span>
                </div>
                {advancedOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-300" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-300" />
                )}
              </button>

              {advancedOpen && (
                <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-2">
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    Define low-level CSS custom properties for spacing, radius,
                    and specialized colors.
                  </p>
                  <KeyValueEditor
                    value={tokens}
                    onChange={(next) => {
                      setTokens(next);
                      setJsonText(JSON.stringify(next, null, 2));
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview / Status */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-6 bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Palette className="h-32 w-32 rotate-12" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-8">
                Active Preview
              </h3>
              <div className="space-y-6 relative z-10">
                <div
                  className="p-4 rounded-2xl border border-white/10"
                  style={{ backgroundColor: common.bg }}
                >
                  <div
                    className="h-4 w-24 rounded-full mb-3"
                    style={{ backgroundColor: common.primary }}
                  />
                  <div
                    className="h-2 w-full rounded-full opacity-20 mb-2"
                    style={{ backgroundColor: common.text }}
                  />
                  <div
                    className="h-2 w-2/3 rounded-full opacity-20"
                    style={{ backgroundColor: common.text }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {themePalette.map((c, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border border-white/5 shadow-inner"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                  Generated at {new Date().toLocaleTimeString()} based on active
                  manifest tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* JSON Workspace */
        <div className="bg-gray-950 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
            <div className="flex gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/30" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              theme_manifest.json
            </span>
          </div>

          <textarea
            className="w-full h-[600px] font-mono text-xs p-10 bg-transparent text-blue-400 outline-none resize-none leading-relaxed selection:bg-blue-500/20"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />

          <div className="p-8 bg-black/40 flex justify-between items-center border-t border-white/5">
            <div className="flex items-center gap-3 text-gray-500">
              {saveStatus === "error" && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />{" "}
                  <span className="text-[10px] font-bold text-red-500 uppercase">
                    Parse Failed
                  </span>
                </>
              )}
            </div>
            <button
              onClick={async () => {
                const parsed = safeJsonParse(jsonText);
                if (!parsed.ok) return;
                setTokens(parsed.value);
                await save(parsed.value, brand);
              }}
              className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95"
            >
              Commit Manifest
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function updateToken(key: string, value: string) {
    const next = { ...tokens, [key]: value };
    setTokens(next);
    setJsonText(JSON.stringify(next, null, 2));
  }
}

function KeyValueEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const entries = Object.entries(value).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="group flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100"
        >
          <div className="flex-1 font-mono text-[10px] font-bold text-gray-400 bg-white px-4 py-3 rounded-xl border border-gray-100 uppercase tracking-tighter">
            {key}
          </div>
          <input
            className="flex-1 bg-transparent px-4 py-3 font-mono text-xs font-bold outline-none border-b border-transparent focus:border-blue-500"
            value={val}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
          <button
            onClick={() => {
              const next = { ...value };
              delete next[key];
              onChange(next);
            }}
            className="p-3 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          const key = prompt("New token key (e.g. --radius-lg)");
          if (!key || value[key]) return;
          onChange({ ...value, [key]: "#000000" });
        }}
        className="w-full mt-4 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all"
      >
        <Plus className="h-4 w-4" />
        Inject Custom Token
      </button>
    </div>
  );
}
