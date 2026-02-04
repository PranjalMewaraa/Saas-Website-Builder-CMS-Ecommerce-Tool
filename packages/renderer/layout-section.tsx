import React from "react";
import {
  resolveLayoutStyle,
  resolveRowLayoutStyle,
  resolveColFlexStyle,
  toCssSizeValue,
  type LayoutStyle,
} from "./layout-style";

type LayoutAtomic = {
  id: string;
  type: string;
  props?: any;
  style?: LayoutStyle;
};

type LayoutCol = {
  id: string;
  style?: LayoutStyle;
  blocks?: LayoutAtomic[];
};

type LayoutRow = {
  id: string;
  style?: LayoutStyle;
  layout?: {
    mode?: "preset" | "manual";
    presetId?: string;
    display?: "grid" | "flex";
    columns?: number;
    gap?: number | string;
    align?: LayoutStyle["align"];
    justify?: LayoutStyle["justify"];
    wrap?: boolean;
  };
  cols?: LayoutCol[];
};

type LayoutSectionProps = {
  style?: LayoutStyle;
  rows?: LayoutRow[];
};

const ROW_PRESETS: Record<
  string,
  { label: string; template: string; gap?: number | string }
> = {
  "1-col": { label: "1 Column", template: "minmax(0, 1fr)" },
  "2-col": { label: "2 Columns", template: "repeat(2, minmax(0, 1fr))" },
  "3-col": { label: "3 Columns", template: "repeat(3, minmax(0, 1fr))" },
  "sidebar-left": {
    label: "Sidebar Left",
    template: "minmax(0, 1fr) minmax(0, 2fr)",
  },
  "sidebar-right": {
    label: "Sidebar Right",
    template: "minmax(0, 2fr) minmax(0, 1fr)",
  },
  "three-uneven": {
    label: "3 Uneven",
    template: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
  },
};

function resolveAssetUrl(assetId: string | undefined, assets: any) {
  if (!assetId || !assets) return "";
  const a = assets[assetId];
  return a?.url || "";
}

function renderAtomicBlock(block: LayoutAtomic, assets: any) {
  const style = resolveLayoutStyle(block.style);
  const type = block.type;
  const props = block.props || {};

  if (type === "Atomic/Text") {
    const Tag: any = props.tag || "p";
    return (
      <Tag style={style} data-atomic-id={block.id}>
        {props.text || ""}
      </Tag>
    );
  }

  if (type === "Atomic/Image") {
    const src = props.src || resolveAssetUrl(props.assetId, assets);
    const imgStyle: React.CSSProperties = {
      ...style,
      width: toCssSizeValue(props.width) || style.width,
      height: toCssSizeValue(props.height) || style.height,
      objectFit: props.objectFit,
    };
    if (!src) {
      return (
        <div
          style={{
            ...imgStyle,
            border: "1px dashed rgba(0,0,0,0.2)",
            padding: "24px",
            fontSize: "12px",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Image
        </div>
      );
    }
    return <img src={src} alt={props.alt || ""} style={imgStyle} />;
  }

  if (type === "Atomic/Video") {
    const src = props.src || resolveAssetUrl(props.assetId, assets);
    if (!src) {
      return (
        <div
          style={{
            ...style,
            border: "1px dashed rgba(0,0,0,0.2)",
            padding: "24px",
            fontSize: "12px",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Video
        </div>
      );
    }
    return (
      <video
        src={src}
        poster={props.poster}
        autoPlay={!!props.autoplay}
        muted={!!props.muted}
        loop={!!props.loop}
        controls={props.controls ?? true}
        style={style}
      />
    );
  }

  if (type === "Atomic/Button") {
    const href = props.href || "#";
    return (
      <a href={href} target={props.target || "_self"} style={style}>
        {props.label || "Button"}
      </a>
    );
  }

  return (
    <div
      style={{
        ...style,
        border: "1px dashed rgba(0,0,0,0.2)",
        padding: "12px",
        fontSize: "12px",
      }}
    >
      Unknown atomic block: {type}
    </div>
  );
}

export function LayoutSectionRenderer({
  props,
  assets,
}: {
  props: LayoutSectionProps;
  assets?: any;
}) {
  const sectionStyle = resolveLayoutStyle(props.style);
  const rows = props.rows || [];

  return (
    <section style={sectionStyle}>
      {rows.map((row) => {
        const rowPreset =
          row.layout?.mode === "preset"
            ? ROW_PRESETS[row.layout?.presetId || "1-col"]
            : undefined;

        const rowLayoutStyle = resolveRowLayoutStyle(row.layout, rowPreset);
        const rowStyle = resolveLayoutStyle(row.style);

        return (
          <div
            key={row.id}
            data-row-id={row.id}
            style={{ ...rowStyle, ...rowLayoutStyle }}
          >
            {(row.cols || []).map((col) => {
              const colStyle = resolveLayoutStyle(col.style);
              const colFlex = resolveColFlexStyle(col.style);
              return (
                <div
                  key={col.id}
                  data-col-id={col.id}
                  style={{ ...colStyle, ...colFlex }}
                >
                  {(col.blocks || []).map((b) => (
                    <div key={b.id} data-atomic-id={b.id}>
                      {renderAtomicBlock(b, assets)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

export const ROW_PRESET_OPTIONS = Object.entries(ROW_PRESETS).map(
  ([id, def]) => ({
    id,
    label: def.label,
  }),
);

