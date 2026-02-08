import React from "react";
import {
  resolveLayoutStyle,
  resolveRowLayoutStyle,
  resolveColFlexStyle,
  toCssSizeValue,
  getBackgroundVideo,
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

const DEFAULT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";

const ROW_PRESETS: Record<
  string,
  { label: string; template: string; gap?: number | string }
> = {
  "1-col": { label: "1 Column", template: "minmax(0, 1fr)" },
  "2-col": { label: "2 Columns", template: "repeat(2, minmax(0, 1fr))" },
  "3-col": { label: "3 Columns", template: "repeat(3, minmax(0, 1fr))" },
  "4-col": { label: "4 Columns", template: "repeat(4, minmax(0, 1fr))" },
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
  "two-one": {
    label: "2 / 1",
    template: "minmax(0, 2fr) minmax(0, 1fr)",
  },
  "one-two": {
    label: "1 / 2",
    template: "minmax(0, 1fr) minmax(0, 2fr)",
  },
  "three-one": {
    label: "3 / 1",
    template: "minmax(0, 3fr) minmax(0, 1fr)",
  },
  "one-three": {
    label: "1 / 3",
    template: "minmax(0, 1fr) minmax(0, 3fr)",
  },
  "two-one-one": {
    label: "2 / 1 / 1",
    template: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
  },
  "one-one-two": {
    label: "1 / 1 / 2",
    template: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)",
  },
  "one-two-one": {
    label: "1 / 2 / 1",
    template: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
  },
};

