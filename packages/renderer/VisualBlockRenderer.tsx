"use client";

import { getBlock } from "@acme/blocks/registry";
import { StyleWrapper } from "./StyleWrapper";

export function VisualBlockRenderer({
  block,
  isSelected,
  onSelect,
}: {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const def = getBlock(block.type);

  if (!def) {
    return (
      <div className="border border-red-400 p-4">
        Missing block: {block.type}
      </div>
    );
  }

  const Component = def.render;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`
      relative cursor-pointer
      ${isSelected ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-blue-300"}
    `}
    >
      <StyleWrapper style={block.style}>
        <Component {...block.props} __editor />
      </StyleWrapper>
    </div>
  );
}
