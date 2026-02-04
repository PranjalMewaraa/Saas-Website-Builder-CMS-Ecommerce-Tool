export type LayoutStyle = {
  width?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  height?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;
  padding?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  margin?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  textAlign?: "left" | "center" | "right";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: number | string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number | string;
  radius?: number | string;
  shadow?: "none" | "sm" | "md" | "lg";
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
};

export type LayoutAtomicBlock = {
  id: string;
  type: "Atomic/Text" | "Atomic/Image" | "Atomic/Video" | "Atomic/Button";
  props: any;
  style?: LayoutStyle;
};

export type LayoutCol = {
  id: string;
  style?: LayoutStyle;
  blocks: LayoutAtomicBlock[];
};

export type LayoutRow = {
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
  cols: LayoutCol[];
};

export type LayoutSectionProps = {
  style?: LayoutStyle;
  rows: LayoutRow[];
};

export type LayoutSelection =
  | { kind: "block"; blockId: string }
  | { kind: "layout-section"; blockId: string }
  | { kind: "layout-row"; blockId: string; rowId: string }
  | { kind: "layout-col"; blockId: string; rowId: string; colId: string }
  | {
      kind: "layout-atomic";
      blockId: string;
      rowId: string;
      colId: string;
      atomicId: string;
    };

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export const ATOMIC_TYPES: LayoutAtomicBlock["type"][] = [
  "Atomic/Text",
  "Atomic/Image",
  "Atomic/Video",
  "Atomic/Button",
];

export function createDefaultSectionProps(): LayoutSectionProps {
  return { style: {}, rows: [] };
}

export function createDefaultRow(): LayoutRow {
  return {
    id: uid("row"),
    layout: {
      mode: "preset",
      presetId: "1-col",
      display: "grid",
      columns: 1,
      gap: 24,
      align: "stretch",
      justify: "start",
      wrap: false,
    },
    style: { padding: { top: 12, bottom: 12 } },
    cols: [createDefaultCol()],
  };
}

export function createDefaultCol(): LayoutCol {
  return {
    id: uid("col"),
    style: { padding: { top: 8, bottom: 8 } },
    blocks: [],
  };
}

export function createAtomicBlock(
  type: LayoutAtomicBlock["type"],
): LayoutAtomicBlock {
  const defaultImage =
    "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTk4/MDI3NjkyNC92ZWN0/b3Ivbm8tcGhvdG8t/dGh1bWJuYWlsLWdy/YXBoaWMtZWxlbWVu/dC1uby1mb3VuZC1v/ci1hdmFpbGFibGUt/aW1hZ2UtaW4tdGhl/LWdhbGxlcnktb3It/YWxidW0tZmxhdC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WkJFM05xZnpJZUhH/RFBreXZ1bFV3MTRT/YVdmRGoyclp0eWlL/djN0b0l0az0";
  if (type === "Atomic/Text") {
    return {
      id: uid("atom"),
      type,
      props: { tag: "p", text: "Your text goes here" },
      style: { fontSize: 16, lineHeight: 24 },
    };
  }
  if (type === "Atomic/Image") {
    return {
      id: uid("atom"),
      type,
      props: { src: defaultImage, alt: "" },
      style: { width: "100%" },
    };
  }
  if (type === "Atomic/Video") {
    return {
      id: uid("atom"),
      type,
      props: { src: "", controls: true },
      style: { width: "100%" },
    };
  }
  return {
    id: uid("atom"),
    type: "Atomic/Button",
    props: { label: "Click me", href: "#" },
    style: {
      bgColor: "#111827",
      textColor: "#ffffff",
      padding: { top: 10, right: 18, bottom: 10, left: 18 },
      radius: 8,
      textAlign: "center",
    },
  };
}