function renderVideoLayer(video: ReturnType<typeof getBackgroundVideo>) {
  if (!video) return null;
  return (
    <>
      <video
        src={video.src}
        poster={video.poster}
        autoPlay={video.autoplay}
        muted={video.muted}
        loop={video.loop}
        controls={video.controls}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      {video.overlayColor ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(${video.overlayColor}, ${video.overlayColor})`,
            opacity: video.overlayOpacity,
            zIndex: 1,
          }}
        />
      ) : null}
    </>
  );
}

function resolveAssetUrl(assetId: string | undefined, assets: any) {
  if (!assetId || !assets) return "";
  const a = assets[assetId];
  return a?.url || "";
}

function renderAtomicBlock(
  block: LayoutAtomic,
  assets: any,
  menus?: any,
  previewQuery?: string,
) {
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
    const src =
      props.src || resolveAssetUrl(props.assetId, assets) || DEFAULT_IMAGE;
    const imgStyle: React.CSSProperties = {
      ...style,
      width: toCssSizeValue(props.width) || style.width,
      height: toCssSizeValue(props.height) || style.height,
      objectFit: props.objectFit,
    };
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

  if (type === "Atomic/Icon") {
    const size = props.size ?? 24;
    return (
      <span
        style={{
          ...style,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: typeof size === "number" ? `${size}px` : size,
          color: props.color || style.color,
          lineHeight: 1,
        }}
      >
        {props.icon || "★"}
      </span>
    );
  }

  if (type === "Atomic/Divider") {
    const orientation = props.orientation || "horizontal";
    const thickness = props.thickness ?? 1;
    const length =
      props.length ?? (orientation === "horizontal" ? "100%" : 32);
    return (
      <div
        style={{
          ...style,
          width: orientation === "horizontal" ? length : thickness,
          height: orientation === "horizontal" ? thickness : length,
          backgroundColor: props.color || "#e5e7eb",
          borderRadius: 999,
        }}
      />
    );
  }

  if (type === "Atomic/Spacer") {
    const axis = props.axis || "vertical";
    const size = props.size ?? 24;
    return (
      <div
        style={{
          ...style,
          width: axis === "horizontal" ? size : "100%",
          height: axis === "vertical" ? size : "100%",
        }}
      />
    );
  }

  if (type === "Atomic/Badge") {
    return (
      <span
        style={{
          ...style,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 10px",
          borderRadius: 999,
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: "rgba(15,23,42,0.08)",
          color: "rgba(15,23,42,0.9)",
        }}
      >
        {props.text || "Badge"}
      </span>
    );
  }

  if (type === "Atomic/List") {
    const items = props.items || [];
    const icon = props.icon || "•";
    if (props.ordered) {
      return (
        <ol style={{ ...style, paddingLeft: "1.25rem" }}>
          {items.map((item: string, idx: number) => (
            <li key={idx} style={{ marginBottom: "0.35rem" }}>
              {item}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <ul style={{ ...style, paddingLeft: 0, listStyle: "none" }}>
        {items.map((item: string, idx: number) => (
          <li
            key={idx}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem" }}
          >
            <span>{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (type === "Atomic/Card") {
    return (
      <div
        style={{
          ...style,
          border: "1px solid rgba(15,23,42,0.12)",
          borderRadius: 16,
          padding: 16,
          background: "#fff",
        }}
      >
        {props.imageUrl ? (
          <img
            src={props.imageUrl}
            alt={props.title || "Card image"}
            style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
          />
        ) : null}
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          {props.title || "Card title"}
        </div>
        <div style={{ fontSize: 14, color: "rgba(15,23,42,0.7)" }}>
          {props.body || "Card description goes here."}
        </div>
        {props.buttonText ? (
          <a
            href={props.buttonHref || "#"}
            style={{
              display: "inline-flex",
              marginTop: 12,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#0f172a",
              color: "#fff",
              fontSize: 12,
            }}
          >
            {props.buttonText}
          </a>
        ) : null}
      </div>
    );
  }

  if (type === "Atomic/Accordion") {
    const items = props.items || [];
    return (
      <div>
        {items.map((item: any, idx: number) => (
          <details
            key={idx}
            style={{
              border: "1px solid rgba(15,23,42,0.12)",
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 8,
              background: "#fff",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {item.title}
            </summary>
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                color: "rgba(15,23,42,0.7)",
              }}
            >
              {item.content}
            </div>
          </details>
        ))}
      </div>
    );
  }

  if (type === "Atomic/Menu") {
    const menuId = props.menuId;
    const menu =
      (menuId && menus?.[menuId]) ||
      (menus?.header && menus?.header.id === menuId ? menus.header : null) ||
      (menus?.footer && menus?.footer.id === menuId ? menus.footer : null) ||
      null;
    const tree = menu?.tree || [];
    const gap = props.itemGap ?? 16;
    if (!tree.length) return null;
    return (
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: props.orientation === "vertical" ? "block" : "flex",
          gap: typeof gap === "number" ? `${gap}px` : gap,
          alignItems: "center",
        }}
      >
        {tree.map((node: any) => (
          <li key={node.id} style={{ position: "relative" }}>
            <a
              href={appendPreviewQuery(
                node.ref?.href || node.ref?.slug || "#",
                previewQuery,
              )}
              style={{
                color: "inherit",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {node.label}
            </a>
            {props.showDivider ? (
              <span
                style={{
                  position: "absolute",
                  right: -8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 1,
                  height: 12,
                  background: "rgba(148,163,184,0.6)",
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  if (type === "Atomic/Countdown") {
    const targetDate = props.targetDate
      ? new Date(props.targetDate)
      : null;
    const diff = targetDate
      ? Math.max(0, targetDate.getTime() - Date.now())
      : 0;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const display = props.showSeconds
      ? `${days}d ${hours}h ${mins}m ${secs}s`
      : `${days}d ${hours}h ${mins}m`;
    return (
      <div style={{ ...style }}>
        {props.label ? (
          <div style={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
            {props.label}
          </div>
        ) : null}
        <div style={{ fontSize: 20, fontWeight: 600 }}>{display}</div>
      </div>
    );
  }

  if (type === "Atomic/Embed") {
    if (props.code) {
      return <div dangerouslySetInnerHTML={{ __html: props.code }} />;
    }
    if (props.src) {
      return (
        <iframe
          src={props.src}
          title={props.title || "Embed"}
          style={{ width: "100%", height: 360, border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <div
        style={{
          border: "1px dashed rgba(0,0,0,0.2)",
          padding: "16px",
        }}
      >
        Embed
      </div>
    );
  }

  if (type === "Atomic/Group") {
    const outerStyle = resolveLayoutStyle(block.style || {});
    const groupStyle = resolveLayoutStyle(props.style || {});
    const outerVideo = getBackgroundVideo(block.style);
    const innerVideo = getBackgroundVideo(props.style);
    return (
      <div
        style={{
          ...outerStyle,
          position: outerVideo ? "relative" : undefined,
        }}
        data-group-id={block.id}
      >
        {renderVideoLayer(outerVideo)}
        <div
          style={{
            ...groupStyle,
            position: innerVideo ? "relative" : undefined,
          }}
        >
          {renderVideoLayer(innerVideo)}
          <div style={{ position: "relative", zIndex: 2 }}>
            {renderRows(props.rows || [], assets)}
          </div>
        </div>
      </div>
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

function renderRows(
  rows: LayoutRow[],
  assets: any,
  menus?: any,
  previewQuery?: string,
) {
  return rows.map((row) => {
    const rowPreset =
      row.layout?.mode === "preset"
        ? ROW_PRESETS[row.layout?.presetId || "1-col"]
        : undefined;

    const rowLayoutStyle = resolveRowLayoutStyle(row.layout, rowPreset);
    const rowStyle = resolveLayoutStyle(row.style);
    const rowVideo = getBackgroundVideo(row.style);

    return (
      <div
        key={row.id}
        data-row-id={row.id}
        style={{
          ...rowStyle,
          position: rowVideo ? "relative" : undefined,
        }}
      >
        {renderVideoLayer(rowVideo)}
        <div
          style={{
            ...rowLayoutStyle,
            position: "relative",
            zIndex: 2,
          }}
        >
        {(row.cols || []).map((col) => {
          const colStyle = resolveLayoutStyle(col.style);
          const colFlex = resolveColFlexStyle(col.style);
          const colVideo = getBackgroundVideo(col.style);
          return (
            <div
              key={col.id}
              data-col-id={col.id}
              style={{
                ...colStyle,
                ...colFlex,
                position: colVideo ? "relative" : undefined,
              }}
            >
              {renderVideoLayer(colVideo)}
              {(col.blocks || []).map((b) => (
                <div key={b.id} data-atomic-id={b.id}>
                  {renderAtomicBlock(b, assets, menus, previewQuery)}
                </div>
              ))}
            </div>
          );
        })}
        </div>
      </div>
    );
  });
}

export function LayoutSectionRenderer({
  props,
  assets,
  menus,
  previewQuery,
}: {
  props: LayoutSectionProps;
  assets?: any;
  menus?: any;
  previewQuery?: string;
}) {
  const sectionStyle = resolveLayoutStyle(props.style);
  const video = getBackgroundVideo(props.style);

  return (
    <section style={{ ...sectionStyle, position: video ? "relative" : undefined }}>
      {video ? (
        <>
          <video
            src={video.src}
            poster={video.poster}
            autoPlay={video.autoplay}
            muted={video.muted}
            loop={video.loop}
            controls={video.controls}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
          {video.overlayColor ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(${video.overlayColor}, ${video.overlayColor})`,
                opacity: video.overlayOpacity,
                zIndex: 1,
              }}
            />
          ) : null}
        </>
      ) : null}
      <div style={{ position: "relative", zIndex: 2 }}>
        {renderRows(props.rows || [], assets, menus, previewQuery)}
      </div>
    </section>
  );
}

function appendPreviewQuery(href: string, previewQuery?: string) {
  if (!previewQuery) return href;
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return href;
  }
  const [base, hash] = href.split("#");
  const [path, query] = base.split("?");
  const params = new URLSearchParams(query || "");
  const extra = new URLSearchParams(previewQuery);
  extra.forEach((value, key) => {
    if (!params.get(key)) params.set(key, value);
  });
  const qs = params.toString();
  const joined = `${path}${qs ? `?${qs}` : ""}`;
  return hash ? `${joined}#${hash}` : joined;
}

export const ROW_PRESET_OPTIONS = Object.entries(ROW_PRESETS).map(
  ([id, def]) => ({
    id,
    label: def.label,
  }),
);
