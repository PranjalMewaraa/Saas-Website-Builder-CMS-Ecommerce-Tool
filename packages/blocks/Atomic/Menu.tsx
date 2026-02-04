import React from "react";

type MenuNode = {
  id: string;
  label: string;
  type?: string;
  ref?: { slug?: string; href?: string };
  children?: MenuNode[];
};

export default function AtomicMenu(props: {
  menu?: { tree?: MenuNode[] };
  orientation?: "horizontal" | "vertical";
  showDivider?: boolean;
  itemGap?: string | number;
}) {
  const menu = props.menu?.tree || [];
  const gap = props.itemGap ?? (props.orientation === "horizontal" ? 16 : 8);

  if (!menu.length) return null;

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: props.orientation === "horizontal" ? "flex" : "block",
        gap: typeof gap === "number" ? `${gap}px` : gap,
        alignItems: "center",
      }}
    >
      {menu.map((node) => (
        <li key={node.id} style={{ position: "relative" }}>
          <a
            href={node.ref?.href || node.ref?.slug || "#"}
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
