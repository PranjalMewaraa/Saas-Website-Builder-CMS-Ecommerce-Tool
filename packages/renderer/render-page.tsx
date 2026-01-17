import React from "react";
import { getBlock } from "../blocks";
import { PageLayoutSchema } from "../schemas";
import { computeFinalStyle } from "./style-merge";
import { resolveWrapperStyle } from "./style-resolver";
import { buildResponsiveCss } from "./responsive-css";

export type RenderContext = {
  tenantId: string;
  storeId: string;
  snapshot: any; // published snapshot (or draft snapshot for preview/builder)
};

function safeProps(schema: any, props: any) {
  const parsed = schema.safeParse(props ?? {});
  if (!parsed.success) {
    throw new Error(
      `BLOCK_PROPS_INVALID: ${parsed.error.issues
        .map((i: any) => i.message)
        .join(", ")}`,
    );
  }
  return parsed.data;
}
function normalizeMenusBySlot(snapshot: any) {
  const raw = snapshot?.menus;
  console.log("Normalizing menus:", raw);
  if (!raw || typeof raw !== "object") return snapshot;

  const slotMenus: Record<string, any> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") continue;

    // ── Already using standard slot name as key ──
    if (key === "header" || key === "footer") {
      slotMenus[key] = {
        ...value,
        // Optional: ensure consistent shape
        tree: value.tree ?? [],
      };
      continue;
    }

    // ── Menu declares its own slot ──
    const slot = (value as any).slot;
    if (slot === "header" || slot === "footer") {
      slotMenus[slot] = {
        id: (value as any).id ?? key,
        tree: (value as any).tree ?? [],
        // you can copy other fields if needed, e.g. title, settings...
      };
    }

    // If you want to keep menus that have no slot or invalid slot → decide here
    // else { slotMenus[key] = value; }  ← preserve as-is (not recommended)
  }

  return {
    ...snapshot,
    menus: slotMenus,
  };
}

