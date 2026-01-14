import React from "react";
import { getBlock } from "../blocks";
import { PageLayoutSchema } from "../schemas";
import { computeFinalStyle } from "./style-merge";
import { resolveWrapperStyle } from "./style-resolver";

export type RenderContext = {
  tenantId: string;
  storeId: string;
  snapshot: any; // published snapshot
};

function safeProps(schema: any, props: any) {
  const parsed = schema.safeParse(props ?? {});
  if (!parsed.success) {
    throw new Error(
      `BLOCK_PROPS_INVALID: ${parsed.error.issues.map((i: any) => i.message).join(", ")}`
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

  return (
    <>
      {parsedLayout.sections.map((sec) => (
        <React.Fragment key={sec.id}>
          {sec.blocks.map((b) => (
            <BlockRenderer key={b.id} block={b} ctx={ctx} />
          ))}
        </React.Fragment>
      ))}
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
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(finalStyle);

  if (!def) {
    return (
      <div className={outerClass} style={outerStyle}>
        <div
          className={`mx-auto max-w-screen-xl px-4 py-6 ${innerClass}`}
          style={innerStyle}
        >
          <div className="border rounded p-3 text-sm">
            Missing block: <b>{block.type}</b>
          </div>
        </div>
      </div>
    );
  }

  const props = safeProps(def.schema, block.props);

  // menu binding
  if (block.type.startsWith("Header/") || block.type.startsWith("Footer/")) {
    const menu = ctx.snapshot.menus?.[props.menuId] || null;
    const Comp = def.render;
    return (
      <div className={outerClass} style={outerStyle}>
        <div className={innerClass} style={innerStyle}>
          <Comp {...props} menu={menu} />
        </div>
      </div>
    );
  }

  // store context binding
  if (block.type.startsWith("ProductGrid/")) {
    const Comp = def.render;
    return (
      <div className={outerClass} style={outerStyle}>
        <div className={innerClass} style={innerStyle}>
          <Comp {...props} tenantId={ctx.tenantId} storeId={ctx.storeId} />
        </div>
      </div>
    );
  }

  const Comp = def.render;
  return (
    <div className={outerClass} style={outerStyle}>
      <div className={innerClass} style={innerStyle}>
        <Comp {...props} />
      </div>
    </div>
  );
}
