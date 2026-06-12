"use client";
import {
  Field,
  NumberField,
  Select,
  RichTextEditor,
  IconPicker,
  SocialLinksEditor,
} from "../primitives";
import ImageField from "../../../../../_component/ImageField";
import ColorPickerInput from "../../../../../_component/ColorPickerInput";
import { DEFAULT_IMAGE } from "../constants";
import type { BlockEditorProps } from "../types";

export function HeaderV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
    return (
      <div className="space-y-3">
        <div className=" rounded p-1 space-y-3">
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
              options={["auto", "sm", "md", "lg", "xl", "2xl"]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <NumberField
              label="Menu Gap"
              value={Number(props.menuGap ?? 24)}
              onChange={(n: any) =>
                setProp("menuGap", Math.max(0, Number(n || 0)))
              }
            />
            <NumberField
              label="Action Gap"
              value={Number(props.actionGap ?? 8)}
              onChange={(n: any) =>
                setProp("actionGap", Math.max(0, Number(n || 0)))
              }
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

        <div className=" rounded p-1 space-y-3">
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

        <div className=" rounded p-1 space-y-3">
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

        <div className="  p-1 space-y-3">
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

        <div className=" rounded p-1 space-y-3">
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

export function LayoutSection(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
    return (
      <div className="text-sm text-muted-foreground">
        This block uses the Layout editor. Switch to Visual mode to add rows,
        columns, and atomic blocks.
      </div>
    );
  }

export function FormV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function FooterV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
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
              options={["auto", "sm", "md", "lg", "xl", "2xl"]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <NumberField
              label="Menu Column Gap"
              value={Number(props.menuColumnGap ?? 32)}
              onChange={(n: any) =>
                setProp("menuColumnGap", Math.max(0, Number(n || 0)))
              }
            />
            <NumberField
              label="Menu Link Gap X"
              value={Number(props.menuLinkGapX ?? 24)}
              onChange={(n: any) =>
                setProp("menuLinkGapX", Math.max(0, Number(n || 0)))
              }
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

export function HeroV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
    const bg = props.bg || { type: "none" };
    const heroPreset = props.heroPreset || "Basic";

    const applyHeroPreset = (
      preset: "Basic" | "Split" | "Centered" | "Promo",
    ) => {
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
          bg: {
            ...(bg || {}),
            type: "image",
            imageUrl: bg.imageUrl || DEFAULT_IMAGE,
            overlayOpacity: 0.42,
          },
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
          promoBullets: [
            "Free shipping over Rs 999",
            "7-day returns",
            "COD available",
          ],
          bg: {
            ...(bg || {}),
            type: "image",
            imageUrl: bg.imageUrl || DEFAULT_IMAGE,
            overlayOpacity: 0.5,
          },
        });
      }

      setVariant(base.variant || "basic");
      if (setProps) setProps(base);
      else Object.entries(base).forEach(([k, v]) => setProp(k, v));
    };

    return (
      <div className="space-y-3">
        <div className=" rounded space-y-3">
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

        <div className=" space-y-3">
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

        <div className=" space-y-3">
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

        <div className=" space-y-3">
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
          <div className=" space-y-2">
            <div className="text-sm font-medium">Split Panel Content</div>
            <Field
              label="Panel Title"
              value={props.splitPanelTitle || ""}
              onChange={(v: any) => setProp("splitPanelTitle", v)}
            />
            {(Array.isArray(props.splitHighlights)
              ? props.splitHighlights
              : []
            ).map((item: string, i: number) => (
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
                      (props.splitHighlights || []).filter(
                        (_: any, idx: number) => idx !== i,
                      ),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() =>
                setProp("splitHighlights", [
                  ...(props.splitHighlights || []),
                  "New highlight",
                ])
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
          <div className=" space-y-2">
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
            {(Array.isArray(props.centeredStats)
              ? props.centeredStats
              : []
            ).map((s: any, i: number) => (
              <div key={i} className="grid grid-cols-2 gap-2 ">
                <Field
                  label="Value"
                  value={s?.value || ""}
                  onChange={(v: any) =>
                    setPropPath(`centeredStats.${i}.value`, v)
                  }
                />
                <Field
                  label="Label"
                  value={s?.label || ""}
                  onChange={(v: any) =>
                    setPropPath(`centeredStats.${i}.label`, v)
                  }
                />
                <button
                  type="button"
                  className="text-xs text-red-500 border rounded px-2 py-1 col-span-2"
                  onClick={() =>
                    setProp(
                      "centeredStats",
                      (props.centeredStats || []).filter(
                        (_: any, idx: number) => idx !== i,
                      ),
                    )
                  }
                >
                  Remove Stat
                </button>
              </div>
            ))}
            <button
              type="button"
              className="border rounded px-2 py-1 text-xs hover:bg-muted"
              onClick={() =>
                setProp("centeredStats", [
                  ...(props.centeredStats || []),
                  { value: "", label: "" },
                ])
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
                        (props.promoBullets || []).filter(
                          (_: any, idx: number) => idx !== i,
                        ),
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
                setProp("promoBullets", [
                  ...(props.promoBullets || []),
                  "New promo bullet",
                ])
              }
            >
              + Add Bullet
            </button>
          </div>
        ) : null}

        {/* Background controls */}
        {variant === "image" ? (
          <div className=" space-y-2">
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

export function UtilitySpacer(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
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

export function UtilityDivider(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
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

export function UtilityRichText(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setStyleOverrides, setPropPath, siteId, assetsMap, forms, assetUrlValue, menus, variant, setVariant, richMode, setRichMode, assignedFooter } = ctx;
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