export async function RenderPage(args: {
  layout: unknown;
  ctx: RenderContext;
}) {
  const parsedLayout = PageLayoutSchema.parse(args.layout);

  // ✅ Normalize menus HERE (single source of truth)
  const ctx = {
    ...args.ctx,
    snapshot: normalizeMenusBySlot(args.ctx.snapshot),
  };

  const css = buildResponsiveCss(parsedLayout);

  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}

      {parsedLayout.sections.map((sec: any) => {
        // ✅ SECTION STYLE (8.10)
        const sectionFinalStyle = computeFinalStyle({
          style: sec.style, // section style (same contract as block style)
          presets: ctx.snapshot.stylePresets,
          assets: ctx.snapshot.assets,
        });

        const {
          outerClass: secOuterClass,
          innerClass: secInnerClass,
          outerStyle: secOuterStyle,
          innerStyle: secInnerStyle,
        } = resolveWrapperStyle(sectionFinalStyle);

        return (
          <div
            key={sec.id}
            data-section-id={sec.id}
            className={`${secOuterClass} border-2 border-black`}
            style={secOuterStyle}
          >
            {/* IMPORTANT: __section-inner is used by responsive-css selectors */}
            <div
              className={`${secInnerClass} __section-inner`}
              style={secInnerStyle}
            >
              {(sec.blocks || []).map((b: any) => (
                <BlockRenderer key={b.id} block={b} ctx={ctx} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

async function BlockRenderer({
  block,
  ctx,
}: {
  block: any;
  ctx: RenderContext;
}) {
  const def = getBlock(block.type);

  // presets live in snapshot.stylePresets (map)
  const finalStyle = computeFinalStyle({
    style: block.style,
    presets: ctx.snapshot.stylePresets,
    assets: ctx.snapshot.assets,
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(finalStyle);

  if (!def) {
    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <div className="border rounded p-3 text-sm">
            Missing block: <b>{block.type}</b>
          </div>
        </div>
      </div>
    );
  }

  const props = safeProps(def.schema, block.props);
  if (props?.bg && ctx.snapshot.assets) {
    const assets = ctx.snapshot.assets;

    // bg image
    if (props.bg.imageAssetId && assets[props.bg.imageAssetId]) {
      const a = assets[props.bg.imageAssetId];
      props.bg.imageUrl = props.bg.imageUrl || a.url;
      props.bg.imageAlt = props.bg.imageAlt || a.alt || "";
    }

    // bg video
    if (props.bg.videoAssetId && assets[props.bg.videoAssetId]) {
      const a = assets[props.bg.videoAssetId];
      props.bg.videoUrl = props.bg.videoUrl || a.url;
    }

    // poster
    if (props.bg.posterAssetId && assets[props.bg.posterAssetId]) {
      const a = assets[props.bg.posterAssetId];
      props.bg.posterUrl = props.bg.posterUrl || a.url;
    }
  }

  // Resolve asset references for any block that uses imageAssetId
  if (props.imageAssetId && ctx.snapshot.assets?.[props.imageAssetId]) {
    const a = ctx.snapshot.assets[props.imageAssetId];
    props.imageUrl = props.imageUrl || a.url;
    props.imageAlt = props.imageAlt || a.alt || "";
  }

  // Resolve logoAssetId -> logoUrl
  if (props.logoAssetId && ctx.snapshot.assets?.[props.logoAssetId]) {
    const a = ctx.snapshot.assets[props.logoAssetId];
    props.logoUrl = props.logoUrl || a.url;
    props.logoAlt = props.logoAlt || a.alt || "Logo";
  }

  // Global brand logo fallback
  if (!props.logoUrl && ctx.snapshot.brand?.logoUrl) {
    props.logoUrl = ctx.snapshot.brand.logoUrl;
    props.logoAlt = props.logoAlt || ctx.snapshot.brand.logoAlt || "Logo";
  }
  // ✅ Resolve nested bg assets for unified Hero block
  if (block.type === "Hero" || block.type === "Hero/V1") {
    if (props?.bg && ctx.snapshot.assets) {
      const assets = ctx.snapshot.assets;

      // background image
      if (props.bg.imageAssetId && assets[props.bg.imageAssetId]) {
        const a = assets[props.bg.imageAssetId];
        props.bg.imageUrl = props.bg.imageUrl || a.url;
        props.bg.imageAlt = props.bg.imageAlt || a.alt || "";
      }

      // background video
      if (props.bg.videoAssetId && assets[props.bg.videoAssetId]) {
        const a = assets[props.bg.videoAssetId];
        props.bg.videoUrl = props.bg.videoUrl || a.url;
      }

      // poster image
      if (props.bg.posterAssetId && assets[props.bg.posterAssetId]) {
        const a = assets[props.bg.posterAssetId];
        props.bg.posterUrl = props.bg.posterUrl || a.url;
      }
    }
  }

  // menu binding
  // menu binding
  // =====================
  // MENU SLOT BINDING (FIXED)
  // =====================
  if (block.type.startsWith("Header/") || block.type.startsWith("Footer/")) {
    const Comp = def.render;

    // Determine slot
    const slot =
      props.slot ?? (block.type.startsWith("Header/") ? "header" : "footer");

    let menu: any = null;

    /**
     * EXPECTED SHAPE:
     * ctx.snapshot.menus = {
     *   header: { tree: [...] },
     *   footer: { tree: [...] }
     * }
     */
    if (ctx.snapshot.menus && typeof ctx.snapshot.menus === "object") {
      menu = ctx.snapshot.menus[slot] ?? null;
    }
    console.log("here", ctx.snapshot.menus);

    console.log(
      "[MENU RESOLVE]",
      "block:",
      block.id,
      "slot:",
      slot,
      "menu:",
      menu,
      "available:",
      Object.keys(ctx.snapshot.menus || {}),
    );

    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <Comp {...props} menu={menu} />
        </div>
      </div>
    );
  }

  // store context binding
  if (block.type.startsWith("ProductGrid/")) {
    const Comp = def.render;
    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <Comp {...props} tenantId={ctx.tenantId} storeId={ctx.storeId} />
        </div>
      </div>
    );
  }

  // forms binding
  if (block.type.startsWith("Form/")) {
    const formId = props.formId;
    const form = ctx.snapshot.forms?.[formId];
    const Comp = def.render;

    if (!form?.schema) {
      return (
        <div data-block-id={block.id} className={outerClass} style={outerStyle}>
          <div className={`${innerClass} __inner`} style={innerStyle}>
            <div className="border rounded p-3 text-sm">
              Missing form schema: {formId}
            </div>
          </div>
        </div>
      );
    }

    // builder mode support (prevents submissions and uses draft schemas for preview rendering)
    const isBuilder = ctx.snapshot?.__mode === "builder";
    const isPreview = !!ctx.snapshot?.is_draft;

    const mode = isBuilder ? "builder" : isPreview ? "preview" : "published";

    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <Comp
            {...props}
            schema={form.schema}
            handle={ctx.snapshot.handle}
            mode={mode}
            previewToken={ctx.snapshot.previewToken}
          />
        </div>
      </div>
    );
  }

  // default render
  const Comp = def.render;
  return (
    <div data-block-id={block.id} className={outerClass} style={outerStyle}>
      <div className={`${innerClass} __inner`} style={innerStyle}>
        <Comp {...props} />
      </div>
    </div>
  );
}
