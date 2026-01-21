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
} from "lucide-react";
import EditorModeToggle from "../_component/EditorModeToggle";
import { useEditorMode } from "../_component/useEditorMode";
import { useAssetsMap } from "../_component/useAssetsMap";
import ImageField from "../_component/ImageField";

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
  const { mode, setMode } = useEditorMode("form", urlMode);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [jsonText, setJsonText] = useState("");
  const { assetsMap } = useAssetsMap(siteId);
  const [brand, setBrand] = useState<{
    logoAssetId?: string;
    logoAlt?: string;
  }>({ logoAssetId: "", logoAlt: "" });

  const [basicOpen, setBasicOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState(
    "Pick an asset using pick button",
  );
  const [assetValueId, setAssetValueId] = useState("");
  const [assetValueUrl, setAssetValueUrl] = useState("");
  function pickIt(v: any) {
    console.log("picked", v);
    setAssetValueId(v);
    setPlaceholder(v);
  }
  function pickItUrl(v: any) {
    console.log("picked", v);
    setAssetValueUrl(v);
  }
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

  async function save(nextTokens: Record<string, string>, nextBrand: any) {
    console.log("Saving theme...", nextTokens, nextBrand, assetValueId);
    let finalBrands = {
      ...nextBrand,
      logoAssetId: assetValueId,
      logoUrl: assetValueUrl,
    };
    setSaveStatus("saving");
    console.log("finalBrands", finalBrands);
    try {
      const res = await fetch(
        `/api/admin/theme?site_id=${encodeURIComponent(siteId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokens: nextTokens,
            brand: finalBrands,
          }),
        },
      );
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2400);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm">Loading theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Theme Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Site: <strong>{siteId}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EditorModeToggle mode={mode} setMode={setMode} />

          {mode === "form" ? (
            <button
              onClick={() => save(tokens, brand)}
              disabled={saveStatus === "saving"}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                ${
                  saveStatus === "success"
                    ? "bg-green-600 text-white"
                    : saveStatus === "error"
                      ? "bg-red-600 text-white"
                      : "bg-black text-white hover:bg-black/90"
                }
                disabled:opacity-60 transition-colors
              `}
            >
              {saveStatus === "saving" ? (
                <>Saving…</>
              ) : saveStatus === "success" ? (
                <>Saved ✓</>
              ) : saveStatus === "error" ? (
                <>Error – Try again</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Draft
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {mode === "form" ? (
        <div className="space-y-6">
          {/* Basic Colors */}
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setBasicOpen(!basicOpen)}
              className="w-full flex items-center justify-between px-5 py-4 bg-muted/40 hover:bg-muted/60 text-left font-medium"
            >
              <span>Basic Colors</span>
              {basicOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {basicOpen && (
              <div className="p-5 pt-1 grid md:grid-cols-2 gap-5 bg-card">
                <ColorField
                  label="Primary"
                  value={common.primary}
                  onChange={(v) => updateToken("--color-primary", v)}
                />
                <ColorField
                  label="Background"
                  value={common.bg}
                  onChange={(v) => updateToken("--color-bg", v)}
                />
                <ColorField
                  label="Text"
                  value={common.text}
                  onChange={(v) => updateToken("--color-text", v)}
                />
                <ColorField
                  label="Dark"
                  value={common.dark}
                  onChange={(v) => updateToken("--color-dark", v)}
                />
                <ColorField
                  label="Light"
                  value={common.light}
                  onChange={(v) => updateToken("--color-light", v)}
                />

                <div className="md:col-span-2 border rounded-xl p-5 space-y-4 bg-muted/20">
                  <div className="font-medium text-lg">Brand Logo</div>
                  <ImageField
                    siteId={siteId}
                    label="Global Brand Logo"
                    assetIdValue={brand.logoAssetId || ""}
                    altValue={brand.logoAlt || ""}
                    onChangeAssetId={(v) => pickIt(v)}
                    onChangeAlt={(v) => setBrand({ ...brand, logoAlt: v })}
                    assetsMap={assetsMap}
                    placeholder={placeholder}
                    assetValueUrl={assetValueUrl}
                    onChangeAssetUrl={(v) => pickItUrl(v)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Tokens */}
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between px-5 py-4 bg-muted/40 hover:bg-muted/60 text-left font-medium"
            >
              <span>Advanced Custom Tokens</span>
              {advancedOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {advancedOpen && (
              <div className="p-5 bg-card space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add or edit custom CSS variables (e.g. --color-accent,
                  --font-size-xl, --spacing-12, ...)
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
      ) : (
        <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code className="h-5 w-5" />
            <h2 className="font-medium">Theme Tokens JSON</h2>
          </div>

          <textarea
            className="w-full h-[min(65vh,500px)] font-mono text-sm p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />

          <button
            onClick={async () => {
              const parsed = safeJsonParse(jsonText);
              if (!parsed.ok) {
                alert(parsed.error);
                return;
              }
              setTokens(parsed.value);
              await save(parsed.value, brand);
            }}
            disabled={saveStatus === "saving"}
            className={`
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-black text-white hover:bg-black/90
              disabled:opacity-60 transition-colors
            `}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          {saveStatus === "success" && (
            <p className="text-sm text-green-600">✓ Theme saved successfully</p>
          )}
          {saveStatus === "error" && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Failed to save. Check console.
            </p>
          )}
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md border shadow-sm flex-shrink-0"
          style={{ backgroundColor: value || "transparent" }}
          title={value || "Not set"}
        />
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#2563eb or var(--color-...)"
        />
      </div>
    </label>
  );
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
    <div className="space-y-3">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm bg-muted/40"
            value={key}
            readOnly
          />
          <input
            className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
            value={val}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
          <button
            onClick={() => {
              const next = { ...value };
              delete next[key];
              onChange(next);
            }}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
            title="Remove token"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        onClick={() => {
          const key = prompt(
            "New token key (e.g. --color-accent, --radius-lg)",
          );
          if (!key || value[key]) return;
          onChange({ ...value, [key]: "#000000" });
        }}
        className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-muted w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Add Custom Token
      </button>
    </div>
  );
}
