"use client";
import { Field, NumberField, Select } from "../primitives";
import type { BlockEditorProps } from "../types";

export function ProductListV1({ props, setProp }: BlockEditorProps) {
  return (
    <div className="space-y-3">
      <Field
        label="title"
        value={props.title || ""}
        onChange={(v: any) => setProp("title", v)}
        placeholder="All Products"
      />
      <Field
        label="subtitle"
        value={props.subtitle || ""}
        onChange={(v: any) => setProp("subtitle", v)}
        placeholder="Browse products with clean filters and fast results."
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
        options={["auto", "sm", "md", "lg", "xl", "2xl", "full"]}
      />
      <Field
        label="detailPathPrefix"
        value={props.detailPathPrefix || "/products"}
        onChange={(v: any) => setProp("detailPathPrefix", v)}
        placeholder="/products"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Select
          label="titleAlign"
          value={props.titleAlign || "left"}
          onChange={(v: any) => setProp("titleAlign", v)}
          options={["left", "center"]}
        />
        <Select
          label="sectionPadding"
          value={props.sectionPadding || "normal"}
          onChange={(v: any) => setProp("sectionPadding", v)}
          options={["compact", "normal", "spacious"]}
        />
        <Select
          label="gridCols"
          value={String(props.gridCols || "3")}
          onChange={(v: any) => setProp("gridCols", String(v))}
          options={["2", "3", "4", "5"]}
        />
        <Select
          label="gridGap"
          value={props.gridGap || "normal"}
          onChange={(v: any) => setProp("gridGap", v)}
          options={["tight", "normal", "relaxed"]}
        />
        <Select
          label="sidebarPosition"
          value={props.sidebarPosition || "left"}
          onChange={(v: any) => setProp("sidebarPosition", v)}
          options={["left", "right"]}
        />
        <Select
          label="filterStyle"
          value={props.filterStyle || "card"}
          onChange={(v: any) => setProp("filterStyle", v)}
          options={["card", "soft"]}
        />
      </div>
      <Field
        label="sectionBg"
        value={props.sectionBg || ""}
        onChange={(v: any) => setProp("sectionBg", v)}
        placeholder="#ffffff or linear-gradient(...)"
      />
      <Select
        label="Card Variant"
        value={props.cardVariant || "default"}
        onChange={(v: any) => setProp("cardVariant", v)}
        options={[
          "default",
          "minimal",
          "compact",
          "bordered",
          "horizontal",
          "editorial",
          "elevated",
          "glass",
          "dark",
        ]}
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
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={props.filterSticky ?? true}
          onChange={(e) => setProp("filterSticky", e.target.checked)}
        />
        Sticky filters
      </label>
    </div>
  );
}

