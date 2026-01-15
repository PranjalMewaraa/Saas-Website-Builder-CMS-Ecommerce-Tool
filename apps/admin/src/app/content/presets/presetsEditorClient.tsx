"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Trash2,
  Layout,
  Palette,
  Sliders,
  Square,
  Type,
} from "lucide-react";
import EditorModeToggle from "../_component/EditorModeToggle";
import { useEditorMode } from "../_component/useEditorMode";
import { useAssetsMap } from "../_component/useAssetsMap";
import ImageField from "../_component/ImageField";
import StylePreviewCard from "../_component/StylePreviewCard";

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

const emptyStyle = {
  container: "boxed",
  maxWidth: "xl",
  padding: { top: 24, right: 16, bottom: 24, left: 16 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  bg: { type: "none" },
  textColor: "",
  radius: 0,
  shadow: "none",
  border: { enabled: false, color: "", width: 1 },
  align: { text: "left", items: "stretch", justify: "start" },
};

export default function PresetsEditorClient({
  siteId,
  urlMode,
}: {
  siteId: string;
  urlMode?: string;
}) {
  const { mode, setMode } = useEditorMode("form", urlMode);
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [style, setStyle] = useState<any>(emptyStyle);
  const [jsonText, setJsonText] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle"
  );
  const [loading, setLoading] = useState(true);

  const { assetsMap } = useAssetsMap(siteId);

  const [layoutOpen, setLayoutOpen] = useState(true);
  const [spacingOpen, setSpacingOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [effectsOpen, setEffectsOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(
        `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const list = data.presets ?? [];
      setPresets(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
      setLoading(false);
    })();
  }, [siteId]);

  const selected = useMemo(
    () => presets.find((p) => p._id === selectedId),
    [presets, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setName(selected.name || "");
    setTarget(selected.target || "");
    setStyle(selected.style || emptyStyle);
    setJsonText(JSON.stringify(selected.style || emptyStyle, null, 2));
  }, [selected]);

  async function savePreset() {
    setSaveStatus("saving");
    const _id = selectedId || `preset_${Date.now()}`;
    await fetch(
      `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id, name, target, style }),
      }
    );
    setSaveStatus("success");
    setTimeout(() => setSaveStatus("idle"), 2200);

    const res = await fetch(
      `/api/admin/style-presets?site_id=${encodeURIComponent(siteId)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setPresets(data.presets ?? []);
    setSelectedId(_id);
  }

  function createNewPreset() {
    const id = `preset_${Date.now()}`;
    setSelectedId(id);
    setName("New Preset");
    setTarget("");
    setStyle(emptyStyle);
    setJsonText(JSON.stringify(emptyStyle, null, 2));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p>Loading presets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Sidebar - Preset List */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b bg-muted/40">
          <h2 className="font-semibold">Style Presets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reusable styles for blocks
          </p>
        </div>

        <div className="p-3">
          <button
            onClick={createNewPreset}
            className="w-full flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Preset
          </button>
        </div>

        <div className="space-y-1 px-3 pb-3 max-h-[70vh] overflow-y-auto">
          {presets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No presets yet
            </div>
          ) : (
            presets.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelectedId(p._id)}
                className={`
                  w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors
                  ${
                    p._id === selectedId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }
                `}
              >
                <div className="font-medium">{p.name || "Unnamed"}</div>
                <div className="text-xs opacity-70 font-mono truncate">
                  {p._id}
                </div>
                {p.target && (
                  <div className="text-xs opacity-60 mt-0.5">
                    Target: {p.target}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Preset Editor
            </h1>
            <p className="text-sm text-muted-foreground">
              Site: <strong>{siteId}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <EditorModeToggle mode={mode} setMode={setMode} />

            <button
              onClick={savePreset}
              disabled={saveStatus === "saving" || !name.trim()}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                ${
                  saveStatus === "success"
                    ? "bg-green-600 text-white"
                    : "bg-black text-white hover:bg-black/90"
                }
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
                  Save Preset
                </>
              )}
            </button>
          </div>
        </div>

        {!selectedId && presets.length > 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Select a preset from the list to edit
          </div>
        ) : (
          <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
            {/* Header Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Preset Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hero Section Dark"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Target (optional)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Hero/* or Header/V1 or .custom-class"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">
                  Preset ID (read-only)
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm bg-muted"
                  value={selectedId}
                  readOnly
                />
              </div>
            </div>

            {mode === "form" ? (
              <div className="space-y-4 divide-y">
                {/* Layout */}
                <div className="pt-2">
                  <button
                    onClick={() => setLayoutOpen(!layoutOpen)}
                    className="flex items-center justify-between w-full text-left font-medium pb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      <span>Layout & Container</span>
                    </div>
                    {layoutOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {layoutOpen && (
                    <div className="grid md:grid-cols-2 gap-5 pt-2">
                      <Select
                        label="Container Type"
                        value={style.container || "boxed"}
                        onChange={(v: any) =>
                          setStyle({ ...style, container: v })
                        }
                        options={["boxed", "full"]}
                      />
                      <Select
                        label="Max Width"
                        value={style.maxWidth || "xl"}
                        onChange={(v: any) =>
                          setStyle({ ...style, maxWidth: v })
                        }
                        options={["sm", "md", "lg", "xl", "2xl", "full"]}
                      />
                      <Select
                        label="Text Align"
                        value={style.align?.text || "left"}
                        onChange={(v: any) =>
                          setStyle({
                            ...style,
                            align: { ...style.align, text: v },
                          })
                        }
                        options={["left", "center", "right"]}
                      />
                    </div>
                  )}
                </div>

                {/* Spacing */}
                <div className="pt-4">
                  <button
                    onClick={() => setSpacingOpen(!spacingOpen)}
                    className="flex items-center justify-between w-full text-left font-medium pb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      <span>Spacing & Padding</span>
                    </div>
                    {spacingOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {spacingOpen && (
                    <div className="grid md:grid-cols-4 gap-4 pt-2">
                      {(["top", "right", "bottom", "left"] as const).map(
                        (side) => (
                          <NumberField
                            key={side}
                            label={`Padding ${side.charAt(0).toUpperCase()}`}
                            value={style.padding?.[side] ?? 0}
                            onChange={(n: number) =>
                              setStyle({
                                ...style,
                                padding: { ...style.padding, [side]: n },
                              })
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Background */}
                <div className="pt-4">
                  <button
                    onClick={() => setBgOpen(!bgOpen)}
                    className="flex items-center justify-between w-full text-left font-medium pb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span>Background</span>
                    </div>
                    {bgOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {bgOpen && (
                    <div className="space-y-5 pt-2">
                      <Select
                        label="Background Type"
                        value={style.bg?.type || "none"}
                        onChange={(v: any) =>
                          setStyle({ ...style, bg: { ...style.bg, type: v } })
                        }
                        options={["none", "solid", "gradient", "image"]}
                      />

                      {style.bg?.type === "solid" && (
                        <Field
                          label="Background Color"
                          value={style.bg?.color || ""}
                          onChange={(v: string) =>
                            setStyle({
                              ...style,
                              bg: { ...style.bg, color: v },
                            })
                          }
                          placeholder="#ffffff or var(--color-bg)"
                        />
                      )}

                      {style.bg?.type === "gradient" && (
                        <div className="grid md:grid-cols-3 gap-4">
                          <Field
                            label="From"
                            value={style.bg?.gradient?.from || ""}
                            onChange={(v: any) =>
                              setStyle({
                                ...style,
                                bg: {
                                  ...style.bg,
                                  gradient: { ...style.bg.gradient, from: v },
                                },
                              })
                            }
                          />
                          <Field
                            label="To"
                            value={style.bg?.gradient?.to || ""}
                            onChange={(v: any) =>
                              setStyle({
                                ...style,
                                bg: {
                                  ...style.bg,
                                  gradient: { ...style.bg.gradient, to: v },
                                },
                              })
                            }
                          />
                          <Select
                            label="Direction"
                            value={style.bg?.gradient?.direction || "to-r"}
                            onChange={(v: any) =>
                              setStyle({
                                ...style,
                                bg: {
                                  ...style.bg,
                                  gradient: {
                                    ...style.bg.gradient,
                                    direction: v,
                                  },
                                },
                              })
                            }
                            options={["to-r", "to-l", "to-b", "to-t"]}
                          />
                        </div>
                      )}

                      {style.bg?.type === "image" && (
                        <div className="space-y-4">
                          <ImageField
                            siteId={siteId}
                            label="Background Image"
                            assetIdValue={style.bg?.imageAssetId || ""}
                            altValue={style.bg?.imageAlt || ""}
                            onChangeAssetId={(v) =>
                              setStyle({
                                ...style,
                                bg: { ...style.bg, imageAssetId: v },
                              })
                            }
                            onChangeAlt={(v) =>
                              setStyle({
                                ...style,
                                bg: { ...style.bg, imageAlt: v },
                              })
                            }
                            assetsMap={assetsMap}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <Field
                              label="Overlay Color"
                              value={style.bg?.overlayColor || ""}
                              onChange={(v: any) =>
                                setStyle({
                                  ...style,
                                  bg: { ...style.bg, overlayColor: v },
                                })
                              }
                              placeholder="rgba(0,0,0,0.4)"
                            />
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">
                                Overlay Opacity
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={style.bg?.overlayOpacity ?? 0.35}
                                onChange={(e) =>
                                  setStyle({
                                    ...style,
                                    bg: {
                                      ...style.bg,
                                      overlayOpacity: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full"
                              />
                              <div className="text-xs text-right text-muted-foreground">
                                {(style.bg?.overlayOpacity ?? 0.35).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Effects & Border */}
                <div className="pt-4">
                  <button
                    onClick={() => setEffectsOpen(!effectsOpen)}
                    className="flex items-center justify-between w-full text-left font-medium pb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      <span>Border, Radius & Shadow</span>
                    </div>
                    {effectsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {effectsOpen && (
                    <div className="grid md:grid-cols-3 gap-5 pt-2">
                      <NumberField
                        label="Border Radius"
                        value={style.radius ?? 0}
                        onChange={(n: any) => setStyle({ ...style, radius: n })}
                      />

                      <Select
                        label="Shadow"
                        value={style.shadow || "none"}
                        onChange={(v: any) => setStyle({ ...style, shadow: v })}
                        options={["none", "sm", "md", "lg", "xl"]}
                      />

                      <div className="flex items-center gap-3 pt-6">
                        <input
                          type="checkbox"
                          checked={style.border?.enabled || false}
                          onChange={(e) =>
                            setStyle({
                              ...style,
                              border: {
                                ...style.border,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="h-4 w-4"
                        />
                        <label className="text-sm font-medium">
                          Enable Border
                        </label>
                      </div>

                      {style.border?.enabled && (
                        <div className="md:col-span-3 grid md:grid-cols-2 gap-5">
                          <Field
                            label="Border Color"
                            value={style.border?.color || ""}
                            onChange={(v: any) =>
                              setStyle({
                                ...style,
                                border: { ...style.border, color: v },
                              })
                            }
                            placeholder="rgba(0,0,0,0.1)"
                          />
                          <NumberField
                            label="Border Width (px)"
                            value={style.border?.width ?? 1}
                            onChange={(n: any) =>
                              setStyle({
                                ...style,
                                border: { ...style.border, width: n },
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="pt-6 border-t">
                  <StylePreviewCard
                    style={{
                      ...style,
                      bg:
                        style.bg?.type === "image" &&
                        style.bg?.imageAssetId &&
                        assetsMap[style.bg.imageAssetId]?.url
                          ? {
                              ...style.bg,
                              imageUrl: assetsMap[style.bg.imageAssetId].url,
                            }
                          : style.bg,
                    }}
                    title="Live Preview of Current Preset"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Type className="h-5 w-5" />
                  <span>Raw Style JSON</span>
                </div>
                <textarea
                  className="w-full h-96 font-mono text-sm p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  spellCheck={false}
                />
                <button
                  onClick={() => {
                    const parsed = safeJsonParse(jsonText);
                    if (!parsed.ok) {
                      alert(parsed.error);
                      return;
                    }
                    setStyle(parsed.value);
                  }}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-muted"
                >
                  Apply JSON to Form
                </button>
              </div>
            )}
          </div>
        )}
      </div>
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
        className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
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
