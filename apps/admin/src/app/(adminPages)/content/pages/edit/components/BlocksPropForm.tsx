"use client";
import { useState } from "react";
import ImageField from "../../../_component/ImageField";

export function BlockPropsForm({
  type,
  props,
  setProp,
  setPropPath,
  propPath,
  siteId,
  assetsMap,
  forms,
}: any) {
  console.log(type);
  if (type === "Header/V1") {
    return (
      <div className="space-y-3">
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
    return (
      <div className="space-y-3">
        <Field
          label="menuId"
          value={props.menuId || ""}
          onChange={(v: any) => setProp("menuId", v)}
          placeholder="menu_footer"
        />
        <Select
          label="Width"
          value={props.contentWidth || "xl"}
          onChange={(v: any) => setProp("contentWidth", v)}
          options={["sm", "md", "lg", "xl", "2xl"]}
        />
      </div>
    );
  }

  if (type === "Hero" || type === "Hero/V1") {
    const [variant, setVariant] = useState(props.variant || "basic");
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
        <label className="block space-y-1">
          <div className="text-sm font-medium">HTML</div>
          <textarea
            className="w-full border rounded p-2 text-sm min-h-[120px]"
            value={props.html || ""}
            onChange={(e) => setProp("html", e.target.value)}
          />
        </label>
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

function defaultPropsFor(type: string) {
  if (type === "Header/V1")
    return { menuId: "menu_main", ctaText: "Shop", ctaHref: "/products" };
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
