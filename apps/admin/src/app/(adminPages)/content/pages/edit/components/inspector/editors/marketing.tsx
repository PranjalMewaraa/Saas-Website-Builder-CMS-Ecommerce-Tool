"use client";
import { Field, NumberField, Select, IconPicker } from "../primitives";
import ImageField from "../../../../../_component/ImageField";
import ColorPickerInput from "../../../../../_component/ColorPickerInput";
import { DEFAULT_IMAGE } from "../constants";
import type { BlockEditorProps } from "../types";

export function BannerCTAV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    return (
      <div className="space-y-3">
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
export function FeaturesGridV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function TestimonialsV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
              options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function BrandGridV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const brands = Array.isArray(props.brands) ? props.brands : [];
    return (
      <div className="space-y-3">
        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">Content</div>
          <Select
            label="Width"
            value={props.contentWidth || "xl"}
            onChange={(v: any) => setProp("contentWidth", v)}
            options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
            label="Grid Gap"
            value={Number(props.gap ?? 16)}
            onChange={(n: any) => setProp("gap", Math.max(0, Number(n || 0)))}
          />
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="text-sm font-medium">CTA</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Brands</div>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1 hover:bg-muted"
              onClick={() =>
                setProp("brands", [
                  ...brands,
                  { name: "New Brand", href: "#", logo: "" },
                ])
              }
            >
              + Add Brand
            </button>
          </div>
          {brands.map((b: any, i: number) => (
            <div key={i} className="border rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs opacity-60">Brand #{i + 1}</div>
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() =>
                    setProp(
                      "brands",
                      brands.filter((_: any, idx: number) => idx !== i),
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <Field
                label="Name"
                value={b.name || ""}
                onChange={(v: any) => setPropPath(`brands.${i}.name`, v)}
              />
              <Field
                label="Link"
                value={b.href || ""}
                onChange={(v: any) => setPropPath(`brands.${i}.href`, v)}
              />
              <ImageField
                siteId={siteId}
                label="Logo"
                assetIdValue={b.logoAssetId || ""}
                altValue={b.name || ""}
                onChangeAssetId={(v: any) =>
                  setPropPath(`brands.${i}.logoAssetId`, v)
                }
                onChangeAssetUrl={(v: any) =>
                  setPropPath(`brands.${i}.logo`, v)
                }
                onChangeAlt={() => {}}
                assetsMap={assetsMap}
                assetUrlValue={b.logo || ""}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

export function MegaMenuV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const sections = Array.isArray(props.sections) ? props.sections : [];
    const presets = [
      {
        id: "catalog",
        label: "Catalog",
        props: {
          title: "Explore Catalog",
          subtitle: "Browse by category, collection and trend.",
          columns: 4,
          showSearch: true,
          ctaText: "View all products",
          ctaHref: "/products",
          sections: [
            {
              title: "New Arrivals",
              links: [
                { label: "Latest Drop", href: "/products", badge: "New" },
                { label: "Trending", href: "/products?sort=newest" },
              ],
            },
            {
              title: "Collections",
              links: [
                { label: "Summer", href: "/products?collection=summer" },
                {
                  label: "Essentials",
                  href: "/products?collection=essentials",
                },
              ],
            },
          ],
        },
        styleOverrides: {
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#0f172a",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          radius: 16,
          padding: { top: 40, right: 24, bottom: 40, left: 24 },
        },
      },
      {
        id: "minimal",
        label: "Minimal",
        props: {
          title: "Quick Navigation",
          subtitle: "Fast paths to your most visited pages.",
          columns: 3,
          showSearch: false,
        },
        styleOverrides: {
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#111827",
          borderColor: "#d1d5db",
          borderWidth: 1,
          radius: 12,
          padding: { top: 32, right: 20, bottom: 32, left: 20 },
        },
      },
      {
        id: "dark",
        label: "Dark Commerce",
        props: {
          title: "Shop Everything",
          subtitle: "Collections, offers and shortcuts in one panel.",
          columns: 5,
          showSearch: true,
          promo: {
            title: "Weekend Drop",
            description: "Limited-time markdowns on selected products.",
            image:
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
            ctaText: "Shop Offer",
            ctaHref: "/products",
          },
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0f172a" },
          textColor: "#e2e8f0",
          borderColor: "#334155",
          borderWidth: 1,
          radius: 16,
          padding: { top: 40, right: 24, bottom: 40, left: 24 },
        },
      },
    ];
    return (
      <div className="space-y-3">
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Preset Packs</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted transition"
                onClick={() => {
                  if (setProps) setProps({ ...(props || {}), ...p.props });
                  else
                    Object.entries(p.props).forEach(([k, v]) => setProp(k, v));
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div
                  className={`h-12 rounded-md border mb-2 ${
                    p.id === "dark"
                      ? "bg-slate-900 border-slate-700"
                      : p.id === "minimal"
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white border-slate-200"
                  }`}
                >
                  <div className="grid grid-cols-4 gap-1 p-2 h-full">
                    <div
                      className={`rounded-sm ${
                        p.id === "dark" ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`rounded-sm ${
                        p.id === "dark" ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`rounded-sm ${
                        p.id === "dark" ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={
                        p.id === "dark"
                          ? "bg-amber-300 rounded-sm"
                          : "bg-slate-300 rounded-sm"
                      }
                    />
                  </div>
                </div>
                <div className="text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
          <ResetStyleButton />
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <NumberField
            label="Columns"
            value={Number(props.columns || 4)}
            onChange={(v: any) =>
              setProp("columns", Math.max(1, Math.min(6, Number(v || 1))))
            }
          />
          <Select
            label="Show Search"
            value={props.showSearch === false ? "no" : "yes"}
            onChange={(v: any) => setProp("showSearch", v === "yes")}
            options={["yes", "no"]}
          />
        </div>
        <Field
          label="Search Placeholder"
          value={props.searchPlaceholder || ""}
          onChange={(v: any) => setProp("searchPlaceholder", v)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

        <div className="border rounded p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Sections</div>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1 hover:bg-muted"
              onClick={() =>
                setProp("sections", [
                  ...sections,
                  {
                    title: "New Section",
                    links: [{ label: "Link", href: "#" }],
                  },
                ])
              }
            >
              + Add Section
            </button>
          </div>
          {sections.map((section: any, i: number) => (
            <div key={i} className="border rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs opacity-60">Section #{i + 1}</div>
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() =>
                    setProp(
                      "sections",
                      sections.filter((_: any, idx: number) => idx !== i),
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <Field
                label="Section Title"
                value={section?.title || ""}
                onChange={(v: any) => setPropPath(`sections.${i}.title`, v)}
              />
              {Array.isArray(section?.links)
                ? section.links.map((link: any, lidx: number) => (
                    <div key={lidx} className="rounded border p-2 space-y-2">
                      <Field
                        label="Label"
                        value={link?.label || ""}
                        onChange={(v: any) =>
                          setPropPath(`sections.${i}.links.${lidx}.label`, v)
                        }
                      />
                      <Field
                        label="Href"
                        value={link?.href || ""}
                        onChange={(v: any) =>
                          setPropPath(`sections.${i}.links.${lidx}.href`, v)
                        }
                      />
                      <Field
                        label="Badge"
                        value={link?.badge || ""}
                        onChange={(v: any) =>
                          setPropPath(`sections.${i}.links.${lidx}.badge`, v)
                        }
                      />
                    </div>
                  ))
                : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

export function StoreLocatorV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const stores = Array.isArray(props.stores) ? props.stores : [];
    const presets = [
      {
        id: "map-first",
        label: "Map First",
        props: {
          title: "Find nearby stores",
          subtitle: "Search city and open directions.",
          showMap: true,
          ctaText: "Get support",
          ctaHref: "/contact",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#f8fafc" },
          textColor: "#0f172a",
          borderColor: "#cbd5e1",
          borderWidth: 1,
          radius: 14,
          padding: { top: 40, right: 24, bottom: 40, left: 24 },
        },
      },
      {
        id: "list-first",
        label: "List Focused",
        props: {
          title: "Store directory",
          subtitle: "Browse all stores with contact details.",
          showMap: false,
        },
        styleOverrides: {
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#111827",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          radius: 12,
          padding: { top: 32, right: 20, bottom: 32, left: 20 },
        },
      },
      {
        id: "premium",
        label: "Premium Cards",
        props: {
          title: "Visit our experience stores",
          subtitle: "Premium in-store help and pickup options.",
          showMap: true,
          ctaText: "Book a visit",
          ctaHref: "/contact",
        },
        styleOverrides: {
          bg: {
            type: "gradient",
            gradient: { from: "#ffffff", to: "#e2e8f0", angle: 180 },
          },
          textColor: "#0f172a",
          borderColor: "#cbd5e1",
          borderWidth: 1,
          radius: 16,
          padding: { top: 44, right: 24, bottom: 44, left: 24 },
        },
      },
    ];
    return (
      <div className="space-y-3">
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Preset Packs</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted transition"
                onClick={() => {
                  if (setProps) setProps({ ...(props || {}), ...p.props });
                  else
                    Object.entries(p.props).forEach(([k, v]) => setProp(k, v));
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div
                  className={`h-12 rounded-md border mb-2 p-2 ${
                    p.id === "premium"
                      ? "bg-gradient-to-b from-white to-slate-200 border-slate-300"
                      : p.id === "list-first"
                        ? "bg-white border-slate-200"
                        : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="grid grid-cols-[1fr_auto] gap-2 h-full">
                    <div className="space-y-1">
                      <div className="h-2 w-3/4 rounded bg-slate-300" />
                      <div className="h-2 w-1/2 rounded bg-slate-200" />
                    </div>
                    <div
                      className={`w-6 rounded ${
                        p.id === "list-first" ? "bg-slate-200" : "bg-slate-300"
                      }`}
                    />
                  </div>
                </div>
                <div className="text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
          <ResetStyleButton />
        </div>
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
        <Field
          label="Search Placeholder"
          value={props.searchPlaceholder || ""}
          onChange={(v: any) => setProp("searchPlaceholder", v)}
        />
        <Select
          label="Show Map"
          value={props.showMap === false ? "no" : "yes"}
          onChange={(v: any) => setProp("showMap", v === "yes")}
          options={["yes", "no"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
        <div className="border rounded p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Stores</div>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1 hover:bg-muted"
              onClick={() =>
                setProp("stores", [
                  ...stores,
                  { name: "New Store", city: "", mapUrl: "" },
                ])
              }
            >
              + Add Store
            </button>
          </div>
          {stores.map((store: any, i: number) => (
            <div key={i} className="border rounded p-2 space-y-2">
              <Field
                label="Name"
                value={store?.name || ""}
                onChange={(v: any) => setPropPath(`stores.${i}.name`, v)}
              />
              <Field
                label="Badge"
                value={store?.badge || ""}
                onChange={(v: any) => setPropPath(`stores.${i}.badge`, v)}
              />
              <Field
                label="Address"
                value={store?.address || ""}
                onChange={(v: any) => setPropPath(`stores.${i}.address`, v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Field
                  label="City"
                  value={store?.city || ""}
                  onChange={(v: any) => setPropPath(`stores.${i}.city`, v)}
                />
                <Field
                  label="State"
                  value={store?.state || ""}
                  onChange={(v: any) => setPropPath(`stores.${i}.state`, v)}
                />
              </div>
              <Field
                label="Map URL"
                value={store?.mapUrl || ""}
                onChange={(v: any) => setPropPath(`stores.${i}.mapUrl`, v)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

export function BundleOfferV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const items = Array.isArray(props.items) ? props.items : [];
    const presets = [
      {
        id: "starter-bundle",
        label: "Starter Bundle",
        props: {
          title: "Starter bundle",
          subtitle: "Perfect set for first-time buyers.",
          discountType: "percent",
          discountValue: 10,
          items: [
            { name: "Classic Tee", qty: 1, price: 899, image: "" },
            { name: "Athletic Jogger", qty: 1, price: 1499, image: "" },
          ],
        },
        styleOverrides: {
          bg: { type: "solid", color: "#ffffff" },
          textColor: "#0f172a",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          radius: 16,
          padding: { top: 40, right: 24, bottom: 40, left: 24 },
        },
      },
      {
        id: "clearance",
        label: "Clearance Deal",
        props: {
          title: "Clearance bundle",
          subtitle: "Big savings on selected inventory.",
          discountType: "fixed",
          discountValue: 500,
          ctaText: "Claim deal",
        },
        styleOverrides: {
          bg: { type: "solid", color: "#fef2f2" },
          textColor: "#7f1d1d",
          borderColor: "#fecaca",
          borderWidth: 1,
          radius: 12,
          padding: { top: 32, right: 20, bottom: 32, left: 20 },
        },
      },
      {
        id: "premium-kit",
        label: "Premium Kit",
        props: {
          title: "Premium complete kit",
          subtitle: "Everything you need in one checkout.",
          discountType: "percent",
          discountValue: 15,
          items: [
            { name: "Signature Hoodie", qty: 1, price: 2199, image: "" },
            { name: "Performance Jogger", qty: 1, price: 1799, image: "" },
            { name: "Core Tee", qty: 2, price: 999, image: "" },
          ],
        },
        styleOverrides: {
          bg: { type: "solid", color: "#0f172a" },
          textColor: "#e2e8f0",
          borderColor: "#334155",
          borderWidth: 1,
          radius: 16,
          padding: { top: 40, right: 24, bottom: 40, left: 24 },
        },
      },
    ];
    return (
      <div className="space-y-3">
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Preset Packs</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded-lg p-2 text-left hover:bg-muted transition"
                onClick={() => {
                  if (setProps) setProps({ ...(props || {}), ...p.props });
                  else
                    Object.entries(p.props).forEach(([k, v]) => setProp(k, v));
                  applyPresetStylePack(p.styleOverrides);
                }}
              >
                <div
                  className={`h-12 rounded-md border mb-2 p-2 ${
                    p.id === "premium-kit"
                      ? "bg-slate-900 border-slate-700"
                      : p.id === "clearance"
                        ? "bg-rose-50 border-rose-200"
                        : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex h-full items-end gap-1">
                    <div
                      className={
                        p.id === "premium-kit"
                          ? "h-3 w-4 rounded bg-slate-600"
                          : "h-3 w-4 rounded bg-slate-300"
                      }
                    />
                    <div
                      className={
                        p.id === "premium-kit"
                          ? "h-5 w-4 rounded bg-slate-500"
                          : "h-5 w-4 rounded bg-slate-400"
                      }
                    />
                    <div
                      className={
                        p.id === "premium-kit"
                          ? "h-4 w-4 rounded bg-slate-400"
                          : "h-4 w-4 rounded bg-slate-300"
                      }
                    />
                    <div
                      className={
                        p.id === "clearance"
                          ? "ml-auto h-3 w-8 rounded bg-rose-300"
                          : "ml-auto h-3 w-8 rounded bg-emerald-300"
                      }
                    />
                  </div>
                </div>
                <div className="text-xs font-medium">{p.label}</div>
              </button>
            ))}
          </div>
          <ResetStyleButton />
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Field
            label="Currency"
            value={props.currency || "INR"}
            onChange={(v: any) => setProp("currency", v)}
          />
          <Select
            label="Discount Type"
            value={props.discountType || "percent"}
            onChange={(v: any) => setProp("discountType", v)}
            options={["percent", "fixed"]}
          />
          <NumberField
            label="Discount Value"
            value={Number(props.discountValue || 0)}
            onChange={(v: any) =>
              setProp("discountValue", Math.max(0, Number(v || 0)))
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
        <Field
          label="Note"
          value={props.note || ""}
          onChange={(v: any) => setProp("note", v)}
        />
        <div className="border rounded p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Items</div>
            <button
              type="button"
              className="text-xs border rounded px-2 py-1 hover:bg-muted"
              onClick={() =>
                setProp("items", [
                  ...items,
                  { name: "New Item", qty: 1, price: 0 },
                ])
              }
            >
              + Add Item
            </button>
          </div>
          {items.map((item: any, i: number) => (
            <div key={i} className="border rounded p-2 space-y-2">
              <Field
                label="Name"
                value={item?.name || ""}
                onChange={(v: any) => setPropPath(`items.${i}.name`, v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <NumberField
                  label="Qty"
                  value={Number(item?.qty || 1)}
                  onChange={(v: any) =>
                    setPropPath(`items.${i}.qty`, Math.max(1, Number(v || 1)))
                  }
                />
                <NumberField
                  label="Price"
                  value={Number(item?.price || 0)}
                  onChange={(v: any) =>
                    setPropPath(`items.${i}.price`, Math.max(0, Number(v || 0)))
                  }
                />
              </div>
              <Field
                label="Image URL"
                value={item?.image || ""}
                onChange={(v: any) => setPropPath(`items.${i}.image`, v)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

export function ProductHighlightV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    return (
      <div className="space-y-3">
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
export function PricingTableV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function BentoGridV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function BeforeAfterSliderV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    return (
      <div className="space-y-3">
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
        />
        <Field
          label="subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
        <ImageField
          siteId={siteId}
          label="Before Image"
          assetIdValue={props.beforeImageAssetId || ""}
          altValue={props.beforeLabel || ""}
          onChangeAssetId={(v: any) => setProp("beforeImageAssetId", v)}
          onChangeAssetUrl={(v: any) => setProp("beforeImage", v)}
          onChangeAlt={(v: any) => setProp("beforeLabel", v)}
          assetsMap={assetsMap}
          assetUrlValue={props.beforeImage || DEFAULT_IMAGE}
        />
        <ImageField
          siteId={siteId}
          label="After Image"
          assetIdValue={props.afterImageAssetId || ""}
          altValue={props.afterLabel || ""}
          onChangeAssetId={(v: any) => setProp("afterImageAssetId", v)}
          onChangeAssetUrl={(v: any) => setProp("afterImage", v)}
          onChangeAlt={(v: any) => setProp("afterLabel", v)}
          assetsMap={assetsMap}
          assetUrlValue={props.afterImage || DEFAULT_IMAGE}
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

export function StickyPromoBarV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const presets = [
      {
        id: "dark-top",
        label: "Dark Top",
        props: {
          text: "Free shipping on orders above Rs 999",
          ctaText: "Shop Now",
          ctaHref: "/products",
          position: "top",
          align: "center",
          theme: "dark",
          offsetX: 12,
          offsetY: 8,
          radius: 12,
          bgColor: "",
          textColor: "",
          ctaBgColor: "",
          ctaTextColor: "",
        },
      },
      {
        id: "brand-center",
        label: "Brand Center",
        props: {
          text: "New arrivals are live. Limited launch discount.",
          ctaText: "Explore",
          ctaHref: "/products",
          position: "top",
          align: "center",
          theme: "brand",
          offsetX: 20,
          offsetY: 10,
          radius: 14,
          bgColor: "",
          textColor: "",
          ctaBgColor: "",
          ctaTextColor: "",
        },
      },
      {
        id: "bottom-alert",
        label: "Bottom Alert",
        props: {
          text: "Save 20% with code SAVE20",
          ctaText: "Apply Offer",
          ctaHref: "/cart",
          position: "bottom",
          align: "right",
          theme: "danger",
          offsetX: 16,
          offsetY: 12,
          radius: 14,
          bgColor: "",
          textColor: "",
          ctaBgColor: "",
          ctaTextColor: "",
        },
      },
    ];

    return (
      <div className="space-y-3">
        <div className="space-y-2 border rounded p-2">
          <div className="text-xs opacity-70">Quick Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="border rounded p-2 text-left text-xs hover:bg-muted"
                onClick={() => {
                  Object.entries(p.props).forEach(([k, v]) => setProp(k, v));
                }}
              >
                <div className="h-8 rounded bg-slate-100 px-2 flex items-center">
                  {p.label}
                </div>
              </button>
            ))}
          </div>
        </div>
        <Field
          label="text"
          value={props.text || ""}
          onChange={(v: any) => setProp("text", v)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select
            label="position"
            value={props.position || "top"}
            onChange={(v: any) => setProp("position", v)}
            options={["top", "bottom"]}
          />
          <Select
            label="align"
            value={props.align || "center"}
            onChange={(v: any) => setProp("align", v)}
            options={["left", "center", "right"]}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <NumberField
            label="Offset X"
            value={Number(props.offsetX ?? 12)}
            onChange={(n: any) =>
              setProp("offsetX", Math.max(0, Number(n || 0)))
            }
          />
          <NumberField
            label="Offset Y"
            value={Number(props.offsetY ?? 8)}
            onChange={(n: any) =>
              setProp("offsetY", Math.max(0, Number(n || 0)))
            }
          />
          <Field
            label="Max Width"
            value={props.maxWidth || "1152px"}
            onChange={(v: any) => setProp("maxWidth", v)}
          />
          <NumberField
            label="Radius"
            value={Number(props.radius ?? 12)}
            onChange={(n: any) =>
              setProp("radius", Math.max(0, Number(n || 0)))
            }
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!props.dismissible}
            onChange={(e) => setProp("dismissible", e.target.checked)}
          />
          Dismiss button
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ColorPickerInput
            label="Bar BG (optional)"
            value={props.bgColor || ""}
            onChange={(v: any) => setProp("bgColor", v)}
          />
          <ColorPickerInput
            label="Bar Text (optional)"
            value={props.textColor || ""}
            onChange={(v: any) => setProp("textColor", v)}
          />
          <ColorPickerInput
            label="CTA BG (optional)"
            value={props.ctaBgColor || ""}
            onChange={(v: any) => setProp("ctaBgColor", v)}
          />
          <ColorPickerInput
            label="CTA Text (optional)"
            value={props.ctaTextColor || ""}
            onChange={(v: any) => setProp("ctaTextColor", v)}
          />
        </div>
      </div>
    );
  }

export function TestimonialCarouselV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
                setPropPath(
                  `testimonials.${i}.rating`,
                  Math.max(1, Math.min(5, n)),
                )
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

export function ComparisonTableV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
                    onChange={(v: any) =>
                      setPropPath(`rows.${ri}.values.${ci}`, v)
                    }
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

export function MarqueeStripV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
        />
        <NumberField
          label="Speed (seconds)"
          value={Number(props.speedSec ?? 30)}
          onChange={(n: any) =>
            setProp("speedSec", Math.max(5, Number(n || 5)))
          }
        />
        <NumberField
          label="Item Gap"
          value={Number(props.itemGap ?? 24)}
          onChange={(n: any) => setProp("itemGap", Math.max(0, Number(n || 0)))}
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

export function SpotlightCardsV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function ProcessTimelineV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const steps = Array.isArray(props.steps) ? props.steps : [];
    const presets = [
      {
        id: "onboarding",
        label: "3-Step Onboarding",
        steps: [
          {
            title: "Setup Store",
            description: "Choose store type and theme preset.",
          },
          {
            title: "Add Catalog",
            description: "Create categories, products, and variants.",
          },
          {
            title: "Launch Live",
            description: "Publish pages and start taking orders.",
          },
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
          {
            title: "Attract",
            description: "Drive traffic with campaigns and SEO.",
          },
          {
            title: "Convert",
            description: "Use social proof, offers, and CTAs.",
          },
          {
            title: "Retain",
            description: "Follow up with support and promotions.",
          },
          {
            title: "Repeat",
            description: "Build loyalty with repeat-purchase offers.",
          },
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
                    <div key={idx}>
                      {idx + 1}. {s.title}
                    </div>
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
              {
                title: `Step ${steps.length + 1}`,
                description: "Describe this step",
              },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Step
        </button>
      </div>
    );
  }

export function MediaGalleryMasonryV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
              onChangeAssetId={(v: any) =>
                setPropPath(`items.${i}.imageAssetId`, v)
              }
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

export function VideoHeroLiteV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          onChange={(n: any) =>
            setProp("minHeight", Math.max(320, Number(n || 320)))
          }
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
          <div className="text-xs opacity-60">
            {props.overlayOpacity ?? 0.45}
          </div>
        </label>
        <ImageField
          siteId={siteId}
          label="Video Asset"
          assetIdValue={props.videoAssetId || ""}
          altValue={""}
          onChangeAssetId={(v: any) => setProp("videoAssetId", v)}
          onChangeAssetUrl={(v: any) => setProp("videoUrl", v)}
          onChangeAlt={() => {}}
          assetsMap={assetsMap}
          assetUrlValue={props.videoUrl || ""}
        />
        <ImageField
          siteId={siteId}
          label="Poster Image"
          assetIdValue={props.posterAssetId || ""}
          altValue={""}
          onChangeAssetId={(v: any) => setProp("posterAssetId", v)}
          onChangeAssetUrl={(v: any) => setProp("posterUrl", v)}
          onChangeAlt={() => {}}
          assetsMap={assetsMap}
          assetUrlValue={props.posterUrl || DEFAULT_IMAGE}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field
            label="Video URL (manual override)"
            value={props.videoUrl || ""}
            onChange={(v: any) => setProp("videoUrl", v)}
          />
          <Field
            label="Poster URL (manual override)"
            value={props.posterUrl || ""}
            onChange={(v: any) => setProp("posterUrl", v)}
          />
        </div>
      </div>
    );
  }

export function KPIRibbonV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function InteractiveTabsV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const tabs = Array.isArray(props.tabs) ? props.tabs : [];
    const presets = [
      {
        id: "product",
        label: "Product Info Tabs",
        tabs: [
          {
            label: "Overview",
            title: "Overview",
            content: "Highlight top product value.",
          },
          {
            label: "Specs",
            title: "Specifications",
            content: "List important technical details.",
          },
          {
            label: "Shipping",
            title: "Shipping & Returns",
            content: "Delivery and return policy.",
          },
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
          {
            label: "Features",
            title: "Features",
            content: "Core features and capabilities.",
          },
          {
            label: "Integrations",
            title: "Integrations",
            content: "Apps and ecosystem support.",
          },
          {
            label: "Security",
            title: "Security",
            content: "Data and compliance details.",
          },
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
          {
            label: "Ordering",
            title: "Ordering",
            content: "How to place and track your order.",
          },
          {
            label: "Payments",
            title: "Payments",
            content: "Accepted payment methods.",
          },
          {
            label: "Support",
            title: "Support",
            content: "How to reach support and SLA.",
          },
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
                    <span
                      key={i}
                      className="inline-block mr-1 mb-1 rounded bg-slate-200 px-1.5 py-0.5"
                    >
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
              {
                label: `Tab ${tabs.length + 1}`,
                title: "Title",
                content: "Content",
              },
            ])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Tab
        </button>
      </div>
    );
  }

export function FloatingCTAV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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

export function ContentSplitShowcaseV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    const bullets = Array.isArray(props.bullets) ? props.bullets : [];
    const presets = [
      {
        id: "saas",
        label: "SaaS Showcase",
        data: {
          title: "Ship better pages with visual control",
          subtitle: "Design, content, and commerce in one workflow.",
          bullets: [
            "Reusable blocks",
            "Live visual editing",
            "Store-ready checkout",
          ],
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
          bullets: [
            "Variant-ready products",
            "Promotion engine",
            "Cart + order management",
          ],
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
          subtitle:
            "Use templates and structured sections to accelerate delivery.",
          bullets: [
            "Client-ready presets",
            "Theme controls",
            "Flexible layouts",
          ],
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function SocialProofTickerV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
        />
        <NumberField
          label="Speed (seconds)"
          value={Number(props.speedSec ?? 35)}
          onChange={(n: any) =>
            setProp("speedSec", Math.max(5, Number(n || 5)))
          }
        />
        <NumberField
          label="Item Gap"
          value={Number(props.itemGap ?? 24)}
          onChange={(n: any) => setProp("itemGap", Math.max(0, Number(n || 0)))}
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
          onClick={() =>
            setProp("items", [...items, "New social proof message"])
          }
          className="border rounded px-3 py-1 text-sm hover:bg-muted"
        >
          + Add Message
        </button>
      </div>
    );
  }

export function StatsCounterV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
              options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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

export function LogosCloudV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
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
          options={["auto", "sm", "md", "lg", "xl", "2xl"]}
        />
        <div className="text-xs opacity-60">
          Logos are managed via asset picker in renderer
        </div>
      </div>
    );
  }
export function NewsletterSignupV1(ctx: BlockEditorProps) {
  const { props, setProp, setProps, setPropPath, siteId, assetsMap, assetUrlValue, ResetStyleButton, applyPresetStylePack } = ctx;
    return (
      <div className="space-y-3">
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
        />

        <Field
          label="subtitle"
          value={props.subtitle || ""}
          onChange={(v: any) => setProp("subtitle", v)}
        />
      </div>
    );
  }
