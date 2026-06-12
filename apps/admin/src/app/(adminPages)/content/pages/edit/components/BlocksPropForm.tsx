"use client";
import { useEffect, useState } from "react";
import { BLOCK_EDITORS } from "./inspector/registry";
export function BlockPropsForm({
  type,
  props,
  setProp,
  setProps,
  setStyleOverrides,
  replaceStyleOverrides,
  setPropPath,
  propPath,
  siteId,
  assetsMap,
  forms,
  assetUrlValue,
  menus = [],
}: any) {
  const [variant, setVariant] = useState(props.variant || "basic");
  const [richMode, setRichMode] = useState<"visual" | "html">("visual");
  const assignedHeader = menus.find((m: any) => m.slot === "header");
  const assignedFooter = menus.find((m: any) => m.slot === "footer");
  const formOptions = (forms || []).map((f: any) => ({
    value: f._id,
    label: f.name ? `${f.name} — ${f._id}` : f._id,
  }));
  const applyPresetStylePack = (overrides: any) => {
    if (replaceStyleOverrides) {
      replaceStyleOverrides(overrides || {});
      return;
    }
    if (setStyleOverrides) {
      setStyleOverrides(overrides || {});
    }
  };
  const canResetStyle =
    typeof replaceStyleOverrides === "function" ||
    typeof setStyleOverrides === "function";
  const resetStyleOverrides = () => {
    if (replaceStyleOverrides) {
      replaceStyleOverrides({});
      return;
    }
    if (setStyleOverrides) {
      setStyleOverrides({});
    }
  };
  const ResetStyleButton = () =>
    canResetStyle ? (
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs border rounded px-2 py-1 hover:bg-muted"
          onClick={resetStyleOverrides}
        >
          Reset to Block Default Style
        </button>
      </div>
    ) : null;

  useEffect(() => {
    if (type === "Header/V1" && !props.menuId && assignedHeader?._id) {
      setProp("menuId", assignedHeader._id);
    }
    if (type === "Footer/V1" && !props.menuId && assignedFooter?._id) {
      setProp("menuId", assignedFooter._id);
    }
  }, [type, props.menuId, assignedHeader?._id, assignedFooter?._id, setProp]);

  useEffect(() => {
    if (type === "Hero" || type === "Hero/V1") {
      setVariant(props.variant || "basic");
    }
  }, [type, props.variant]);

  useEffect(() => {
    if (type === "Utility/RichText") {
      setRichMode("visual");
    }
  }, [type]);

  const Editor = BLOCK_EDITORS[type];
  if (Editor) {
    return (
      <Editor
        type={type}
        props={props}
        setProp={setProp}
        setProps={setProps}
        setStyleOverrides={setStyleOverrides}
        replaceStyleOverrides={replaceStyleOverrides}
        setPropPath={setPropPath}
        propPath={propPath}
        siteId={siteId}
        assetsMap={assetsMap}
        forms={forms}
        assetUrlValue={assetUrlValue}
        menus={menus}
        variant={variant}
        setVariant={setVariant}
        richMode={richMode}
        setRichMode={setRichMode}
        ResetStyleButton={ResetStyleButton}
        applyPresetStylePack={applyPresetStylePack}
        formOptions={formOptions}
        assignedHeader={assignedHeader}
        assignedFooter={assignedFooter}
      />
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      No form available for this block type {type}
    </div>
  );
}
