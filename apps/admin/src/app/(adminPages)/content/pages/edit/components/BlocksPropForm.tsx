"use client";
import { useEffect, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
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
import { ChevronDown } from "lucide-react";
const DEFAULT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
export function BlockPropsForm({
  type,
  props,
  setProp,
  setProps,
  setStyleOverrides,
  replaceStyleOverrides,
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
  const formOptions = (forms || []).map((f: any) => ({
    value: f._id,
    label: f.name ? `${f.name} — ${f._id}` : f._id,
  }));
  const applyPresetStylePack = (overrides: any) => {
    if (replaceStyleOverrides) {
      replaceStyleOverrides(overrides || {});
      return;
    }
    if (setStyleOverrides) {
      setStyleOverrides(overrides || {});
    }
  };
  const canResetStyle =
    typeof replaceStyleOverrides === "function" ||
    typeof setStyleOverrides === "function";
  const resetStyleOverrides = () => {
    if (replaceStyleOverrides) {
      replaceStyleOverrides({});
      return;
    }
    if (setStyleOverrides) {
      setStyleOverrides({});
    }
  };
  const ResetStyleButton = () =>
    canResetStyle ? (
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs border rounded px-2 py-1 hover:bg-muted"
          onClick={resetStyleOverrides}
        >
          Reset to Block Default Style
        </button>
      </div>
    ) : null;

  useEffect(() => {
    if (type === "Header/V1" && !props.menuId && assignedHeader?._id) {
      setProp("menuId", assignedHeader._id);
    }
    if (type === "Footer/V1" && !props.menuId && assignedFooter?._id) {
      setProp("menuId", assignedFooter._id);
    }
  }, [type, props.menuId, assignedHeader?._id, assignedFooter?._id, setProp]);

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
        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Structure</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              label="Layout"
              value={props.layout || "three-col"}
              onChange={(v: any) => setProp("layout", v)}
              options={[
                "three-col",
                "two-col",
                "two-col-nav-cta",
                "centered-nav",
                "split-nav",
                "logo-cta",
              ]}
            />
            <Select
              label="Width"
              value={props.contentWidth || "xl"}
              onChange={(v: any) => setProp("contentWidth", v)}
              options={["sm", "md", "lg", "xl", "2xl"]}
            />
          </div>
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
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Branding</div>
          <Field
            label="logoAssetId"
            value={props.logoAssetId || ""}
            onChange={(v: any) => setProp("logoAssetId", v)}
            placeholder="logoAssetId"
          />
          <Field
            label="logoAlt"
            value={props.logoAlt || ""}
            onChange={(v: any) => setProp("logoAlt", v)}
            placeholder="Logo alt text"
          />
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Primary Button</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <IconPicker
            label="ctaIcon"
            value={props.ctaIcon || ""}
            onChange={(v: any) => setProp("ctaIcon", v)}
          />
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Secondary Button</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field
              label="ctaSecondaryText"
              value={props.ctaSecondaryText || ""}
              onChange={(v: any) => setProp("ctaSecondaryText", v)}
              placeholder="Learn more"
            />
            <Field
              label="ctaSecondaryHref"
              value={props.ctaSecondaryHref || ""}
              onChange={(v: any) => setProp("ctaSecondaryHref", v)}
              placeholder="/about"
            />
          </div>
          <IconPicker
            label="ctaSecondaryIcon"
            value={props.ctaSecondaryIcon || ""}
            onChange={(v: any) => setProp("ctaSecondaryIcon", v)}
          />
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Tertiary Button</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field
              label="ctaTertiaryText"
              value={props.ctaTertiaryText || ""}
              onChange={(v: any) => setProp("ctaTertiaryText", v)}
              placeholder="Contact"
            />
            <Field
              label="ctaTertiaryHref"
              value={props.ctaTertiaryHref || ""}
              onChange={(v: any) => setProp("ctaTertiaryHref", v)}
              placeholder="/contact"
            />
          </div>
          <IconPicker
            label="ctaTertiaryIcon"
            value={props.ctaTertiaryIcon || ""}
            onChange={(v: any) => setProp("ctaTertiaryIcon", v)}
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
                {f.name} - {f._id}
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
    const footerMenuGroups = Array.isArray(props.menuGroups)
      ? props.menuGroups
      : props.menuId
        ? [
            {
              menuId: props.menuId,
              title: "Links",
              textSize: "sm",
              textStyle: "normal",
            },
          ]
        : [];
    const applyFooterMenuGroups = (nextGroups: any[]) => {
      setProp("menuGroups", nextGroups);
      if ((!props.menuId || !props.menuId.trim()) && nextGroups[0]?.menuId) {
        setProp("menuId", nextGroups[0].menuId);
      }
    };
    const updateFooterMenuGroup = (idx: number, patch: Record<string, any>) => {
      const next = [...footerMenuGroups];
      next[idx] = { ...(next[idx] || {}), ...patch };
      applyFooterMenuGroups(next);
    };
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
      {
        id: "aurora-light",
        label: "Aurora Light",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#f8fafc",
              to: "#e0f2fe",
              angle: 130,
            },
          },
          panelBorderColor: "rgba(14,116,144,0.16)",
          panelBorderWidth: 1,
          panelRadius: 24,
          panelTextColor: "#0f172a",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#0f172a",
        },
      },
      {
        id: "charcoal-pro",
        label: "Charcoal Pro",
        props: {
          layout: "multi-column",
          panelBg: {
            type: "solid",
            color: "#111827",
          },
          panelBorderColor: "rgba(148,163,184,0.22)",
          panelBorderWidth: 1,
          panelRadius: 22,
          panelTextColor: "#e5e7eb",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#020617" },
          textColor: "#e5e7eb",
        },
      },
      {
        id: "minimal-paper",
        label: "Minimal Paper",
        props: {
          layout: "simple",
          panelBg: {
            type: "solid",
            color: "#ffffff",
          },
          panelBorderColor: "rgba(15,23,42,0.08)",
          panelBorderWidth: 1,
          panelRadius: 16,
          panelTextColor: "#334155",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#334155",
        },
      },
      {
        id: "emerald-brand",
        label: "Emerald Brand",
        props: {
          layout: "simple",
          panelBg: {
            type: "gradient",
            gradient: {
              from: "#047857",
              to: "#022c22",
              angle: 145,
            },
          },
          panelBorderColor: "rgba(255,255,255,0.18)",
          panelBorderWidth: 1,
          panelRadius: 20,
          panelTextColor: "#dcfce7",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#022c22" },
          textColor: "#dcfce7",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <div className="border rounded-lg p-3 space-y-3">
          <div className="text-sm font-medium">Structure</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select
              label="Layout"
              value={props.layout || "multi-column"}
              onChange={(v: any) => setProp("layout", v)}
              options={["multi-column", "simple"]}
            />
            <Select
              label="Template"
              value={String(props.footerTemplate || 1)}
              onChange={(v: any) => setProp("footerTemplate", Number(v))}
              options={[
                { label: "Classic", value: "1" },
                { label: "Centered Columns", value: "2" },
                { label: "Split Brand/Links", value: "3" },
                { label: "Compact Row", value: "4" },
              ]}
            />
            <Select
              label="Width"
              value={props.contentWidth || "xl"}
              onChange={(v: any) => setProp("contentWidth", v)}
              options={["sm", "md", "lg", "xl", "2xl"]}
            />
          </div>
        </div>
        <div className="space-y-2 border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Menu Sections</div>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
              onClick={() => {
                const fallbackMenuId =
                  props.menuId || assignedFooter?._id || "";
                const defaultMenuId = fallbackMenuId || menus?.[0]?._id || "";
                applyFooterMenuGroups([
                  ...footerMenuGroups,
                  {
                    menuId: defaultMenuId,
                    title: `Links ${footerMenuGroups.length + 1}`,
                    textSize: "sm",
                    textStyle: "normal",
                  },
                ]);
              }}
            >
              Add Menu Section
            </button>
          </div>
          {footerMenuGroups.length ? (
            <div className="space-y-3">
              {footerMenuGroups.map((group: any, idx: number) => (
                <div
                  key={`footer-menu-group-${idx}`}
                  className="border rounded p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Section {idx + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs border rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                        disabled={idx === 0}
                        onClick={() => {
                          const next = [...footerMenuGroups];
                          [next[idx - 1], next[idx]] = [
                            next[idx],
                            next[idx - 1],
                          ];
                          applyFooterMenuGroups(next);
                        }}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="text-xs border rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                        disabled={idx === footerMenuGroups.length - 1}
                        onClick={() => {
                          const next = [...footerMenuGroups];
                          [next[idx + 1], next[idx]] = [
                            next[idx],
                            next[idx + 1],
                          ];
                          applyFooterMenuGroups(next);
                        }}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="text-xs border rounded px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          applyFooterMenuGroups(
                            footerMenuGroups.filter(
                              (_: any, i: number) => i !== idx,
                            ),
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {menus.length ? (
                    <label className="block space-y-1">
                      <div className="text-xs font-medium">Menu</div>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={group.menuId || ""}
                        onChange={(e) =>
                          updateFooterMenuGroup(idx, { menuId: e.target.value })
                        }
                      >
                        <option value="">(select a menu)</option>
                        {menus.map((m: any) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                            {m.slot ? ` (${m.slot})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Field
                      label="Menu ID"
                      value={group.menuId || ""}
                      onChange={(v: any) =>
                        updateFooterMenuGroup(idx, { menuId: v })
                      }
                      placeholder="menu_footer"
                    />
                  )}
                  <Field
                    label="Section Title"
                    value={group.title || ""}
                    onChange={(v: any) =>
                      updateFooterMenuGroup(idx, { title: v })
                    }
                    placeholder={`Links ${idx + 1}`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select
                      label="Text Size"
                      value={group.textSize || "sm"}
                      onChange={(v: any) =>
                        updateFooterMenuGroup(idx, { textSize: v })
                      }
                      options={["xs", "sm", "base"]}
                    />
                    <Select
                      label="Text Style"
                      value={group.textStyle || "normal"}
                      onChange={(v: any) =>
                        updateFooterMenuGroup(idx, { textStyle: v })
                      }
                      options={["normal", "medium", "semibold"]}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Add one or more menu sections. Each section can use a different
              menu and title.
            </div>
          )}
        </div>
        {menus.length ? (
          <label className="block space-y-1.5">
            <div className="text-sm font-medium">Fallback Menu (legacy)</div>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={props.menuId || ""}
              onChange={(e) => setProp("menuId", e.target.value)}
            >
              <option value="">(select a menu)</option>
              {menus.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.name} - {m._id}
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
                [
                  "midnight",
                  "royal",
                  "slate",
                  "mono",
                  "ocean",
                  "forest",
                  "charcoal-pro",
                ].includes(p.id),
              ),
            },
            {
              title: "Light",
              items: footerPresets.filter((p) =>
                [
                  "soft-light",
                  "sand",
                  "blush",
                  "aurora-light",
                  "minimal-paper",
                ].includes(p.id),
              ),
            },
            {
              title: "Colorful",
              items: footerPresets.filter((p) =>
                ["sunset", "emerald-brand"].includes(p.id),
              ),
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
                  onChange={(v: any) => setPropPath("panelBg.gradient.from", v)}
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

  if (type === "CartPage/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
          placeholder="Your cart"
        />
        <Field
          label="emptyTitle"
          value={props.emptyTitle || ""}
          onChange={(v: any) => setProp("emptyTitle", v)}
          placeholder="Your cart is empty"
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="emptyCtaText"
            value={props.emptyCtaText || ""}
            onChange={(v: any) => setProp("emptyCtaText", v)}
            placeholder="Browse products"
          />
          <Field
            label="emptyCtaHref"
            value={props.emptyCtaHref || ""}
            onChange={(v: any) => setProp("emptyCtaHref", v)}
            placeholder="/products"
          />
        </div>
        <Select
          label="checkoutMode"
          value={props.checkoutMode || "create-order"}
          onChange={(v: any) => setProp("checkoutMode", v)}
          options={["create-order", "link"]}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="checkoutText"
            value={props.checkoutText || ""}
            onChange={(v: any) => setProp("checkoutText", v)}
            placeholder="Checkout"
          />
          <Field
            label="checkoutHref"
            value={props.checkoutHref || ""}
            onChange={(v: any) => setProp("checkoutHref", v)}
            placeholder="/checkout"
          />
        </div>
      </div>
    );
  }

  if (type === "CartSummary/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
          placeholder="Summary"
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="checkoutText"
            value={props.checkoutText || ""}
            onChange={(v: any) => setProp("checkoutText", v)}
            placeholder="Checkout"
          />
          <Field
            label="checkoutHref"
            value={props.checkoutHref || ""}
            onChange={(v: any) => setProp("checkoutHref", v)}
            placeholder="/checkout"
          />
        </div>
      </div>
    );
  }

  if (type === "AddToCart/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="productId"
          value={props.productId || ""}
          onChange={(v: any) => setProp("productId", v)}
          placeholder="product_id"
        />
        <Field
          label="title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
          placeholder="Product title"
        />
        <NumberField
          label="priceCents"
          value={Number(props.priceCents || 0)}
          onChange={(v: any) => setProp("priceCents", Number(v))}
        />
        <Field
          label="image"
          value={props.image || ""}
          onChange={(v: any) => setProp("image", v)}
          placeholder="https://..."
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="buttonText"
            value={props.buttonText || ""}
            onChange={(v: any) => setProp("buttonText", v)}
            placeholder="Add to cart"
          />
          <NumberField
            label="quantity"
            value={Number(props.quantity || 1)}
            onChange={(v: any) => setProp("quantity", Number(v))}
          />
        </div>
      </div>
    );
  }

  if (type === "Hero" || type === "Hero/V1") {
    const bg = props.bg || { type: "none" };
    const heroPreset = props.heroPreset || "Basic";

    const applyHeroPreset = (preset: "Basic" | "Split" | "Centered" | "Promo") => {
      const base = {
        ...props,
        heroPreset: preset,
        splitPanelTitle: "",
        splitHighlights: [],
        splitPanelCtaText: "",
        splitPanelCtaHref: "",
        centeredBadgeText: "",
        centeredTrustLine: "",
        centeredStats: [],
        promoBadgeText: "",
        promoCode: "",
        promoNote: "",
        promoBullets: [],
      } as any;

      if (preset === "Basic") {
        Object.assign(base, {
          variant: "basic",
          headline: "Your next bestseller starts here",
          subhead: "Clear value proposition and strong call to action.",
          ctaText: "Shop Now",
          ctaHref: "/products",
          secondaryCtaText: "Learn More",
          secondaryCtaHref: "/about",
          align: "left",
          minHeight: 560,
          bg: { ...(bg || {}), type: "none", color: "#0f172a" },
        });
      }
      if (preset === "Split") {
        Object.assign(base, {
          variant: "image",
          headline: "Designed for high-conversion product storytelling",
          subhead:
            "Use split composition to explain value on left and highlights on right.",
          ctaText: "Explore Collection",
          ctaHref: "/products",
          secondaryCtaText: "Compare Options",
          secondaryCtaHref: "/products",
          align: "left",
          minHeight: 620,
          splitPanelTitle: "Why it converts",
          splitHighlights: [
            "Feature-focused visual hierarchy",
            "Fast checkout experience",
            "Optimized for paid traffic",
          ],
          splitPanelCtaText: "See Demo",
          splitPanelCtaHref: "/",
          bg: { ...(bg || {}), type: "image", imageUrl: bg.imageUrl || DEFAULT_IMAGE, overlayOpacity: 0.42 },
        });
      }
      if (preset === "Centered") {
        Object.assign(base, {
          variant: "basic",
          headline: "Everything you need to launch and scale",
          subhead: "A centered hero with trust layer and KPI chips.",
          ctaText: "Get Started",
          ctaHref: "/",
          secondaryCtaText: "View Pricing",
          secondaryCtaHref: "/pricing",
          align: "center",
          minHeight: 600,
          centeredBadgeText: "No-code visual builder",
          centeredTrustLine: "Trusted by fast-growing brands",
          centeredStats: [
            { value: "4.9/5", label: "Customer rating" },
            { value: "120K+", label: "Orders processed" },
            { value: "99.9%", label: "Uptime" },
            { value: "24/7", label: "Support" },
          ],
          bg: { ...(bg || {}), type: "none", color: "#111827" },
        });
      }
      if (preset === "Promo") {
        Object.assign(base, {
          variant: "image",
          headline: "Big festive offer on selected products",
          subhead: "Drive urgency with promo code, proof points, and CTA.",
          ctaText: "Buy Now",
          ctaHref: "/products",
          secondaryCtaText: "See Deals",
          secondaryCtaHref: "/offers",
          align: "left",
          minHeight: 620,
          promoBadgeText: "Limited Time Offer",
          promoCode: "SAVE20",
          promoNote: "Valid on eligible products. Limited duration.",
          promoBullets: ["Free shipping over Rs 999", "7-day returns", "COD available"],
          bg: { ...(bg || {}), type: "image", imageUrl: bg.imageUrl || DEFAULT_IMAGE, overlayOpacity: 0.5 },
        });
      }

      setVariant(base.variant || "basic");
      if (setProps) setProps(base);
      else Object.entries(base).forEach(([k, v]) => setProp(k, v));
    };

    return (
      <div className="space-y-3">
        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Structure</div>
          <Select
            label="Hero Preset"
            value={heroPreset}
            onChange={(v: any) => setProp("heroPreset", v)}
            options={["Basic", "Split", "Centered", "Promo", "Advanced"]}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["Basic", "Split", "Centered", "Promo"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`border rounded px-2 py-1 text-xs ${
                  heroPreset === p ? "bg-black text-white" : "hover:bg-muted"
                }`}
                onClick={() => applyHeroPreset(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <Select
            label="Background Mode"
            value={variant}
            onChange={(v: any) => {
              setVariant(v);
              setProp("variant", v);
              if (v === "image") setPropPath("bg.type", "image");
              else if (v === "video") setPropPath("bg.type", "video");
              else setPropPath("bg.type", "none");
            }}
            options={["basic", "image", "video"]}
          />
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Content</div>
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
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Actions</div>
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
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="secondaryCtaText"
              value={props.secondaryCtaText || ""}
              onChange={(v: any) => setProp("secondaryCtaText", v)}
              placeholder="Learn more"
            />
            <Field
              label="secondaryCtaHref"
              value={props.secondaryCtaHref || ""}
              onChange={(v: any) => setProp("secondaryCtaHref", v)}
              placeholder="/about"
            />
          </div>
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Layout</div>
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
        </div>

        {heroPreset === "Split" || heroPreset === "Advanced" ? (
          <div className="border rounded p-2 space-y-2">
            <div className="text-sm font-medium">Split Panel Content</div>
            <Field
              label="Panel Title"
              value={props.splitPanelTitle || ""}
              onChange={(v: any) => setProp("splitPanelTitle", v)}
            />
            {(Array.isArray(props.splitHighlights) ? props.splitHighlights : []).map(
              (item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Field
                    label={`Highlight ${i + 1}`}
                    value={item || ""}
                    onChange={(v: any) => setPropPath(`splitHighlights.${i}`, v)}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-500 border rounded px-2 py-1 mt-6"
                    onClick={() =>
                      setProp(
                        "splitHighlights",
                        (props.splitHighlights || []).filter((_: any, idx: number) => idx !== i),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() =>
                setProp("splitHighlights", [...(props.splitHighlights || []), "New highlight"])
              }
            >
              + Add Highlight
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Panel CTA Text"
                value={props.splitPanelCtaText || ""}
                onChange={(v: any) => setProp("splitPanelCtaText", v)}
              />
              <Field
                label="Panel CTA Link"
                value={props.splitPanelCtaHref || ""}
                onChange={(v: any) => setProp("splitPanelCtaHref", v)}
              />
            </div>
          </div>
        ) : null}

        {heroPreset === "Centered" ? (
          <div className="border rounded p-2 space-y-2">
            <div className="text-sm font-medium">Centered Trust Layer</div>
            <Field
              label="Badge Text"
              value={props.centeredBadgeText || ""}
              onChange={(v: any) => setProp("centeredBadgeText", v)}
            />
            <Field
              label="Trust Line"
              value={props.centeredTrustLine || ""}
              onChange={(v: any) => setProp("centeredTrustLine", v)}
            />
            {(Array.isArray(props.centeredStats) ? props.centeredStats : []).map(
              (s: any, i: number) => (
                <div key={i} className="grid grid-cols-2 gap-2 border rounded p-2">
                  <Field
                    label="Value"
                    value={s?.value || ""}
                    onChange={(v: any) => setPropPath(`centeredStats.${i}.value`, v)}
                  />
                  <Field
                    label="Label"
                    value={s?.label || ""}
                    onChange={(v: any) => setPropPath(`centeredStats.${i}.label`, v)}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-500 border rounded px-2 py-1 col-span-2"
                    onClick={() =>
                      setProp(
                        "centeredStats",
                        (props.centeredStats || []).filter((_: any, idx: number) => idx !== i),
                      )
                    }
                  >
                    Remove Stat
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() =>
                setProp("centeredStats", [...(props.centeredStats || []), { value: "", label: "" }])
              }
            >
              + Add Stat
            </button>
          </div>
        ) : null}

        {heroPreset === "Promo" ? (
          <div className="border rounded p-2 space-y-2">
            <div className="text-sm font-medium">Promo Details</div>
            <Field
              label="Promo Badge"
              value={props.promoBadgeText || ""}
              onChange={(v: any) => setProp("promoBadgeText", v)}
            />
            <Field
              label="Promo Code"
              value={props.promoCode || ""}
              onChange={(v: any) => setProp("promoCode", v)}
            />
            <Field
              label="Promo Note"
              value={props.promoNote || ""}
              onChange={(v: any) => setProp("promoNote", v)}
            />
            {(Array.isArray(props.promoBullets) ? props.promoBullets : []).map(
              (item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Field
                    label={`Bullet ${i + 1}`}
                    value={item || ""}
                    onChange={(v: any) => setPropPath(`promoBullets.${i}`, v)}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-500 border rounded px-2 py-1 mt-6"
                    onClick={() =>
                      setProp(
                        "promoBullets",
                        (props.promoBullets || []).filter((_: any, idx: number) => idx !== i),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() =>
                setProp("promoBullets", [...(props.promoBullets || []), "New promo bullet"])
              }
            >
              + Add Bullet
            </button>
          </div>
        ) : null}

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
                setPropPath("bg.imageAssetId", v);
              }}
              onChangeAssetUrl={(v: any) => setPropPath("bg.imageUrl", v)}
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
              onChangeAssetUrl={(v: any) => setPropPath("bg.videoUrl", v)}
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
              assetUrlValue={bg.videoUrl || ""}
            />

            <ImageField
              siteId={siteId}
              label="Poster Image"
              assetIdValue={bg.posterAssetId || ""}
              altValue={""}
              onChangeAssetId={(v: any) => setPropPath("bg.posterAssetId", v)}
              onChangeAssetUrl={(v: any) => setPropPath("bg.videoPoster", v)}
              onChangeAlt={() => {}}
              assetsMap={assetsMap}
              assetUrlValue={bg.videoPoster || ""}
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

        {variant === "basic" ? (
          <div className="border rounded p-2 space-y-2">
            <div className="text-sm opacity-70">Basic Background</div>
            <ColorPickerInput
              label="Background Color"
              value={bg.color || "#0f172a"}
              onChange={(v: any) => setPropPath("bg.color", v)}
              placeholder="#0f172a"
            />
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

  if (type === "BentoGrid/V1") {
    const items = props.items || [];

    function addItem() {
      setProp("items", [
        ...items,
        {
          title: "New Card",
          description: "",
          badge: "",
          href: "#",
          size: "sm",
        },
      ]);
    }

    function removeItem(i: number) {
      setProp(
        "items",
        items.filter((_: any, idx: number) => idx !== i),
      );
    }

    function applyPreset(preset: string) {
      const next = items.map((it: any, i: number) => {
        let size = "sm";
        if (preset === "feature-first") size = i === 0 ? "lg" : "sm";
        else if (preset === "balanced") size = i % 3 === 0 ? "lg" : "sm";
        return { ...it, size };
      });
      setProp("cardSizePreset", preset);
      setProp("items", next);
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
        <Field
          label="subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />

        <div className="border rounded p-2 space-y-2">
          <div className="text-xs opacity-60">Card Size Presets</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() => applyPreset("balanced")}
            >
              Balanced
            </button>
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() => applyPreset("feature-first")}
            >
              Feature First
            </button>
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() => applyPreset("compact")}
            >
              Compact
            </button>
          </div>
        </div>

        {items.map((it: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Card #{i + 1}</div>
              <button
                className="text-xs text-red-500"
                onClick={() => removeItem(i)}
              >
                Remove
              </button>
            </div>
            <Field
              label="title"
              value={it.title || ""}
              onChange={(v: any) => setPropPath(`items.${i}.title`, v)}
            />
            <Field
              label="description"
              value={it.description || ""}
              onChange={(v: any) => setPropPath(`items.${i}.description`, v)}
            />
            <Field
              label="badge"
              value={it.badge || ""}
              onChange={(v: any) => setPropPath(`items.${i}.badge`, v)}
            />
            <Field
              label="href"
              value={it.href || ""}
              onChange={(v: any) => setPropPath(`items.${i}.href`, v)}
            />
            <Select
              label="size"
              value={it.size || "sm"}
              onChange={(v: any) => setPropPath(`items.${i}.size`, v)}
              options={["sm", "lg"]}
            />
          </div>
        ))}

        <button
          onClick={addItem}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Card
        </button>
      </div>
    );
  }

  if (type === "BeforeAfterSlider/V1") {
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
          label="beforeImage"
          value={props.beforeImage || ""}
          onChange={(v: any) => setProp("beforeImage", v)}
        />
        <Field
          label="afterImage"
          value={props.afterImage || ""}
          onChange={(v: any) => setProp("afterImage", v)}
        />
        <Field
          label="beforeLabel"
          value={props.beforeLabel || ""}
          onChange={(v: any) => setProp("beforeLabel", v)}
        />
        <Field
          label="afterLabel"
          value={props.afterLabel || ""}
          onChange={(v: any) => setProp("afterLabel", v)}
        />
        <NumberField
          label="height"
          value={Number(props.height ?? 420)}
          onChange={(n: any) => setProp("height", n)}
        />
        <Select
          label="Handle Style"
          value={props.handleStyle || "line"}
          onChange={(v: any) => setProp("handleStyle", v)}
          options={[
            { label: "Minimal Line", value: "line" },
            { label: "Circle Knob", value: "circle" },
            { label: "Pill Knob", value: "pill" },
          ]}
        />
      </div>
    );
  }

  if (type === "StickyPromoBar/V1") {
    return (
      <div className="space-y-3">
        <Field
          label="text"
          value={props.text || ""}
          onChange={(v: any) => setProp("text", v)}
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
        <Select
          label="position"
          value={props.position || "top"}
          onChange={(v: any) => setProp("position", v)}
          options={["top", "bottom"]}
        />
        <Select
          label="Theme"
          value={props.theme || "dark"}
          onChange={(v: any) => setProp("theme", v)}
          options={[
            { label: "Dark", value: "dark" },
            { label: "Brand", value: "brand" },
            { label: "Light", value: "light" },
            { label: "Success", value: "success" },
            { label: "Danger", value: "danger" },
          ]}
        />
      </div>
    );
  }

  if (type === "TestimonialCarousel/V1") {
    const testimonials = props.testimonials || [];
    function addTestimonial() {
      setProp("testimonials", [
        ...testimonials,
        { quote: "", name: "", role: "", rating: 5 },
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
        <NumberField
          label="Autoplay (ms)"
          value={Number(props.autoplayMs ?? 5000)}
          onChange={(n: any) => setProp("autoplayMs", n)}
        />
        <Select
          label="Transition"
          value={props.transition || "fade"}
          onChange={(v: any) => setProp("transition", v)}
          options={[
            { label: "Fade", value: "fade" },
            { label: "Slide", value: "slide" },
            { label: "None", value: "none" },
          ]}
        />

        {testimonials.map((t: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Slide #{i + 1}</div>
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
            <NumberField
              label="rating (1-5)"
              value={Number(t.rating ?? 5)}
              onChange={(n: any) =>
                setPropPath(`testimonials.${i}.rating`, Math.max(1, Math.min(5, n)))
              }
            />
          </div>
        ))}
        <button
          onClick={addTestimonial}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Slide
        </button>
      </div>
    );
  }

  if (type === "ComparisonTable/V1") {
    const columns = Array.isArray(props.columns) ? props.columns : [];
    const rows = Array.isArray(props.rows) ? props.rows : [];

    function addColumn() {
      const nextCols = [...columns, `Plan ${columns.length + 1}`];
      setProp("columns", nextCols);
      setProp(
        "rows",
        rows.map((r: any) => ({
          ...r,
          values: [...(Array.isArray(r.values) ? r.values : []), "-"],
        })),
      );
    }
    function removeColumn(i: number) {
      const nextCols = columns.filter((_: any, idx: number) => idx !== i);
      setProp("columns", nextCols);
      setProp(
        "rows",
        rows.map((r: any) => ({
          ...r,
          values: (Array.isArray(r.values) ? r.values : []).filter(
            (_: any, idx: number) => idx !== i,
          ),
        })),
      );
    }
    function addRow() {
      setProp("rows", [
        ...rows,
        {
          feature: `Feature ${rows.length + 1}`,
          values: columns.map(() => "-"),
        },
      ]);
    }
    function removeRow(i: number) {
      setProp(
        "rows",
        rows.filter((_: any, idx: number) => idx !== i),
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
        <Field
          label="subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        <Select
          label="Highlight Column"
          value={String(props.highlightColumn ?? -1)}
          onChange={(v: any) => setProp("highlightColumn", Number(v))}
          options={[
            { label: "None", value: "-1" },
            ...columns.map((c: string, idx: number) => ({
              label: `${idx + 1}. ${c}`,
              value: String(idx),
            })),
          ]}
        />

        <div className="border rounded p-2 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-xs opacity-60">Columns</div>
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={addColumn}
            >
              + Add Column
            </button>
          </div>
          {columns.map((col: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <Field
                label={`Column ${i + 1}`}
                value={col || ""}
                onChange={(v: any) => setPropPath(`columns.${i}`, v)}
              />
              <button
                type="button"
                className="text-xs text-red-500 border rounded px-2 py-1"
                onClick={() => removeColumn(i)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="border rounded p-2 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-xs opacity-60">Rows</div>
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={addRow}
            >
              + Add Row
            </button>
          </div>
          {rows.map((row: any, ri: number) => (
            <div key={ri} className="border rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs opacity-60">Row #{ri + 1}</div>
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() => removeRow(ri)}
                >
                  Remove
                </button>
              </div>
              <Field
                label="Feature"
                value={row.feature || ""}
                onChange={(v: any) => setPropPath(`rows.${ri}.feature`, v)}
              />
              {(Array.isArray(row.values) ? row.values : []).map(
                (val: string, ci: number) => (
                  <Field
                    key={`${ri}-${ci}`}
                    label={columns[ci] || `Value ${ci + 1}`}
                    value={val || ""}
                    onChange={(v: any) => setPropPath(`rows.${ri}.values.${ci}`, v)}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "MarqueeStrip/V1") {
    const items = Array.isArray(props.items) ? props.items : [];
    const presets = [
      {
        id: "trust",
        label: "Trust Signals",
        data: {
          items: [
            "Free Shipping Over Rs 999",
            "Easy 7-Day Returns",
            "100% Secure Checkout",
            "Cash On Delivery Available",
          ],
          speedSec: 30,
          pauseOnHover: true,
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: { type: "solid", color: "#0f172a" },
          textColor: "#f8fafc",
          radius: 0,
        },
      },
      {
        id: "urgency",
        label: "Urgency Strip",
        data: {
          items: [
            "Flash Sale Ends Tonight",
            "Only Limited Stock Left",
            "Extra 10% Off on Prepaid",
          ],
          speedSec: 22,
          pauseOnHover: false,
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: {
            type: "gradient",
            gradient: { from: "#7f1d1d", to: "#ea580c", direction: "to-r" },
          },
          textColor: "#fff7ed",
          radius: 0,
        },
      },
      {
        id: "policy",
        label: "Policy Strip",
        data: {
          items: [
            "Shipping in 24 hours",
            "Warranty Support Included",
            "Trusted by 50,000+ customers",
          ],
          speedSec: 34,
          pauseOnHover: true,
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: { type: "solid", color: "#111827" },
          textColor: "#e5e7eb",
          radius: 0,
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("items", p.data.items);
                  setProp("speedSec", p.data.speedSec);
                  setProp("pauseOnHover", p.data.pauseOnHover);
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-10 rounded bg-slate-900 text-white text-[10px] px-2 flex items-center">
                  {p.data.items[0]}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "2xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <NumberField
          label="Speed (seconds)"
          value={Number(props.speedSec ?? 30)}
          onChange={(n: any) => setProp("speedSec", Math.max(5, Number(n || 5)))}
        />
        <label className="flex items-center gap-2 border rounded p-2">
          <input
            type="checkbox"
            checked={props.pauseOnHover ?? true}
            onChange={(e) => setProp("pauseOnHover", e.target.checked)}
          />
          <span className="text-sm">Pause animation on hover</span>
        </label>
        {items.map((item: string, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Message #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "items",
                    items.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Text"
              value={item || ""}
              onChange={(v: any) => setPropPath(`items.${i}`, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProp("items", [...items, "New trust message"])}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Message
        </button>
      </div>
    );
  }

  if (type === "SpotlightCards/V1") {
    const cards = Array.isArray(props.cards) ? props.cards : [];
    const presets = [
      {
        id: "feature",
        label: "Feature Trio",
        cards: [
          {
            title: "Fast Setup",
            description: "Go live quickly with visual blocks.",
            icon: "Sparkles",
            href: "#",
          },
          {
            title: "Design Flexibility",
            description: "Customize every section deeply.",
            icon: "Palette",
            href: "#",
          },
          {
            title: "Commerce Ready",
            description: "Catalog, cart, and checkout included.",
            icon: "ShoppingCart",
            href: "#",
          },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 48, right: 12, bottom: 48, left: 12 },
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#0f172a",
          radius: 18,
          border: { enabled: false, width: 1, color: "#e2e8f0" },
          shadow: "none",
        },
      },
      {
        id: "trust",
        label: "Trust Cards",
        cards: [
          {
            title: "Secure Payments",
            description: "PCI-compliant checkout and trusted gateways.",
            icon: "Shield",
            href: "#",
          },
          {
            title: "Fast Delivery",
            description: "Quick dispatch and tracked shipping.",
            icon: "Truck",
            href: "#",
          },
          {
            title: "Easy Returns",
            description: "Hassle-free returns and support.",
            icon: "RotateCcw",
            href: "#",
          },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 44, right: 12, bottom: 44, left: 12 },
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#0f172a",
          radius: 18,
          border: { enabled: true, width: 1, color: "#cbd5e1" },
          shadow: "sm",
        },
      },
      {
        id: "service",
        label: "Service Highlights",
        cards: [
          {
            title: "Personal Assistance",
            description: "Talk to our experts before purchase.",
            icon: "MessageCircle",
            href: "/contact",
          },
          {
            title: "Premium Quality",
            description: "Curated products with strict QC.",
            icon: "Award",
            href: "#",
          },
          {
            title: "Flexible Plans",
            description: "Buy now or split payment options.",
            icon: "CreditCard",
            href: "#",
          },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 52, right: 12, bottom: 52, left: 12 },
          bg: {
            type: "gradient",
            gradient: { from: "#f8fafc", to: "#eef2ff", direction: "to-r" },
          },
          textColor: "#111827",
          radius: 18,
          border: { enabled: false, width: 1, color: "#cbd5e1" },
          shadow: "none",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("cards", p.cards);
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded bg-slate-50 border border-slate-200 flex items-center px-2 text-xs">
                  {p.cards[0].title}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        {cards.map((card: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Card #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "cards",
                    cards.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Title"
              value={card.title || ""}
              onChange={(v: any) => setPropPath(`cards.${i}.title`, v)}
            />
            <Field
              label="Description"
              value={card.description || ""}
              onChange={(v: any) => setPropPath(`cards.${i}.description`, v)}
            />
            <IconPicker
              label="Icon"
              value={card.icon || ""}
              onChange={(v: any) => setPropPath(`cards.${i}.icon`, v)}
            />
            <Field
              label="Link (href)"
              value={card.href || ""}
              onChange={(v: any) => setPropPath(`cards.${i}.href`, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setProp("cards", [
              ...cards,
              {
                title: "New Card",
                description: "Short description",
                icon: "Sparkles",
                href: "#",
              },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Card
        </button>
      </div>
    );
  }

  if (type === "ProcessTimeline/V1") {
    const steps = Array.isArray(props.steps) ? props.steps : [];
    const presets = [
      {
        id: "onboarding",
        label: "3-Step Onboarding",
        steps: [
          { title: "Setup Store", description: "Choose store type and theme preset." },
          { title: "Add Catalog", description: "Create categories, products, and variants." },
          { title: "Launch Live", description: "Publish pages and start taking orders." },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 48, right: 12, bottom: 48, left: 12 },
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#0f172a",
          radius: 14,
          border: { enabled: false, width: 1, color: "#dbeafe" },
          shadow: "none",
        },
      },
      {
        id: "funnel",
        label: "Conversion Funnel",
        steps: [
          { title: "Attract", description: "Drive traffic with campaigns and SEO." },
          { title: "Convert", description: "Use social proof, offers, and CTAs." },
          { title: "Retain", description: "Follow up with support and promotions." },
          { title: "Repeat", description: "Build loyalty with repeat-purchase offers." },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 56, right: 12, bottom: 56, left: 12 },
          bg: {
            type: "gradient",
            gradient: { from: "#0f172a", to: "#1e293b", direction: "to-r" },
          },
          textColor: "#e2e8f0",
          radius: 14,
          border: { enabled: false, width: 1, color: "#334155" },
          shadow: "none",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("steps", p.steps);
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded bg-slate-50 border border-slate-200 px-2 py-1 text-[10px]">
                  {p.steps.map((s: any, idx: number) => (
                    <div key={idx}>{idx + 1}. {s.title}</div>
                  ))}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        {steps.map((step: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Step #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "steps",
                    steps.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Title"
              value={step.title || ""}
              onChange={(v: any) => setPropPath(`steps.${i}.title`, v)}
            />
            <Field
              label="Description"
              value={step.description || ""}
              onChange={(v: any) => setPropPath(`steps.${i}.description`, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setProp("steps", [
              ...steps,
              { title: `Step ${steps.length + 1}`, description: "Describe this step" },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Step
        </button>
      </div>
    );
  }

  if (type === "MediaGalleryMasonry/V1") {
    const items = Array.isArray(props.items) ? props.items : [];
    const presets = [
      {
        id: "lookbook",
        label: "Lookbook",
        columns: 3,
        count: 8,
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 52, right: 12, bottom: 52, left: 12 },
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#0f172a",
        },
      },
      {
        id: "portfolio",
        label: "Portfolio",
        columns: 4,
        count: 10,
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 56, right: 12, bottom: 56, left: 12 },
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#0f172a",
        },
      },
      {
        id: "compact",
        label: "Compact",
        columns: 2,
        count: 6,
        styleOverrides: {
          container: "boxed",
          maxWidth: "lg",
          padding: { top: 40, right: 12, bottom: 40, left: 12 },
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#111827",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("columns", p.columns);
                  setProp(
                    "items",
                    Array.from({ length: p.count }).map(() => ({
                      image: DEFAULT_IMAGE,
                      alt: "",
                      caption: "",
                    })),
                  );
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded border bg-slate-50 p-1 grid grid-cols-4 gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded bg-slate-200" />
                  ))}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        <NumberField
          label="Columns (2-6)"
          value={Number(props.columns ?? 3)}
          onChange={(n: any) =>
            setProp("columns", Math.max(2, Math.min(6, Number(n || 3))))
          }
        />
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Media #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "items",
                    items.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <ImageField
              siteId={siteId}
              label="Image"
              assetIdValue={item.imageAssetId || ""}
              altValue={item.alt || ""}
              onChangeAssetId={(v: any) => setPropPath(`items.${i}.imageAssetId`, v)}
              onChangeAssetUrl={(v: any) => setPropPath(`items.${i}.image`, v)}
              onChangeAlt={(v: any) => setPropPath(`items.${i}.alt`, v)}
              assetsMap={assetsMap}
              assetUrlValue={item.image || DEFAULT_IMAGE}
            />
            <Field
              label="Caption"
              value={item.caption || ""}
              onChange={(v: any) => setPropPath(`items.${i}.caption`, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setProp("items", [
              ...items,
              { image: DEFAULT_IMAGE, imageAssetId: "", alt: "", caption: "" },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Media
        </button>
      </div>
    );
  }

  if (type === "VideoHeroLite/V1") {
    const presets = [
      {
        id: "launch",
        label: "Product Launch",
        data: {
          title: "Launch your next bestseller",
          subtitle: "High-impact visuals, clear offer, and fast checkout.",
          ctaText: "Shop Now",
          ctaHref: "/products",
          minHeight: 580,
          overlayOpacity: 0.45,
        },
        styleOverrides: {
          container: "fluid",
          maxWidth: "2xl",
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          bg: { type: "none" },
          textColor: "#f8fafc",
          radius: 0,
        },
      },
      {
        id: "brand",
        label: "Brand Story",
        data: {
          title: "Built for quality and crafted with care",
          subtitle: "Tell your brand story with motion-led visuals.",
          ctaText: "Explore",
          ctaHref: "/",
          minHeight: 620,
          overlayOpacity: 0.35,
        },
        styleOverrides: {
          container: "fluid",
          maxWidth: "2xl",
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          bg: { type: "none" },
          textColor: "#e2e8f0",
          radius: 0,
        },
      },
      {
        id: "minimal",
        label: "Minimal Hero",
        data: {
          title: "Simple, clear, conversion focused",
          subtitle: "A lightweight hero for quick pages.",
          ctaText: "Get Started",
          ctaHref: "/",
          videoUrl: "",
          posterUrl: "",
          minHeight: 520,
          overlayOpacity: 0.5,
        },
        styleOverrides: {
          container: "fluid",
          maxWidth: "2xl",
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          bg: { type: "none" },
          textColor: "#f1f5f9",
          radius: 0,
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  Object.entries(p.data).forEach(([k, v]) => setProp(k, v));
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded bg-slate-900/90 text-white px-2 flex items-center text-xs">
                  {p.data.title}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="CTA Text"
            value={props.ctaText || ""}
            onChange={(v: any) => setProp("ctaText", v)}
          />
          <Field
            label="CTA Link"
            value={props.ctaHref || ""}
            onChange={(v: any) => setProp("ctaHref", v)}
          />
        </div>
        <NumberField
          label="Min Height"
          value={Number(props.minHeight ?? 520)}
          onChange={(n: any) => setProp("minHeight", Math.max(320, Number(n || 320)))}
        />
        <label className="block space-y-1">
          <div className="text-sm font-medium">Overlay Opacity</div>
          <input
            className="w-full"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={props.overlayOpacity ?? 0.45}
            onChange={(e) => setProp("overlayOpacity", Number(e.target.value))}
          />
          <div className="text-xs opacity-60">{props.overlayOpacity ?? 0.45}</div>
        </label>
        <Field
          label="Video URL"
          value={props.videoUrl || ""}
          onChange={(v: any) => setProp("videoUrl", v)}
        />
        <Field
          label="Poster URL"
          value={props.posterUrl || ""}
          onChange={(v: any) => setProp("posterUrl", v)}
        />
      </div>
    );
  }

  if (type === "KPIRibbon/V1") {
    const items = Array.isArray(props.items) ? props.items : [];
    const presets = [
      {
        id: "commerce",
        label: "Commerce KPIs",
        items: [
          { value: "120K+", label: "Orders Processed", icon: "📦" },
          { value: "4.8/5", label: "Customer Rating", icon: "⭐" },
          { value: "99.9%", label: "Uptime", icon: "⚡" },
          { value: "24/7", label: "Support", icon: "💬" },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 20, right: 8, bottom: 20, left: 8 },
          bg: { type: "solid", color: "#0f172a" },
          textColor: "#f8fafc",
          radius: 10,
          border: { enabled: false, width: 1, color: "#1e293b" },
          shadow: "none",
        },
      },
      {
        id: "growth",
        label: "Growth KPIs",
        items: [
          { value: "2.4x", label: "Conversion Uplift", icon: "📈" },
          { value: "38%", label: "Repeat Customers", icon: "🔁" },
          { value: "18M+", label: "Annual Views", icon: "👁️" },
          { value: "95%", label: "Satisfaction", icon: "✅" },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 20, right: 8, bottom: 20, left: 8 },
          bg: {
            type: "gradient",
            gradient: { from: "#111827", to: "#1d4ed8", direction: "to-r" },
          },
          textColor: "#f8fafc",
          radius: 10,
          border: { enabled: false, width: 1, color: "#1e293b" },
          shadow: "none",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("items", p.items);
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded bg-slate-900 text-white px-2 py-1 text-[10px] grid grid-cols-2 gap-1">
                  {p.items.slice(0, 2).map((item: any, i: number) => (
                    <div key={i}>{item.value}</div>
                  ))}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">KPI #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "items",
                    items.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field
                label="Icon"
                value={item.icon || ""}
                onChange={(v: any) => setPropPath(`items.${i}.icon`, v)}
              />
              <Field
                label="Value"
                value={item.value || ""}
                onChange={(v: any) => setPropPath(`items.${i}.value`, v)}
              />
              <Field
                label="Label"
                value={item.label || ""}
                onChange={(v: any) => setPropPath(`items.${i}.label`, v)}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setProp("items", [
              ...items,
              { value: "100+", label: "New KPI", icon: "•" },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add KPI
        </button>
      </div>
    );
  }

  if (type === "InteractiveTabs/V1") {
    const tabs = Array.isArray(props.tabs) ? props.tabs : [];
    const presets = [
      {
        id: "product",
        label: "Product Info Tabs",
        tabs: [
          { label: "Overview", title: "Overview", content: "Highlight top product value." },
          { label: "Specs", title: "Specifications", content: "List important technical details." },
          { label: "Shipping", title: "Shipping & Returns", content: "Delivery and return policy." },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 48, right: 12, bottom: 48, left: 12 },
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#0f172a",
          radius: 14,
          border: { enabled: true, width: 1, color: "#e2e8f0" },
          shadow: "none",
        },
      },
      {
        id: "saas",
        label: "SaaS Feature Tabs",
        tabs: [
          { label: "Features", title: "Features", content: "Core features and capabilities." },
          { label: "Integrations", title: "Integrations", content: "Apps and ecosystem support." },
          { label: "Security", title: "Security", content: "Data and compliance details." },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 48, right: 12, bottom: 48, left: 12 },
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#111827",
          radius: 14,
          border: { enabled: true, width: 1, color: "#cbd5e1" },
          shadow: "none",
        },
      },
      {
        id: "faq",
        label: "FAQ Tabs",
        tabs: [
          { label: "Ordering", title: "Ordering", content: "How to place and track your order." },
          { label: "Payments", title: "Payments", content: "Accepted payment methods." },
          { label: "Support", title: "Support", content: "How to reach support and SLA." },
        ],
        styleOverrides: {
          container: "boxed",
          maxWidth: "lg",
          padding: { top: 40, right: 12, bottom: 40, left: 12 },
          bg: {
            type: "gradient",
            gradient: { from: "#f8fafc", to: "#ecfeff", direction: "to-r" },
          },
          textColor: "#0f172a",
          radius: 14,
          border: { enabled: true, width: 1, color: "#bae6fd" },
          shadow: "none",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("tabs", p.tabs);
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded border bg-slate-50 px-2 py-1 text-[10px]">
                  {p.tabs.map((t: any, i: number) => (
                    <span key={i} className="inline-block mr-1 mb-1 rounded bg-slate-200 px-1.5 py-0.5">
                      {t.label}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        {tabs.map((tab: any, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Tab #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "tabs",
                    tabs.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Tab Label"
              value={tab.label || ""}
              onChange={(v: any) => setPropPath(`tabs.${i}.label`, v)}
            />
            <Field
              label="Panel Title"
              value={tab.title || ""}
              onChange={(v: any) => setPropPath(`tabs.${i}.title`, v)}
            />
            <Field
              label="Panel Content"
              value={tab.content || ""}
              onChange={(v: any) => setPropPath(`tabs.${i}.content`, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setProp("tabs", [
              ...tabs,
              { label: `Tab ${tabs.length + 1}`, title: "Title", content: "Content" },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Tab
        </button>
      </div>
    );
  }

  if (type === "FloatingCTA/V1") {
    const presets = [
      {
        id: "support",
        label: "Support Bubble",
        data: {
          text: "Need help choosing?",
          buttonText: "Talk to us",
          buttonHref: "/contact",
          position: "bottom-right",
        },
        styleOverrides: {
          container: "fluid",
          maxWidth: "2xl",
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          bg: { type: "none" },
          textColor: "#111827",
          radius: 999,
          border: { enabled: false, width: 1, color: "#e2e8f0" },
          shadow: "md",
        },
      },
      {
        id: "coupon",
        label: "Coupon Bubble",
        data: {
          text: "Use SAVE20 on checkout",
          buttonText: "Shop Now",
          buttonHref: "/products",
          position: "bottom-left",
        },
        styleOverrides: {
          container: "fluid",
          maxWidth: "2xl",
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          bg: { type: "none" },
          textColor: "#1f2937",
          radius: 999,
          border: { enabled: true, width: 1, color: "#f59e0b" },
          shadow: "md",
        },
      },
      {
        id: "demo",
        label: "Book Demo",
        data: {
          text: "Want a walkthrough?",
          buttonText: "Book Demo",
          buttonHref: "/demo",
          position: "bottom-right",
        },
        styleOverrides: {
          container: "fluid",
          maxWidth: "2xl",
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          bg: { type: "none" },
          textColor: "#0f172a",
          radius: 999,
          border: { enabled: true, width: 1, color: "#cbd5e1" },
          shadow: "lg",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  Object.entries(p.data).forEach(([k, v]) => setProp(k, v));
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-10 rounded-full border bg-white flex items-center px-2 text-[10px]">
                  {p.data.buttonText}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Field
          label="Text"
          value={props.text || ""}
          onChange={(v: any) => setProp("text", v)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Button Text"
            value={props.buttonText || ""}
            onChange={(v: any) => setProp("buttonText", v)}
          />
          <Field
            label="Button Link"
            value={props.buttonHref || ""}
            onChange={(v: any) => setProp("buttonHref", v)}
          />
        </div>
        <Select
          label="Position"
          value={props.position || "bottom-right"}
          onChange={(v: any) => setProp("position", v)}
          options={["bottom-right", "bottom-left"]}
        />
      </div>
    );
  }

  if (type === "ContentSplitShowcase/V1") {
    const bullets = Array.isArray(props.bullets) ? props.bullets : [];
    const presets = [
      {
        id: "saas",
        label: "SaaS Showcase",
        data: {
          title: "Ship better pages with visual control",
          subtitle: "Design, content, and commerce in one workflow.",
          bullets: ["Reusable blocks", "Live visual editing", "Store-ready checkout"],
          ctaText: "Start Building",
          ctaHref: "/",
          reverse: false,
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 56, right: 12, bottom: 56, left: 12 },
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#0f172a",
          radius: 16,
          border: { enabled: false, width: 1, color: "#cbd5e1" },
          shadow: "none",
        },
      },
      {
        id: "ecomm",
        label: "Ecommerce Showcase",
        data: {
          title: "Show products with clean storytelling",
          subtitle: "Highlight value, social proof, and quick actions.",
          bullets: ["Variant-ready products", "Promotion engine", "Cart + order management"],
          ctaText: "Browse Catalog",
          ctaHref: "/products",
          reverse: true,
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 56, right: 12, bottom: 56, left: 12 },
          bg: {
            type: "gradient",
            gradient: { from: "#f8fafc", to: "#e2e8f0", direction: "to-r" },
          },
          textColor: "#0f172a",
          radius: 16,
          border: { enabled: true, width: 1, color: "#cbd5e1" },
          shadow: "none",
        },
      },
      {
        id: "agency",
        label: "Agency Showcase",
        data: {
          title: "Deliver polished websites faster",
          subtitle: "Use templates and structured sections to accelerate delivery.",
          bullets: ["Client-ready presets", "Theme controls", "Flexible layouts"],
          ctaText: "View Work",
          ctaHref: "/work",
          reverse: false,
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "xl",
          padding: { top: 56, right: 12, bottom: 56, left: 12 },
          bg: {
            type: "gradient",
            gradient: { from: "#0f172a", to: "#334155", direction: "to-r" },
          },
          textColor: "#e2e8f0",
          radius: 16,
          border: { enabled: false, width: 1, color: "#334155" },
          shadow: "none",
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  Object.entries(p.data).forEach(([k, v]) => setProp(k, v));
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-12 rounded bg-slate-50 border border-slate-200 px-2 flex items-center text-xs">
                  {p.data.title}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <Field
          label="Title"
          value={props.title || ""}
          onChange={(v: any) => setProp("title", v)}
        />
        <Field
          label="Subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        <div className="space-y-2">
          {bullets.map((b: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <Field
                label={`Bullet ${i + 1}`}
                value={b || ""}
                onChange={(v: any) => setPropPath(`bullets.${i}`, v)}
              />
              <button
                type="button"
                className="text-xs text-red-500 border rounded px-2 py-1 mt-6"
                onClick={() =>
                  setProp(
                    "bullets",
                    bullets.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setProp("bullets", [...bullets, "New bullet"])}
            className="border rounded px-3 py-1 text-sm hover:bg-muted"
          >
            + Add Bullet
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="CTA Text"
            value={props.ctaText || ""}
            onChange={(v: any) => setProp("ctaText", v)}
          />
          <Field
            label="CTA Link"
            value={props.ctaHref || ""}
            onChange={(v: any) => setProp("ctaHref", v)}
          />
        </div>
        <label className="flex items-center gap-2 border rounded p-2">
          <input
            type="checkbox"
            checked={!!props.reverse}
            onChange={(e) => setProp("reverse", e.target.checked)}
          />
          <span className="text-sm">Reverse columns</span>
        </label>
        <ImageField
          siteId={siteId}
          label="Media"
          assetIdValue={props.mediaAssetId || ""}
          altValue={props.mediaAlt || ""}
          onChangeAssetId={(v: any) => setProp("mediaAssetId", v)}
          onChangeAssetUrl={(v: any) => setProp("mediaUrl", v)}
          onChangeAlt={(v: any) => setProp("mediaAlt", v)}
          assetsMap={assetsMap}
          assetUrlValue={props.mediaUrl || DEFAULT_IMAGE}
        />
      </div>
    );
  }

  if (type === "SocialProofTicker/V1") {
    const items = Array.isArray(props.items) ? props.items : [];
    const presets = [
      {
        id: "purchases",
        label: "Recent Purchases",
        data: {
          speedSec: 30,
          items: [
            "A customer from Delhi purchased Premium Hoodie",
            "18 people bought in the last hour",
            "Back-in-stock alert active for 12 users",
          ],
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: { type: "solid", color: "#ecfdf5" },
          textColor: "#065f46",
          radius: 0,
        },
      },
      {
        id: "reviews",
        label: "Reviews & Ratings",
        data: {
          speedSec: 36,
          items: [
            "Rated 4.9/5 by 1,200+ customers",
            "Verified buyer: quality exceeded expectations",
            "Top-rated support for response time",
          ],
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: {
            type: "gradient",
            gradient: { from: "#ecfeff", to: "#f0fdf4", direction: "to-r" },
          },
          textColor: "#065f46",
          radius: 0,
        },
      },
      {
        id: "shipping",
        label: "Delivery Signals",
        data: {
          speedSec: 28,
          items: [
            "Ships in 24 hours",
            "Free shipping over Rs 999",
            "COD available in 20,000+ pincodes",
          ],
        },
        styleOverrides: {
          container: "boxed",
          maxWidth: "2xl",
          padding: { top: 10, right: 0, bottom: 10, left: 0 },
          bg: { type: "solid", color: "#f0f9ff" },
          textColor: "#0c4a6e",
          radius: 0,
        },
      },
    ];
    return (
      <div className="space-y-3">
        <ResetStyleButton />
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Visual Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted"
                onClick={() => {
                  setProp("items", p.data.items);
                  setProp("speedSec", p.data.speedSec);
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div className="h-10 rounded bg-emerald-50 border border-emerald-200 px-2 flex items-center text-[10px] text-emerald-900">
                  {p.data.items[0]}
                </div>
                <div className="mt-1 text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
        <Select
          label="Width"
          value={props.contentWidth || "2xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
        <NumberField
          label="Speed (seconds)"
          value={Number(props.speedSec ?? 35)}
          onChange={(n: any) => setProp("speedSec", Math.max(5, Number(n || 5)))}
        />
        {items.map((item: string, i: number) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-60">Message #{i + 1}</div>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() =>
                  setProp(
                    "items",
                    items.filter((_: any, idx: number) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Text"
              value={item || ""}
              onChange={(v: any) => setPropPath(`items.${i}`, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProp("items", [...items, "New social proof message"])}
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Message
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

const ICON_OPTIONS = [
  "ShoppingBag",
  "ShoppingCart",
  "Tag",
  "Gift",
  "Sparkles",
  "Star",
  "Palette",
  "BadgePercent",
  "Award",
  "CreditCard",
  "Truck",
  "Package",
  "Heart",
  "ThumbsUp",
  "ArrowRight",
  "ArrowUpRight",
  "ChevronRight",
  "Link",
  "Mail",
  "Phone",
  "MessageCircle",
  "RotateCcw",
  "Info",
  "HelpCircle",
  "Shield",
  "Lock",
  "User",
  "Users",
  "Globe",
  "MapPin",
  "Clock",
  "Calendar",
  "Camera",
  "Play",
  "Video",
  "Image",
  "Search",
  "Filter",
  "Plus",
  "Minus",
  "Check",
  "X",
];

function IconPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = ICON_OPTIONS.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  const Current = value ? (LucideIcons as any)[value] : null;

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <button
        type="button"
        className="w-full border rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {Current ? <Current className="h-4 w-4" /> : null}
          <span className="text-sm text-gray-700">{value || "None"}</span>
        </div>
        <span className="text-xs text-gray-500">{open ? "Close" : "Pick"}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Pick an icon</div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <input
              className="mt-3 w-full border rounded-md px-2 py-1.5 text-sm"
              placeholder="Search icons"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-3 max-h-64 overflow-auto grid grid-cols-6 gap-2">
              <button
                type="button"
                className="border rounded-md px-2 py-2 text-xs text-gray-500 hover:bg-gray-50"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                title="None"
              >
                None
              </button>
              {items.map((name) => {
                const Icon = (LucideIcons as any)[name];
                if (!Icon) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    className="border rounded-md px-2 py-2 text-xs hover:bg-gray-50 flex items-center justify-center"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    title={name}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
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

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <input
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm 
                   transition-all duration-200 placeholder:text-slate-400
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
        {label}
      </label>
      <input
        type="number"
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm 
                   transition-all duration-200
                   hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={Number.isNaN(value) ? 0 : value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700 ml-0.5">
        {label}
      </label>
      <div className="relative group">
        <select
          className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm 
                     transition-all duration-200 outline-none
                     hover:border-slate-400
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => {
            const optLabel = typeof o === "string" ? o : o.label;
            const optValue = typeof o === "string" ? o : o.value;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        {/* Custom Chevron for a more premium feel */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
          <ChevronDown size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
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
              onClick={() =>
                editor?.chain().focus().setTextAlign("right").run()
              }
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
    return {
      menuId: "menu_main",
      layout: "three-col",
      ctaText: "Shop",
      ctaHref: "/products",
      ctaSecondaryText: "Learn more",
      ctaSecondaryHref: "/about",
      contentWidth: "xl",
    };
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
      layout: "multi-column",
      description: "Building better digital experiences since 2023.",
      badgeText: "Designed for modern storefronts",
      showSocials: true,
      socialLinks: [],
    };
  if (type === "Hero/V1")
    return {
      heroPreset: "Basic",
      variant: "basic",
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
      secondaryCtaText: "",
      secondaryCtaHref: "",
      splitPanelTitle: "",
      splitHighlights: [],
      splitPanelCtaText: "",
      splitPanelCtaHref: "",
      centeredBadgeText: "",
      centeredTrustLine: "",
      centeredStats: [],
      promoBadgeText: "",
      promoCode: "",
      promoNote: "",
      promoBullets: [],
      align: "left",
      contentWidth: "xl",
      minHeight: 520,
      bg: {
        type: "none",
        color: "#0f172a",
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
  if (type === "CartPage/V1")
    return {
      title: "Your cart",
      emptyTitle: "Your cart is empty",
      emptyCtaText: "Browse products",
      emptyCtaHref: "/products",
      checkoutText: "Checkout",
      checkoutMode: "create-order",
      checkoutHref: "/checkout",
    };
  if (type === "CartSummary/V1")
    return {
      title: "Summary",
      checkoutText: "Checkout",
      checkoutHref: "/checkout",
    };
  if (type === "AddToCart/V1")
    return {
      productId: "",
      title: "Product",
      priceCents: 12900,
      image: "",
      buttonText: "Add to cart",
      quantity: 1,
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
            "Looks perfect on every device - mobile, tablet, desktop - no compromises.",
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
            "Built-in support for dark mode - just toggle your system preference.",
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
  if (type === "MarqueeStrip/V1")
    return {
      items: ["Free Shipping", "Easy Returns", "Secure Checkout", "24x7 Support"],
      speedSec: 30,
      pauseOnHover: true,
    };
  if (type === "SpotlightCards/V1")
    return {
      title: "Why Choose Us",
      subtitle: "Everything built to improve conversion.",
      cards: [
        { title: "Fast Setup", description: "Go live quickly with visual blocks.", icon: "⚡", href: "#" },
        { title: "Design Flexibility", description: "Customize every section deeply.", icon: "🎨", href: "#" },
        { title: "Commerce Ready", description: "Catalog, cart, and checkout included.", icon: "🛒", href: "#" },
      ],
    };
  if (type === "ProcessTimeline/V1")
    return {
      title: "How It Works",
      subtitle: "A simple three-step process.",
      steps: [
        { title: "Create Site", description: "Setup your store and theme." },
        { title: "Build Pages", description: "Compose sections and blocks." },
        { title: "Launch", description: "Publish and track growth." },
      ],
    };
  if (type === "MediaGalleryMasonry/V1")
    return {
      title: "Gallery",
      subtitle: "Showcase your brand visuals.",
      columns: 3,
      items: [{}, {}, {}, {}, {}],
    };
  if (type === "VideoHeroLite/V1")
    return {
      title: "Build and launch faster",
      subtitle: "Modern pages with visual control.",
      ctaText: "Get Started",
      ctaHref: "/",
      minHeight: 520,
      overlayOpacity: 0.45,
      videoUrl: "",
      posterUrl: "",
    };
  if (type === "KPIRibbon/V1")
    return {
      items: [
        { value: "120K+", label: "Orders Processed", icon: "📦" },
        { value: "99.9%", label: "Platform Uptime", icon: "⚡" },
        { value: "4.8/5", label: "Customer Rating", icon: "⭐" },
        { value: "24/7", label: "Support", icon: "💬" },
      ],
    };
  if (type === "InteractiveTabs/V1")
    return {
      title: "Explore",
      subtitle: "Keep content organized in tabs.",
      tabs: [
        { label: "Overview", title: "Overview", content: "Explain your core value." },
        { label: "Features", title: "Features", content: "List key capabilities." },
        { label: "Use Cases", title: "Use Cases", content: "Show who it is for." },
      ],
    };
  if (type === "FloatingCTA/V1")
    return {
      text: "Need help choosing?",
      buttonText: "Talk to us",
      buttonHref: "/contact",
      position: "bottom-right",
    };
  if (type === "ContentSplitShowcase/V1")
    return {
      title: "Build beautiful pages with confidence",
      subtitle: "Combine storytelling and commerce in one clean layout.",
      bullets: ["Visual editor", "Reusable blocks", "Store-ready flow"],
      ctaText: "Get Started",
      ctaHref: "/",
      reverse: false,
      mediaUrl: "",
      mediaAlt: "",
    };
  if (type === "SocialProofTicker/V1")
    return {
      items: [
        "A customer from Mumbai just purchased Premium Hoodie",
        "45 people bought in the last 24 hours",
        "Rated 4.8/5 by 1200+ customers",
      ],
      speedSec: 35,
    };
  return {};
}
