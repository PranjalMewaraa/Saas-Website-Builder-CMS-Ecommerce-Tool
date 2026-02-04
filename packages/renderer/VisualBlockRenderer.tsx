"use client";

import { getBlock } from "@acme/blocks/registry";
import { StyleWrapper } from "./StyleWrapper";
import { LayoutSectionRenderer } from "./layout-section";

export function VisualBlockRenderer({
  block,
  isSelected,
  onSelect,
  showOutlines = true,
  menus,
}: {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
  showOutlines?: boolean;
  menus?: any[];
}) {
  const def = getBlock(block.type);

  if (block.type === "Layout/Section") {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`
          relative cursor-pointer
          ${
            isSelected
              ? "ring-2 ring-blue-500"
              : showOutlines
                ? "hover:ring-1 hover:ring-blue-300"
                : ""
          }
        `}
      >
        <LayoutSectionRenderer props={block.props || { rows: [] }} />
      </div>
    );
  }

  if (!def) {
    return (
      <div className="border border-red-400 p-4">
        Missing block: {block.type}
      </div>
    );
  }

  const Component = def.render;
  let menuProp: any = undefined;
  if (block.type.startsWith("Header/") || block.type.startsWith("Footer/")) {
    const slot = block.type.startsWith("Header/") ? "header" : "footer";
    const byId = menus?.find((m: any) => m._id === block.props?.menuId);
    const bySlot = menus?.find((m: any) => m.slot === slot);
    const menu = byId || bySlot;
    menuProp = menu ? { tree: menu.draft_tree ?? [] } : null;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`
      relative cursor-pointer
      ${
        isSelected
          ? "ring-2 ring-blue-500"
          : showOutlines
            ? "hover:ring-1 hover:ring-blue-300"
            : ""
      }
    `}
    >
      <StyleWrapper style={block.style}>
        <Component {...block.props} menu={menuProp} __editor />
      </StyleWrapper>
    </div>
  );
}