export function ProductDetailV1({ props, setProp }: BlockEditorProps) {
  return (
    <div className="space-y-3">
      <Select
        label="Width"
        value={props.contentWidth || "xl"}
        onChange={(v: any) => setProp("contentWidth", v)}
        options={["auto", "sm", "md", "lg", "xl", "2xl", "full"]}
      />
      <Field
        label="detailPathPrefix"
        value={props.detailPathPrefix || "/products"}
        onChange={(v: any) => setProp("detailPathPrefix", v)}
        placeholder="/products"
      />
      <Select
        label="Related Card Variant"
        value={props.relatedCardVariant || "default"}
        onChange={(v: any) => setProp("relatedCardVariant", v)}
        options={[
          "default",
          "minimal",
          "compact",
          "bordered",
          "horizontal",
          "editorial",
          "elevated",
          "glass",
          "dark",
        ]}
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

export function CartPageV1({ props, setProp }: BlockEditorProps) {
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

export function CartSummaryV1({ props, setProp }: BlockEditorProps) {
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

export function AddToCartV1({ props, setProp }: BlockEditorProps) {
  const presets = [
    {
      id: "default",
      label: "Default",
      data: {
        variant: "default",
        size: "md",
        showTitle: false,
        showPrice: false,
        showImage: false,
        fullWidth: true,
        buttonText: "Add to cart",
        badgeText: "",
        noteText: "",
      },
    },
    {
      id: "outline",
      label: "Outline",
      data: {
        variant: "outline",
        size: "md",
        showTitle: false,
        showPrice: false,
        showImage: false,
        fullWidth: true,
        buttonText: "Add to bag",
        badgeText: "Secure checkout",
        noteText: "",
      },
    },
    {
      id: "minimal",
      label: "Minimal",
      data: {
        variant: "minimal",
        size: "sm",
        showTitle: false,
        showPrice: false,
        showImage: false,
        fullWidth: false,
        buttonText: "Quick add",
        badgeText: "",
        noteText: "Fast one-click add",
      },
    },
    {
      id: "split",
      label: "Split",
      data: {
        variant: "split",
        size: "md",
        showTitle: true,
        showPrice: true,
        showImage: false,
        fullWidth: true,
        buttonText: "Add",
        badgeText: "",
        noteText: "",
      },
    },
    {
      id: "card",
      label: "Card",
      data: {
        variant: "card",
        size: "md",
        showTitle: true,
        showPrice: true,
        showImage: true,
        fullWidth: true,
        buttonText: "Buy now",
        badgeText: "Best choice",
        noteText: "Free shipping on eligible orders",
      },
    },
    {
      id: "sticky",
      label: "Sticky Bar",
      data: {
        variant: "sticky",
        size: "md",
        showTitle: true,
        showPrice: true,
        showImage: false,
        fullWidth: true,
        buttonText: "Add to cart",
        badgeText: "",
        noteText: "",
      },
    },
  ];
  return (
    <div className="space-y-3">
      <div className="space-y-2 border rounded p-2">
        <div className="text-xs opacity-70">Variant Presets</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className="border rounded-lg p-2 text-left text-xs hover:bg-muted"
              onClick={() => {
                Object.entries(p.data).forEach(([k, v]) =>
                  setProp(k, v as any),
                );
              }}
            >
              <div className="h-8 rounded bg-slate-100 mb-1" />
              <div className="font-medium">{p.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          label="variant"
          value={props.variant || "default"}
          onChange={(v: any) => setProp("variant", v)}
          options={[
            "default",
            "outline",
            "minimal",
            "split",
            "card",
            "sticky",
          ]}
        />
        <Select
          label="size"
          value={props.size || "md"}
          onChange={(v: any) => setProp("size", v)}
          options={["sm", "md", "lg"]}
        />
      </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Select
          label="showTitle"
          value={props.showTitle === false ? "no" : "yes"}
          onChange={(v: any) => setProp("showTitle", v === "yes")}
          options={["yes", "no"]}
        />
        <Select
          label="showPrice"
          value={props.showPrice === false ? "no" : "yes"}
          onChange={(v: any) => setProp("showPrice", v === "yes")}
          options={["yes", "no"]}
        />
        <Select
          label="showImage"
          value={props.showImage ? "yes" : "no"}
          onChange={(v: any) => setProp("showImage", v === "yes")}
          options={["yes", "no"]}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="badgeText"
          value={props.badgeText || ""}
          onChange={(v: any) => setProp("badgeText", v)}
        />
        <Field
          label="noteText"
          value={props.noteText || ""}
          onChange={(v: any) => setProp("noteText", v)}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Field
          label="accentColor"
          value={props.accentColor || ""}
          onChange={(v: any) => setProp("accentColor", v)}
          placeholder="#111827"
        />
        <Field
          label="textColor"
          value={props.textColor || ""}
          onChange={(v: any) => setProp("textColor", v)}
          placeholder="#ffffff"
        />
        <Field
          label="surfaceColor"
          value={props.surfaceColor || ""}
          onChange={(v: any) => setProp("surfaceColor", v)}
          placeholder="#ffffff"
        />
        <NumberField
          label="radius"
          value={Number(props.radius ?? 10)}
          onChange={(v: any) => setProp("radius", Math.max(0, Number(v || 0)))}
        />
      </div>
    </div>
  );
}

export function ProductGridV1({ props, setProp }: BlockEditorProps) {
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
        options={["auto", "sm", "md", "lg", "xl", "2xl"]}
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
      <Select
        label="Card Variant"
        value={props.cardVariant || "default"}
        onChange={(v: any) => setProp("cardVariant", v)}
        options={[
          "default",
          "minimal",
          "compact",
          "bordered",
          "horizontal",
          "editorial",
          "elevated",
          "glass",
          "dark",
        ]}
      />
    </div>
  );
}
