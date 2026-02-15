"use client";

import { getBlockVisual } from "@acme/blocks/registry/visual";
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
  const def = getBlockVisual(block.type);

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
        <LayoutSectionRenderer
          blockId={block.id}
          props={block.props || { rows: [] }}
        />
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
  let menusById: Record<string, any> | undefined = undefined;
  if (block.type.startsWith("Header/") || block.type.startsWith("Footer/")) {
    const slot = block.type.startsWith("Header/") ? "header" : "footer";
    const byId = menus?.find((m: any) => m._id === block.props?.menuId);
    const bySlot = menus?.find((m: any) => m.slot === slot);
    const menu = byId || bySlot;
    menuProp = menu ? { tree: menu.draft_tree ?? [] } : null;
    if (block.type.startsWith("Footer/")) {
      menusById = (menus || []).reduce((acc: Record<string, any>, m: any) => {
        const id = m?._id;
        if (!id) return acc;
        acc[id] = { id, tree: m.draft_tree ?? [] };
        return acc;
      }, {});
    }
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
        <Component {...block.props} menu={menuProp} menus={menusById} __editor />
      </StyleWrapper>
    </div>
  );
}
