"use client";

import { useMemo, useState } from "react";

type MissingRefs = {
  menus: Array<{ blockId: string; old: string }>;
  forms: Array<{ blockId: string; old: string }>;
  assets: Array<{ where: string; old: string }>;
};

export default function TemplateInsertWizard({
  open,
  onClose,
  template,
  snapshotLike,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  template: any | null;
  snapshotLike: any;
  onConfirm: (mapping: {
    menuMap: Record<string, string>;
    formMap: Record<string, string>;
    assetMap: Record<string, string>;
  }) => void;
}) {
  const menus = snapshotLike.menus || {};
  const forms = snapshotLike.forms || {};
  const assets = snapshotLike.assets || {};

  const missing: MissingRefs = useMemo(() => {
    if (!template) return { menus: [], forms: [], assets: [] };

    const out: MissingRefs = { menus: [], forms: [], assets: [] };
    const blocks = template.section?.blocks || [];
    const sectionStyle = template.section?.style || {};

    // block refs
    for (const b of blocks) {
      const menuId = b.props?.menuId;
      if (menuId && !menus[menuId])
        out.menus.push({ blockId: b.id, old: menuId });

      const formId = b.props?.formId;
      if (formId && !forms[formId])
        out.forms.push({ blockId: b.id, old: formId });

      const imageAssetId = b.props?.imageAssetId;
      if (imageAssetId && !assets[imageAssetId])
        out.assets.push({
          where: `block:${b.id}:props.imageAssetId`,
          old: imageAssetId,
        });

      const logoAssetId = b.props?.logoAssetId;
      if (logoAssetId && !assets[logoAssetId])
        out.assets.push({
          where: `block:${b.id}:props.logoAssetId`,
          old: logoAssetId,
        });

      const bgA = b.style?.overrides?.bg?.imageAssetId;
      if (bgA && !assets[bgA])
        out.assets.push({
          where: `block:${b.id}:style.overrides.bg.imageAssetId`,
          old: bgA,
        });

      const bgT = b.style?.responsive?.tablet?.bg?.imageAssetId;
      if (bgT && !assets[bgT])
        out.assets.push({
          where: `block:${b.id}:style.responsive.tablet.bg.imageAssetId`,
          old: bgT,
        });

      const bgM = b.style?.responsive?.mobile?.bg?.imageAssetId;
      if (bgM && !assets[bgM])
        out.assets.push({
          where: `block:${b.id}:style.responsive.mobile.bg.imageAssetId`,
          old: bgM,
        });
    }

    // section style refs
    const sBgA = sectionStyle?.overrides?.bg?.imageAssetId;
    if (sBgA && !assets[sBgA])
      out.assets.push({
        where: `section:style.overrides.bg.imageAssetId`,
        old: sBgA,
      });

    const sBgT = sectionStyle?.responsive?.tablet?.bg?.imageAssetId;
    if (sBgT && !assets[sBgT])
      out.assets.push({
        where: `section:style.responsive.tablet.bg.imageAssetId`,
        old: sBgT,
      });

    const sBgM = sectionStyle?.responsive?.mobile?.bg?.imageAssetId;
    if (sBgM && !assets[sBgM])
      out.assets.push({
        where: `section:style.responsive.mobile.bg.imageAssetId`,
        old: sBgM,
      });

    // de-dupe assets by (where, old)
    const seen = new Set<string>();
    out.assets = out.assets.filter((x) => {
      const k = `${x.where}:${x.old}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return out;
  }, [template, menus, forms, assets]);

  const menuOptions = Object.keys(menus);
  const formOptions = Object.keys(forms);
  const assetOptions = Object.keys(assets);

  const [menuMap, setMenuMap] = useState<Record<string, string>>({});
  const [formMap, setFormMap] = useState<Record<string, string>>({});
  const [assetMap, setAssetMap] = useState<Record<string, string>>({});

  if (!open || !template) return null;

  const hasIssues =
    missing.menus.length || missing.forms.length || missing.assets.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Insert Template</div>
            <div className="text-xs opacity-70">
              {template.name} ·{" "}
              {template.scope === "tenant" ? "Tenant-wide" : "Site"}
            </div>
          </div>
          <button
            className="border rounded px-3 py-1 text-sm"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {!hasIssues ? (
          <div className="border rounded p-3 text-sm bg-green-50">
            No missing references detected. Safe to insert.
          </div>
        ) : (
          <div className="border rounded p-3 text-sm bg-yellow-50">
            This template references menus/forms/assets that don’t exist on this
            site. Map them below.
          </div>
        )}

        {/* Menus */}
        {missing.menus.length ? (
          <div className="border rounded p-3 space-y-2">
            <div className="font-medium text-sm">Missing Menus</div>
            {missing.menus.map((m, idx) => (
              <div
                key={`${m.blockId}:${m.old}:${idx}`}
                className="grid grid-cols-[1fr_1fr] gap-2 items-center"
              >
                <div className="text-xs opacity-70">
                  Block <b>{m.blockId}</b> wants <b>{m.old}</b>
                </div>
                <select
                  className="border rounded p-2 text-sm"
                  value={menuMap[m.old] ?? ""}
                  onChange={(e) =>
                    setMenuMap((prev) => ({ ...prev, [m.old]: e.target.value }))
                  }
                >
                  <option value="">(choose menu)</option>
                  {menuOptions.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        {/* Forms */}
        {missing.forms.length ? (
          <div className="border rounded p-3 space-y-2">
            <div className="font-medium text-sm">Missing Forms</div>
            {missing.forms.map((f, idx) => (
              <div
                key={`${f.blockId}:${f.old}:${idx}`}
                className="grid grid-cols-[1fr_1fr] gap-2 items-center"
              >
                <div className="text-xs opacity-70">
                  Block <b>{f.blockId}</b> wants <b>{f.old}</b>
                </div>
                <select
                  className="border rounded p-2 text-sm"
                  value={formMap[f.old] ?? ""}
                  onChange={(e) =>
                    setFormMap((prev) => ({ ...prev, [f.old]: e.target.value }))
                  }
                >
                  <option value="">(choose form)</option>
                  {formOptions.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        {/* Assets */}
        {missing.assets.length ? (
          <div className="border rounded p-3 space-y-2">
            <div className="font-medium text-sm">Missing Assets</div>
            <div className="text-xs opacity-70">
              Choose a replacement asset, or “(clear)” to remove the reference.
            </div>
            {missing.assets.map((a, idx) => (
              <div
                key={`${a.where}:${a.old}:${idx}`}
                className="grid grid-cols-[1fr_1fr] gap-2 items-center"
              >
                <div className="text-xs opacity-70">
                  <b>{a.where}</b> wants <b>{a.old}</b>
                </div>
                <select
                  className="border rounded p-2 text-sm"
                  value={assetMap[a.old] ?? "__clear__"}
                  onChange={(e) =>
                    setAssetMap((prev) => ({
                      ...prev,
                      [a.old]: e.target.value,
                    }))
                  }
                >
                  <option value="__clear__">(clear)</option>
                  {assetOptions.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            className="border rounded px-3 py-2 text-sm"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-black text-white rounded px-3 py-2 text-sm"
            type="button"
            onClick={() => onConfirm({ menuMap, formMap, assetMap })}
          >
            Insert Section
          </button>
        </div>
      </div>
    </div>
  );
}
