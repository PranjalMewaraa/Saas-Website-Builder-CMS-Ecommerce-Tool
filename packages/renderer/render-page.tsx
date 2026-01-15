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
        .join(", ")}`
    );
  }
  return parsed.data;
}

export async function RenderPage(args: {
  layout: unknown;
  ctx: RenderContext;
}) {
  const parsedLayout = PageLayoutSchema.parse(args.layout);
  const { ctx } = args;

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
  if (block.type === "Hero" || block.type === "Hero") {
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
  if (block.type.startsWith("Header/") || block.type.startsWith("Footer/")) {
    const menu = ctx.snapshot.menus?.[props.menuId] || null;
    const Comp = def.render;

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
