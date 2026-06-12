import type { ReactNode } from "react";

/**
 * Context passed from BlockPropsForm to each per-block editor. The monolith
 * uses loose `any` props throughout; we keep that here rather than invent a
 * stricter contract that the existing call sites don't satisfy.
 */
export type BlockEditorProps = {
  type: string;
  props: any;
  setProp: (key: string, value: any) => void;
  setProps?: (next: any) => void;
  setStyleOverrides?: (overrides: any) => void;
  replaceStyleOverrides?: (overrides: any) => void;
  setPropPath?: (path: string, value: any) => void;
  propPath?: any;
  siteId?: string;
  assetsMap?: any;
  forms?: any[];
  assetUrlValue?: any;
  menus?: any[];
  // Computed helpers/state lifted from BlockPropsForm.
  variant?: string;
  setVariant?: (v: string) => void;
  richMode?: "visual" | "html";
  setRichMode?: (m: "visual" | "html") => void;
  ResetStyleButton?: () => ReactNode;
  applyPresetStylePack?: (overrides: any) => void;
  formOptions?: Array<{ value: string; label: string }>;
  assignedHeader?: any;
  assignedFooter?: any;
};
