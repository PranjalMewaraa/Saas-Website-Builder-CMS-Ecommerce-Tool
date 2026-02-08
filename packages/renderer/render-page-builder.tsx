"use client";

import React from "react";
import { PageLayoutSchema } from "../schemas";
import { computeFinalStyle } from "./style-merge";
import { resolveWrapperStyle } from "./style-resolver";
import { buildResponsiveCss } from "./responsive-css";
import { LayoutSectionRenderer } from "./layout-section";

export type RenderContext = {
  tenantId: string;
  storeId: string;
  snapshot: any; // builder snapshot-like
};

export function RenderPageBuilder(args: {
  layout: unknown;
  ctx: RenderContext;
}) {
  const parsed = PageLayoutSchema.safeParse(args.layout);
  if (!parsed.success) {
    return (
      <div className="border rounded p-3 text-sm bg-red-50">
        Invalid layout JSON (builder preview).
      </div>
    );
  }

  const parsedLayout = parsed.data;
  const { ctx } = args;

  const css = buildResponsiveCss(parsedLayout);

  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}

      {parsedLayout.sections.map((sec: any) => {
        // ✅ Section wrapper style (8.10)
        const sectionFinalStyle = computeFinalStyle({
          style: sec.style,
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
            <div
              className={`${secInnerClass} __section-inner`}
              style={secInnerStyle}
            >
              {(sec.blocks || []).map((b: any) => (
                <BuilderBlockPreview
                  key={b.id}
                  block={b}
                  snapshot={ctx.snapshot}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function BuilderBlockPreview({
  block,
  snapshot,
}: {
  block: any;
  snapshot: any;
}) {
  const DEFAULT_IMAGE =
    "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
  if (block.type === "Layout/Section") {
    return (
      <div data-block-id={block.id}>
        <LayoutSectionRenderer
          props={block.props || { rows: [] }}
          assets={snapshot.assets}
          forms={snapshot.forms}
          handle={snapshot.handle}
          previewToken={snapshot.previewToken}
          mode="builder"
        />
      </div>
    );
  }
  const finalStyle = computeFinalStyle({
    style: block.style,
    presets: snapshot.stylePresets,
    assets: snapshot.assets,
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(finalStyle);

  const type = String(block.type || "Unknown");
  const props = block.props || {};

  if (props.imageUrl === "" && (props.imageAssetId || props.imageUrl !== undefined)) {
    props.imageUrl = DEFAULT_IMAGE;
  }
  if (props.bg && props.bg.type === "image" && !props.bg.imageUrl) {
    props.bg.imageUrl = DEFAULT_IMAGE;
  }

  return (
    <div data-block-id={block.id} className={outerClass} style={outerStyle}>
      <div className={`${innerClass} __inner`} style={innerStyle}>
        <div className="border rounded p-3">
          <div className="text-xs opacity-60">{block.id}</div>
          <div className="text-sm font-semibold">{type}</div>

          <div className="mt-2 text-xs opacity-80 space-y-1">
            {type.startsWith("Hero/") ? (
              <>
                <div>
                  <b>headline:</b> {props.headline || "(empty)"}
                </div>
                <div>
                  <b>cta:</b> {props.ctaText || ""}{" "}
                  {props.ctaHref ? `→ ${props.ctaHref}` : ""}
                </div>
              </>
            ) : null}

            {type.startsWith("Header/") || type.startsWith("Footer/") ? (
              <div>
                <b>menuId:</b> {props.menuId || "(none)"}
              </div>
            ) : null}

            {type.startsWith("Form/") ? (
              <div>
                <b>formId:</b> {props.formId || "(none)"} (preview disabled in
                builder)
              </div>
            ) : null}

            {type.startsWith("ProductGrid/") ? (
              <div>
                <b>ProductGrid:</b> server data disabled in builder preview
              </div>
            ) : null}

            {/* generic fallback */}
            {!type.startsWith("Hero/") &&
            !type.startsWith("Header/") &&
            !type.startsWith("Footer/") &&
            !type.startsWith("Form/") &&
            !type.startsWith("ProductGrid/") ? (
              <div className="font-mono">
                {JSON.stringify(props).slice(0, 160)}…
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
