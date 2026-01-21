"use client";

import React from "react";
import { computeFinalStyle } from "@acme/renderer/style-merge";
import { resolveWrapperStyle } from "@acme/renderer/style-resolver";

export default function SectionTemplatePreview({
  template,
  snapshotLike,
}: {
  template: any;
  snapshotLike: any;
}) {
  const sec = template.section || { blocks: [] };

  const sectionFinalStyle = computeFinalStyle({
    style: sec.style,
    presets: snapshotLike.stylePresets,
    assets: snapshotLike.assets,
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(sectionFinalStyle);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={outerClass} style={outerStyle}>
        <div
          className={`${innerClass} __section-inner`}
          style={{ ...innerStyle, padding: 8 }}
        >
          <div className="space-y-2">
            {(sec.blocks || []).slice(0, 3).map((b: any) => (
              <PreviewBlock key={b.id} block={b} snapshot={snapshotLike} />
            ))}

            {(sec.blocks || []).length > 3 ? (
              <div className="text-[10px] opacity-60">
                + {(sec.blocks || []).length - 3} more…
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ block, snapshot }: { block: any; snapshot: any }) {
  const finalStyle = computeFinalStyle({
    style: block.style,
    presets: snapshot.stylePresets,
    assets: snapshot.assets,
  });

  const { outerClass, innerClass, outerStyle, innerStyle } =
    resolveWrapperStyle(finalStyle);

  return (
    <div className={outerClass} style={outerStyle}>
      <div
        className={`${innerClass} __inner`}
        style={{ ...innerStyle, padding: 8 }}
      >
        <div className="text-[11px] font-semibold">{block.type}</div>
        <div className="text-[10px] opacity-60 truncate">{block.id}</div>
      </div>
    </div>
  );
}
