import React from "react";
import { getBlock } from "../blocks/registry";
import { PageLayoutSchema } from "../schemas";
import { computeFinalStyle } from "./style-merge";
import { resolveWrapperStyle } from "./style-resolver";
import { buildResponsiveCss } from "./responsive-css";
import { StyleWrapper } from "./StyleWrapper";
import { LayoutSectionRenderer } from "./layout-section";
import FormV1 from "../blocks/Form/FormV1";

export type RenderContext = {
  tenantId: string;
  storeId: string;
  snapshot: any; // published snapshot (or draft snapshot for preview/builder)
  path?: string;
  search?: string;
  mode?: "builder" | "preview" | "published";
};

function safeProps(schema: any, props: any) {
  // IMPORTANT: do NOT apply defaults during render
  const parsed = schema.partial().safeParse(props ?? {});
  if (!parsed.success) {
    console.warn("BLOCK_PROPS_INVALID", parsed.error.format());
    return props ?? {};
  }

  return { ...props, ...parsed.data };
}

function normalizeMenusBySlot(snapshot: any) {
  const raw = snapshot?.menus;

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
    menus: {
      ...(raw as Record<string, any>),
      ...slotMenus,
    },
  };
}

const DEFAULT_FOOTER_STYLE = {
  bg: { type: "solid", color: "#0f172a" },
  textColor: "#94a3b8",
  padding: { top: 64, right: 24, bottom: 32, left: 24 },
};

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
  const mode =
    args.ctx.mode ||
    (ctx.snapshot?.__mode === "builder"
      ? "builder"
      : ctx.snapshot?.is_draft
        ? "preview"
        : "published");
  const previewQuery =
    mode === "preview" && ctx.snapshot?.previewToken && ctx.snapshot?.handle
      ? `handle=${encodeURIComponent(ctx.snapshot.handle)}&token=${encodeURIComponent(ctx.snapshot.previewToken)}`
      : "";
  const rawSearch = (ctx.search || "").replace(/^\?/, "");
  const searchParams = new URLSearchParams(rawSearch);
  const persistedHandle = searchParams.get("handle") || "";
  const persistedSid = searchParams.get("sid") || "";
  const publishQuery = new URLSearchParams();
  if (persistedHandle) publishQuery.set("handle", persistedHandle);
  if (persistedSid) publishQuery.set("sid", persistedSid);
  const navigationQuery =
    mode === "preview" ? previewQuery : publishQuery.toString();
  ctx.mode = mode;

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
            className={secOuterClass}
            style={secOuterStyle}
          >
            {/* IMPORTANT: __section-inner is used by responsive-css selectors */}
            <div
              className={`${secInnerClass} __section-inner`}
              style={secInnerStyle}
            >
              {(sec.blocks || []).map((b: any) => (
                <BlockRenderer
                  key={b.id}
                  block={b}
                  ctx={ctx}
                  previewQuery={navigationQuery}
                />
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
  previewQuery,
}: {
  block: any;
  ctx: RenderContext;
  previewQuery?: string;
}) {
  const DEFAULT_IMAGE =
    "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
  if (block.type === "Layout/Section") {
    return (
      <div data-block-id={block.id}>
        <LayoutSectionRenderer
          blockId={block.id}
          props={block.props || { rows: [] }}
          assets={ctx.snapshot.assets}
          menus={ctx.snapshot.menus}
          previewQuery={previewQuery}
          forms={ctx.snapshot.forms}
          handle={ctx.snapshot.handle}
          previewToken={ctx.snapshot.previewToken}
          mode={ctx.mode || "published"}
        />
      </div>
    );
  }

  const def = getBlock(block.type);

  let styleSource = block.style;
  if (
    block.type === "Footer/V1" &&
    (!styleSource?.presetId &&
      (!styleSource?.overrides ||
        Object.keys(styleSource.overrides).length === 0))
  ) {
    styleSource = {
      ...(styleSource || {}),
      overrides: { ...DEFAULT_FOOTER_STYLE },
    };
  }

  // presets live in snapshot.stylePresets (map)
  const finalStyle = computeFinalStyle({
    style: styleSource,
    presets: ctx.snapshot.stylePresets,
    assets: ctx.snapshot.assets,
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(finalStyle);

  if (!def) {
    return (
      <div data-block-id={block.id} className={outerClass} style={safeOuterStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <div className="border rounded p-3 text-sm">
            Missing block: <b>{block.type}</b>
          </div>
        </div>
      </div>
    );
  }

  const props = safeProps(def.schema, block.props);
  if (previewQuery && (block.type.startsWith("Header/") || block.type.startsWith("Footer/"))) {
    (props as any).previewQuery = previewQuery;
  }
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
  if (!props.imageUrl && (props.imageAssetId || props.imageUrl !== undefined)) {
    props.imageUrl = DEFAULT_IMAGE;
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

  if (props.bg) {
    if (props.bg.imageAssetId && ctx.snapshot.assets?.[props.bg.imageAssetId]) {
      const a = ctx.snapshot.assets[props.bg.imageAssetId];
      props.bg.imageUrl = props.bg.imageUrl || a.url;
      props.bg.imageAlt = props.bg.imageAlt || a.alt || "";
    }
    if (!props.bg.imageUrl && props.bg.type === "image") {
      props.bg.imageUrl = DEFAULT_IMAGE;
    }
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
    const resolvedSiteName =
      ctx.snapshot?.siteName ||
      ctx.snapshot?.site?.name ||
      ctx.snapshot?.site_seo?.siteName ||
      ctx.snapshot?.handle ||
      "Site";

    // Determine slot
    const slot =
      props.slot ?? (block.type.startsWith("Header/") ? "header" : "footer");

    let menu: any = null;
    let menusById: Record<string, any> = {};

    if (ctx.snapshot.menus && typeof ctx.snapshot.menus === "object") {
      menusById = Object.entries(ctx.snapshot.menus).reduce(
        (acc, [key, value]) => {
          if (!value || typeof value !== "object") return acc;
          const typed = value as any;
          const tree = Array.isArray(typed.tree) ? typed.tree : [];
          const id = typed.id || key;
          if (id) acc[id] = { id, tree };
          return acc;
        },
        {} as Record<string, any>,
      );
      if (props.menuId && ctx.snapshot.menus[props.menuId]) {
        menu = ctx.snapshot.menus[props.menuId];
      } else {
        menu = ctx.snapshot.menus[slot] ?? null;
      }
    }

    const isHeader = block.type.startsWith("Header/");
    const safeOuterStyle: any = { ...outerStyle };
    const safeInnerStyle: any = { ...innerStyle };
    if (isHeader) {
      // Mega menu panels must be allowed to escape header wrappers.
      safeOuterStyle.overflow = "visible";
      safeInnerStyle.overflow = "visible";
      safeOuterStyle.position = safeOuterStyle.position || "relative";
      safeInnerStyle.position = safeInnerStyle.position || "relative";
      safeOuterStyle.zIndex = Math.max(Number(safeOuterStyle.zIndex || 0), 120);
      safeInnerStyle.zIndex = Math.max(Number(safeInnerStyle.zIndex || 0), 120);
    }

    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={safeInnerStyle}>
          <StyleWrapper style={finalStyle}>
            <Comp
              {...props}
              menu={menu}
              menus={block.type.startsWith("Footer/") ? menusById : undefined}
              logoUrl={ctx.snapshot.theme.brands?.logoUrl}
              siteName={block.type.startsWith("Header/") ? resolvedSiteName : undefined}
            />
          </StyleWrapper>
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
          <StyleWrapper style={finalStyle}>
            <Comp {...props} tenantId={ctx.tenantId} storeId={ctx.storeId} />
          </StyleWrapper>
        </div>
      </div>
    );
  }

  if (block.type.startsWith("ProductList/")) {
    const Comp = def.render;
    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <StyleWrapper style={finalStyle}>
            <Comp
              {...props}
              tenantId={ctx.tenantId}
              storeId={ctx.storeId}
              path={ctx.path}
              search={ctx.search}
            />
          </StyleWrapper>
        </div>
      </div>
    );
  }

  if (block.type.startsWith("ProductDetail/")) {
    const Comp = def.render;
    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <StyleWrapper style={finalStyle}>
            <Comp
              {...props}
              tenantId={ctx.tenantId}
              storeId={ctx.storeId}
              path={ctx.path}
              search={ctx.search}
            />
          </StyleWrapper>
        </div>
      </div>
    );
  }

  // forms binding
  if (block.type.startsWith("Form/") || block.type === "Atomic/Form") {
    const formId = props.formId;
    const form = ctx.snapshot.forms?.[formId];
    const Comp = def.render;
    const isAtomic = block.type === "Atomic/Form";

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

    if (isAtomic) {
      return (
        <div data-block-id={block.id} className={outerClass} style={outerStyle}>
          <div className={`${innerClass} __inner`} style={innerStyle}>
            <StyleWrapper style={block.style}>
              <FormV1
                formId={formId}
                schema={form.schema}
                handle={ctx.snapshot.handle}
                mode={mode}
                previewToken={ctx.snapshot.previewToken}
                title={props.title}
                submitText={props.submitText}
                contentWidth="full"
              />
            </StyleWrapper>
          </div>
        </div>
      );
    }

    return (
      <div data-block-id={block.id} className={outerClass} style={outerStyle}>
        <div className={`${innerClass} __inner`} style={innerStyle}>
          <StyleWrapper style={block.style}>
            <Comp
              {...props}
              schema={form.schema}
              handle={ctx.snapshot.handle}
              mode={mode}
              previewToken={ctx.snapshot.previewToken}
            />
          </StyleWrapper>
        </div>
      </div>
    );
  }

  // default render
  const Comp = def.render;

  return (
    <div data-block-id={block.id} className={outerClass} style={outerStyle}>
      <div className={`${innerClass} __inner`} style={innerStyle}>
        <StyleWrapper style={finalStyle}>
          <Comp {...props} />
        </StyleWrapper>
      </div>
    </div>
  );
}
