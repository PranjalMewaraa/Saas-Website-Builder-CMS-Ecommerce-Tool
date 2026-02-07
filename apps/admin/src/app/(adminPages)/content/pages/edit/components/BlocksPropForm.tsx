"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useUI } from "@/app/_components/ui/UiProvider";
import ImageField from "../../../_component/ImageField";
import ColorPickerInput from "../../../_component/ColorPickerInput";

const DEFAULT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
export function BlockPropsForm({
  type,
  props,
  setProp,
  setProps,
  setStyleOverrides,
  setPropPath,
  propPath,
  siteId,
  assetsMap,
  forms,
  assetUrlValue,
  menus = [],
}: any) {
  console.log(type);
  const [variant, setVariant] = useState(props.variant || "basic");
  const [richMode, setRichMode] = useState<"visual" | "html">("visual");
  const assignedHeader = menus.find((m: any) => m.slot === "header");
  const assignedFooter = menus.find((m: any) => m.slot === "footer");

  useEffect(() => {
    if (type === "Header/V1" && !props.menuId && assignedHeader?._id) {
      setProp("menuId", assignedHeader._id);
    }
    if (type === "Footer/V1" && !props.menuId && assignedFooter?._id) {
      setProp("menuId", assignedFooter._id);
    }
  }, [
    type,
    props.menuId,
    assignedHeader?._id,
    assignedFooter?._id,
    setProp,
  ]);

  useEffect(() => {
    if (type === "Hero" || type === "Hero/V1") {
      setVariant(props.variant || "basic");
    }
  }, [type, props.variant]);

  useEffect(() => {
    if (type === "Utility/RichText") {
      setRichMode("visual");
    }
  }, [type]);

  if (type === "Header/V1") {
    return (
      <div className="space-y-3">
        {menus.length ? (
          <label className="block space-y-1.5">
            <div className="text-sm font-medium">Menu</div>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={props.menuId || ""}
              onChange={(e) => setProp("menuId", e.target.value)}
            >
              <option value="">(select a menu)</option>
              {menus.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.name} — {m._id}
                  {m.slot ? ` (slot: ${m.slot})` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Field
            label="menuId"
            value={props.menuId || ""}
            onChange={(v: any) => setProp("menuId", v)}
            placeholder="menu_main"
          />
        )}
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

  if (type === "Layout/Section") {
    return (
      <div className="text-sm text-muted-foreground">
        This block uses the Layout editor. Switch to Visual mode to add rows,
        columns, and atomic blocks.
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
    const panelBg = props.panelBg || { type: "gradient" };
    const footerPresets = [
      {
        id: "midnight",
        label: "Midnight",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "rgba(255,255,255,0.06)",
              to: "rgba(255,255,255,0.0)",
              angle: 140,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.08)",
          panelBorderWidth: 1,
          panelRadius: 28,
          panelTextColor: "#94a3b8",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0f172a" },
          textColor: "#94a3b8",
        },
      },
      {
        id: "soft-light",
        label: "Soft Light",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "solid",
            color: "rgba(15,23,42,0.04)",
          },
          panelBorderColor: "rgba(15,23,42,0.08)",
          panelBorderWidth: 1,
          panelRadius: 22,
          panelTextColor: "#0f172a",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#0f172a",
        },
      },
      {
        id: "glass",
        label: "Glass",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "rgba(255,255,255,0.18)",
              to: "rgba(255,255,255,0.05)",
              angle: 160,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.35)",
          panelBorderWidth: 1,
          panelRadius: 30,
          panelTextColor: "#0f172a",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#111827" },
          textColor: "#e2e8f0",
        },
      },
      {
        id: "sunset",
        label: "Sunset",
        props: {
          layout: "simple",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#f97316",
              to: "#ec4899",
              angle: 120,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.15)",
          panelBorderWidth: 0,
          panelRadius: 26,
          panelTextColor: "#ffffff",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0b0b12" },
          textColor: "#f8fafc",
        },
      },
      {
        id: "royal",
        label: "Royal",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#111827",
              to: "#4c1d95",
              angle: 135,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.08)",
          panelBorderWidth: 1,
          panelRadius: 24,
          panelTextColor: "#e2e8f0",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0b1020" },
          textColor: "#e2e8f0",
        },
      },
      {
        id: "sand",
        label: "Sand",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "solid",
            color: "#f7f2ea",
          },
          panelBorderColor: "rgba(120, 88, 62, 0.16)",
          panelBorderWidth: 1,
          panelRadius: 20,
          panelTextColor: "#3b2f2a",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#f3ede2" },
          textColor: "#3b2f2a",
        },
      },
      {
        id: "ocean",
        label: "Ocean",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#0ea5e9",
              to: "#0f172a",
              angle: 145,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.18)",
          panelBorderWidth: 1,
          panelRadius: 26,
          panelTextColor: "#e2f4ff",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#061629" },
          textColor: "#e2f4ff",
        },
      },
      {
        id: "forest",
        label: "Forest",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#064e3b",
              to: "#022c22",
              angle: 160,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.12)",
          panelBorderWidth: 1,
          panelRadius: 24,
          panelTextColor: "#d1fae5",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#041f18" },
          textColor: "#d1fae5",
        },
      },
      {
        id: "mono",
        label: "Mono",
        props: {
          layout: "simple",
          panelBg: {
            type: "solid",
            color: "#111111",
          },
          panelBorderColor: "rgba(255,255,255,0.1)",
          panelBorderWidth: 1,
          panelRadius: 18,
          panelTextColor: "#f5f5f5",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0a0a0a" },
          textColor: "#f5f5f5",
        },
      },
      {
        id: "blush",
        label: "Blush",
        props: {
          layout: "simple",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#fff1f2",
              to: "#fecdd3",
              angle: 135,
            },
          },
          panelBorderColor: "rgba(190, 24, 93, 0.12)",
          panelBorderWidth: 1,
          panelRadius: 22,
          panelTextColor: "#9f1239",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#fff7f9" },
          textColor: "#9f1239",
        },
      },
      {
        id: "slate",
        label: "Slate",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "rgba(15,23,42,0.85)",
              to: "rgba(30,41,59,0.95)",
              angle: 135,
            },
          },
          panelBorderColor: "rgba(148,163,184,0.25)",
          panelBorderWidth: 1,
          panelRadius: 26,
          panelTextColor: "#cbd5f5",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0f172a" },
          textColor: "#cbd5f5",
        },
      },
    ];
    return (
      <div className="space-y-3">
        {menus.length ? (
          <label className="block space-y-1.5">
            <div className="text-sm font-medium">Menu</div>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={props.menuId || ""}
              onChange={(e) => setProp("menuId", e.target.value)}
            >
              <option value="">(select a menu)</option>
              {menus.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.name} — {m._id}
                  {m.slot ? ` (slot: ${m.slot})` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Field
            label="menuId"
            value={props.menuId || ""}
            onChange={(v: any) => setProp("menuId", v)}
            placeholder="menu_footer"
          />
        )}
        <Select
          label="Layout"
          value={props.layout || "multi-column"}
          onChange={(v: any) => setProp("layout", v)}
          options={["multi-column", "simple"]}
        />
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Description"
          value={props.description || ""}
          onChange={(v: any) => setProp("description", v)}
          placeholder="Building better digital experiences since 2023."
        />
        <Field
          label="Badge"
          value={props.badgeText || ""}
          onChange={(v: any) => setProp("badgeText", v)}
          placeholder="Designed for modern storefronts"
        />
        <Select
          label="Badge Style"
          value={props.badgeStyle || "pill"}
          onChange={(v: any) => setProp("badgeStyle", v)}
          options={["pill", "outline", "soft", "glass", "text", "tag"]}
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.showSocials ?? true}
            onChange={(e) => setProp("showSocials", e.target.checked)}
          />
          Show social icons
        </label>
        <Select
          label="Social Style"
          value={props.socialStyle || "pill"}
          onChange={(v: any) => setProp("socialStyle", v)}
          options={[
            "pill",
            "outline",
            "soft",
            "glass",
            "square",
            "minimal",
            "label",
          ]}
        />
        <div className="space-y-2 border rounded-lg p-3">
          <div className="text-sm font-medium">Presets</div>
          {[
            {
              title: "Dark",
              items: footerPresets.filter((p) =>
                ["midnight", "royal", "slate", "mono", "ocean", "forest"].includes(
                  p.id
                ),
              ),
            },
            {
              title: "Light",
              items: footerPresets.filter((p) =>
                ["soft-light", "sand", "blush"].includes(p.id),
              ),
            },
            {
              title: "Colorful",
              items: footerPresets.filter((p) => ["sunset"].includes(p.id)),
            },
          ].map((group) =>
            group.items.length ? (
              <div key={group.title} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {group.title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="text-xs border rounded-lg p-2 text-left hover:bg-gray-50"
                      onClick={() => {
                        const merged = { ...(props || {}), ...preset.props };
                        if (setProps) {
                          setProps(merged);
                        } else {
                          Object.entries(preset.props).forEach(([k, v]) => {
                            setProp(k, v);
                          });
                        }
                        if (preset.styleOverrides && setStyleOverrides) {
                          setStyleOverrides(preset.styleOverrides);
                        }
                      }}
                    >
                      <div
                        className="h-14 rounded-md border border-black/10"
                        style={{
                          background:
                            preset.props.panelBg?.type === "solid"
                              ? preset.props.panelBg.color
                              : preset.props.panelBg?.type === "gradient"
                                ? `linear-gradient(${preset.props.panelBg.gradient?.angle ?? 135}deg, ${
                                    preset.props.panelBg.gradient?.from
                                  }, ${preset.props.panelBg.gradient?.to})`
                                : "transparent",
                        }}
                      />
                      <div className="mt-2 font-medium">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
        <div className="space-y-2 border rounded-lg p-3">
          <div className="text-sm font-medium">Panel Background</div>
          <Select
            label="Type"
            value={panelBg.type || "gradient"}
            onChange={(v: any) => setPropPath("panelBg.type", v)}
            options={["none", "solid", "gradient"]}
          />
          {panelBg.type === "solid" ? (
            <ColorPickerInput
              label="Color"
              value={panelBg.color || ""}
              onChange={(v: any) => setPropPath("panelBg.color", v)}
              placeholder="#0f172a"
            />
          ) : null}
          {panelBg.type === "gradient" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ColorPickerInput
                  label="From"
                  value={panelBg.gradient?.from || ""}
                  onChange={(v: any) =>
                    setPropPath("panelBg.gradient.from", v)
                  }
                  placeholder="rgba(255,255,255,0.05)"
                />
                <ColorPickerInput
                  label="To"
                  value={panelBg.gradient?.to || ""}
                  onChange={(v: any) => setPropPath("panelBg.gradient.to", v)}
                  placeholder="rgba(255,255,255,0)"
                />
              </div>
              <NumberField
                label="Angle"
                value={panelBg.gradient?.angle ?? 135}
                onChange={(v: any) => setPropPath("panelBg.gradient.angle", v)}
              />
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberField
              label="Radius"
              value={props.panelRadius ?? 24}
              onChange={(v: any) => setProp("panelRadius", v)}
            />
            <NumberField
              label="Border Width"
              value={props.panelBorderWidth ?? 1}
              onChange={(v: any) => setProp("panelBorderWidth", v)}
            />
          </div>
          <ColorPickerInput
            label="Border Color"
            value={props.panelBorderColor || ""}
            onChange={(v: any) => setProp("panelBorderColor", v)}
            placeholder="rgba(255,255,255,0.1)"
          />
          <ColorPickerInput
            label="Panel Text Color"
            value={props.panelTextColor || ""}
            onChange={(v: any) => setProp("panelTextColor", v)}
            placeholder="#94a3b8"
          />
        </div>
        <div className="space-y-1.5">
          <div className="text-sm font-medium">Social URLs</div>
          <SocialLinksEditor
            value={props.socialLinks || []}
            onChange={(next) => setProp("socialLinks", next)}
          />
          <div className="text-xs text-muted-foreground">
            Icons are auto-selected from the URL domain (x.com, github.com,
            linkedin.com).
          </div>
        </div>
      </div>
    );
  }

  if (type === "ProductList/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
          placeholder="All Products"
        />
        <NumberField
          label="limit"
          value={props.limit ?? 12}
          onChange={(v: any) => setProp("limit", Number(v))}
        />
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl", "full"]}
        />
        <Field
          label="detailPathPrefix"
          value={props.detailPathPrefix || "/products"}
          onChange={(v: any) => setProp("detailPathPrefix", v)}
          placeholder="/products"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.showFilters ?? true}
            onChange={(e) => setProp("showFilters", e.target.checked)}
          />
          Show filters
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.showSearch ?? true}
            onChange={(e) => setProp("showSearch", e.target.checked)}
          />
          Show search
        </label>
      </div>
    );
  }

  if (type === "ProductDetail/V1") {
    return (
      <div className="space-y-3">
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl", "full"]}
        />
        <Field
          label="detailPathPrefix"
          value={props.detailPathPrefix || "/products"}
          onChange={(v: any) => setProp("detailPathPrefix", v)}
          placeholder="/products"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.showRelated ?? true}
            onChange={(e) => setProp("showRelated", e.target.checked)}
          />
          Show related products
        </label>
        <NumberField
          label="relatedLimit"
          value={props.relatedLimit ?? 4}
          onChange={(v: any) => setProp("relatedLimit", Number(v))}
        />
      </div>
    );
  }

  if (type === "Hero" || type === "Hero/V1") {
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
              assetUrlValue={assetUrlValue || bg.imageUrl || DEFAULT_IMAGE}
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
        <Field
          label="detailPathPrefix"
          value={props.detailPathPrefix || "/products"}
          onChange={(v: any) => setProp("detailPathPrefix", v)}
          placeholder="/products"
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
        <RichTextEditor
          value={props.html || ""}
          mode={richMode}
          onModeChange={setRichMode}
          onChange={(html) => setProp("html", html)}
        />
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

function SocialLinksEditor({
  value,
  onChange,
}: {
  value?: string[];
  onChange: (next: string[]) => void;
}) {
  const links = Array.isArray(value) ? value : [];
  return (
    <div className="space-y-2">
      {links.map((link, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="https://x.com/yourhandle"
            value={link}
            onChange={(e) => {
              const next = [...links];
              next[idx] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded"
            onClick={() => {
              const next = links.filter((_, i) => i !== idx);
              onChange(next);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-xs border rounded px-2 py-1 hover:bg-muted"
        onClick={() => onChange([...links, ""])}
      >
        Add social URL
      </button>
    </div>
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

function RichTextEditor({
  value,
  mode,
  onModeChange,
  onChange,
}: {
  value: string;
  mode: "visual" | "html";
  onModeChange: (m: "visual" | "html") => void;
  onChange: (html: string) => void;
}) {
  const { prompt } = useUI();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your policy...",
      }),
      Typography,
    ],
    content: value || "<p></p>",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== (value || "")) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [value, editor]);

  function insertPreset(kind: "title" | "subtitle" | "para") {
    if (!editor) return;
    const text =
      kind === "title"
        ? "Your Title"
        : kind === "subtitle"
          ? "Your subtitle goes here"
          : "Your paragraph text goes here.";
    const styles =
      kind === "title"
        ? "font-size:28px;font-weight:700;line-height:1.2;margin:0 0 12px;"
        : kind === "subtitle"
          ? "font-size:18px;font-weight:500;line-height:1.5;margin:0 0 10px;opacity:0.85;"
          : "font-size:14px;font-weight:400;line-height:1.8;margin:0 0 10px;opacity:0.9;";
    editor
      .chain()
      .focus()
      .insertContent(`<div style="${styles}">${text}</div>`)
      .run();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Content</div>
        <div className="inline-flex rounded-lg border bg-white p-1">
          <button
            type="button"
            className={`px-2.5 py-1 text-xs rounded ${
              mode === "visual" ? "bg-black text-white" : "text-gray-700"
            }`}
            onClick={() => onModeChange("visual")}
          >
            Visual
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 text-xs rounded ${
              mode === "html" ? "bg-black text-white" : "text-gray-700"
            }`}
            onClick={() => onModeChange("html")}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              Bold
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              Italic
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              Underline
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => insertPreset("title")}
            >
              Title
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => insertPreset("subtitle")}
            >
              Subtitle
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => insertPreset("para")}
            >
              Paragraph
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              Bullets
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              Numbered
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            >
              Left
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
            >
              Center
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            >
              Right
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={async () => {
                const url = await prompt({
                  title: "Link URL",
                  placeholder: "https://",
                  confirmText: "Apply",
                });
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
            >
              Link
            </button>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1"
              onClick={() => editor?.chain().focus().unsetAllMarks().run()}
            >
              Clear
            </button>
          </div>
          <div className="w-full border rounded p-3 text-sm min-h-[200px] bg-white">
            <EditorContent editor={editor} />
          </div>
          <div className="text-xs text-gray-500">
            Use the toolbar for headings, lists, and links. Switch to HTML for
            advanced edits.
          </div>
        </>
      ) : (
        <label className="block space-y-1">
          <div className="text-sm font-medium">HTML</div>
          <textarea
            className="w-full border rounded p-2 text-sm min-h-[200px] font-mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      )}
    </div>
  );
}

function defaultPropsFor(type: string) {
  if (type === "Header/V1")
    return { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" };
  if (type === "Footer/V1")
    return {
      menuId: "menu_footer",
      layout: "multi-column",
      description: "Building better digital experiences since 2023.",
      badgeText: "Designed for modern storefronts",
      showSocials: true,
      socialLinks: [],
    };
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
    return {
      title: "Featured Products",
      limit: 8,
      detailPathPrefix: "/products",
    };
  if (type === "ProductList/V1")
    return {
      title: "All Products",
      limit: 12,
      showFilters: true,
      showSearch: true,
      detailPathPrefix: "/products",
    };
  if (type === "ProductDetail/V1")
    return {
      showRelated: true,
      relatedLimit: 4,
      detailPathPrefix: "/products",
    };
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
