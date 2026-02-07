import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layout,
  ChevronUp,
  ChevronDown,
  Paintbrush,
  Code,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import StylePreviewCard from "../../../_component/StylePreviewCard";
import ColorPickerInput from "../../../_component/ColorPickerInput";
import ImageField from "../../../_component/ImageField";
import { BlockPropsForm } from "./BlocksPropForm";
function colorForType(type: string) {
  if (type.startsWith("Header")) return "bg-blue-50 border-blue-200";
  if (type.startsWith("Hero")) return "bg-purple-50 border-purple-200";
  if (type.startsWith("ProductGrid")) return "bg-green-50 border-green-200";
  if (type.startsWith("Form")) return "bg-amber-50 border-amber-200";
  if (type.startsWith("Footer")) return "bg-slate-50 border-slate-200";
  if (type.startsWith("Utility")) return "bg-zinc-50 border-zinc-200";
  return "bg-gray-50 border-gray-200";
}

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}
const DEFAULT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
export default function BlockCard({
  block,
  index,
  total,
  siteId,
  menus,
  forms,
  presets,
  assetsMap,
  onSaveTemplate,
  onChange,
  onMove,
  onDelete,
  themePalette = [],
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

  function setProps(nextProps: any) {
    const next = structuredClone(block);
    next.props = nextProps ?? {};
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

  function setStyleOverrides(overrides: any) {
    const next = structuredClone(block);
    next.style = next.style ?? { overrides: {} };
    next.style.overrides = { ...(next.style.overrides || {}), ...overrides };
    onChange(next);
  }

  function replaceStyleOverrides(overrides: any) {
    const next = structuredClone(block);
    next.style = next.style ?? { overrides: {} };
    next.style.overrides = { ...(overrides || {}) };
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
            title="Save as template"
            onClick={() => onSaveTemplate?.(block)}
            className="p-1.5 rounded hover:bg-black/5 text-gray-700"
          >
            <Layout className="h-4 w-4" />
          </button>
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
                    setProps={setProps}
                    setStyleOverrides={setStyleOverrides}
                    replaceStyleOverrides={replaceStyleOverrides}
                    siteId={siteId}
                    assetsMap={assetsMap}
                    forms={forms}
                    menus={menus}
                    setPropPath={setPropPath}
                    assetUrlValue={
                      block.props?.imageUrl ||
                      block.props?.bg?.imageUrl ||
                      DEFAULT_IMAGE
                    }
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

                <details open className="border rounded-lg p-3 bg-white shadow-sm">
                  <summary className="cursor-pointer text-sm font-medium">
                    Size & Spacing
                  </summary>
                  <div className="mt-3 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Container"
                        value={overrides.container ?? "boxed"}
                        onChange={(v: string) => setStyle("container", v)}
                        options={["boxed", "full"]}
                      />
                      <Select
                        label="Max Width"
                        value={overrides.maxWidth ?? "xl"}
                        onChange={(v: string) => setStyle("maxWidth", v)}
                        options={["sm", "md", "lg", "xl", "2xl"]}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(["top", "right", "bottom", "left"] as const).map(
                        (side) => (
                          <NumberField
                            key={side}
                            label={`Padding ${side.toUpperCase()}`}
                            value={overrides.padding?.[side] ?? 0}
                            onChange={(n: number) =>
                              setStyle(`padding.${side}`, n)
                            }
                          />
                        ),
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(["top", "right", "bottom", "left"] as const).map(
                        (side) => (
                          <NumberField
                            key={side}
                            label={`Margin ${side.toUpperCase()}`}
                            value={overrides.margin?.[side] ?? 0}
                            onChange={(n: number) =>
                              setStyle(`margin.${side}`, n)
                            }
                          />
                        ),
                      )}
                    </div>
                  </div>
                </details>

                <details open className="border rounded-lg p-3 bg-white shadow-sm">
                  <summary className="cursor-pointer text-sm font-medium">
                    Background
                  </summary>
                  <div className="mt-3 space-y-3">
                    <Select
                      label="Type"
                      value={overrides.bg?.type ?? "none"}
                      onChange={(v: string) => setStyle("bg.type", v)}
                      options={["none", "solid", "gradient", "image"]}
                    />

                    {overrides.bg?.type === "solid" && (
                      <ColorPickerInput
                        label="Color"
                        value={overrides.bg?.color ?? ""}
                        onChange={(v: string) => setStyle("bg.color", v)}
                        placeholder="#ffffff or var(--bg)"
                        palette={themePalette}
                      />
                    )}

                    {overrides.bg?.type === "gradient" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ColorPickerInput
                          label="From"
                          value={overrides.bg?.gradient?.from ?? ""}
                          onChange={(v: string) =>
                            setStyle("bg.gradient.from", v)
                          }
                          placeholder="#0f172a"
                          palette={themePalette}
                        />
                        <ColorPickerInput
                          label="To"
                          value={overrides.bg?.gradient?.to ?? ""}
                          onChange={(v: string) =>
                            setStyle("bg.gradient.to", v)
                          }
                          placeholder="#38bdf8"
                          palette={themePalette}
                        />
                        <Select
                          label="Direction"
                          value={overrides.bg?.gradient?.direction ?? "to-r"}
                          onChange={(v: string) =>
                            setStyle("bg.gradient.direction", v)
                          }
                          options={["to-r", "to-l", "to-b", "to-t"]}
                        />
                      </div>
                    )}

                    {overrides.bg?.type === "image" && (
                      <div className="space-y-3">
                        <ImageField
                          siteId={siteId}
                          label="Background Image"
                          assetIdValue={overrides.bg?.imageAssetId || ""}
                          altValue=""
                          assetsMap={assetsMap}
                          onChangeAssetId={(v: any) =>
                            setStyle("bg.imageAssetId", v)
                          }
                          onChangeAssetUrl={(v: any) =>
                            setStyle("bg.imageUrl", v)
                          }
                          onChangeAlt={() => {}}
                        />
                        <ColorPickerInput
                          label="Overlay Color"
                          value={overrides.bg?.overlayColor ?? ""}
                          onChange={(v: string) =>
                            setStyle("bg.overlayColor", v)
                          }
                          placeholder="rgba(0,0,0,0.4)"
                          palette={themePalette}
                        />
                        <div className="space-y-1.5">
                          <div className="text-sm font-medium">
                            Overlay Opacity
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={overrides.bg?.overlayOpacity ?? 0.35}
                            onChange={(e) =>
                              setStyle(
                                "bg.overlayOpacity",
                                Number(e.target.value),
                              )
                            }
                            className="w-full"
                          />
                          <div className="text-xs text-right text-muted-foreground">
                            {(overrides.bg?.overlayOpacity ?? 0.35).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>

                <details open className="border rounded-lg p-3 bg-white shadow-sm">
                  <summary className="cursor-pointer text-sm font-medium">
                    Color & Border
                  </summary>
                  <div className="mt-3 space-y-3">
                    <ColorPickerInput
                      label="Text Color"
                      value={overrides.textColor ?? ""}
                      onChange={(v: string) => setStyle("textColor", v)}
                      placeholder="#111111 or var(--text)"
                      palette={themePalette}
                    />
                    <Checkbox
                      label="Enable Border"
                      value={!!overrides.border?.enabled}
                      onChange={(v: boolean) => setStyle("border.enabled", v)}
                    />
                    <div className="grid grid-cols-1 gap-3">
                      <ColorPickerInput
                        label="Border Color"
                        value={overrides.border?.color ?? ""}
                        onChange={(v: string) => setStyle("border.color", v)}
                        placeholder="#e5e7eb"
                        palette={themePalette}
                      />
                      <NumberField
                        label="Border Width"
                        value={overrides.border?.width ?? 1}
                        onChange={(n: number) => setStyle("border.width", n)}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
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
                  </div>
                </details>

                <details open className="border rounded-lg p-3 bg-white shadow-sm">
                  <summary className="cursor-pointer text-sm font-medium">
                    Layout & Alignment
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        label="Display"
                        value={overrides.display ?? "block"}
                        onChange={(v: string) => setStyle("display", v)}
                        options={["block", "flex", "grid"]}
                      />
                      <Select
                        label="Text Align"
                        value={overrides.align?.text ?? "left"}
                        onChange={(v: string) => setStyle("align.text", v)}
                        options={["left", "center", "right"]}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        label="Align Items"
                        value={overrides.align?.items ?? "stretch"}
                        onChange={(v: string) => setStyle("align.items", v)}
                        options={["start", "center", "end", "stretch"]}
                      />
                      <Select
                        label="Justify Content"
                        value={overrides.align?.justify ?? "start"}
                        onChange={(v: string) =>
                          setStyle("align.justify", v)
                        }
                        options={["start", "center", "end", "between"]}
                      />
                    </div>
                    <NumberField
                      label="Gap"
                      value={overrides.gap ?? 0}
                      onChange={(n: number) => setStyle("gap", n)}
                    />
                  </div>
                </details>

                <details open className="border rounded-lg p-3 bg-white shadow-sm">
                  <summary className="cursor-pointer text-sm font-medium">
                    Typography
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <NumberField
                        label="Font Size"
                        value={overrides.fontSize ?? 16}
                        onChange={(n: number) => setStyle("fontSize", n)}
                      />
                      <NumberField
                        label="Font Weight"
                        value={overrides.fontWeight ?? 400}
                        onChange={(n: number) => setStyle("fontWeight", n)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <NumberField
                        label="Line Height"
                        value={overrides.lineHeight ?? 24}
                        onChange={(n: number) => setStyle("lineHeight", n)}
                      />
                      <NumberField
                        label="Letter Spacing"
                        value={overrides.letterSpacing ?? 0}
                        onChange={(n: number) => setStyle("letterSpacing", n)}
                      />
                    </div>
                    <Select
                      label="Text Transform"
                      value={overrides.textTransform ?? "none"}
                      onChange={(v: string) =>
                        setStyle("textTransform", v)
                      }
                      options={["none", "uppercase", "lowercase", "capitalize"]}
                    />
                  </div>
                </details>

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

function Checkbox({ label, value, onChange }: any) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function defaultPropsFor(type: string) {
  if (type === "Header/V1")
    return {
      menuId: "menu_main",
      layout: "three-col",
      ctaText: "Shop",
      ctaHref: "/products",
      ctaSecondaryText: "Learn more",
      ctaSecondaryHref: "/about",
      contentWidth: "xl",
    };
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
