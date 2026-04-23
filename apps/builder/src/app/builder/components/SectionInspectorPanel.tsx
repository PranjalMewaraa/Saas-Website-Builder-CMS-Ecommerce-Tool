"use client";

import StyleEditor from "./StyleEditor";

type Breakpoint = "desktop" | "tablet" | "mobile";

export default function SectionInspectorPanel({
  siteId,
  snapshotLike,
  section,
  breakpoint,
  onChangeSection,
  onChangeBreakpoint,
}: {
  siteId: string;
  snapshotLike: any;
  section: any;
  breakpoint: Breakpoint;
  onChangeSection: (nextSection: any) => void;
  onChangeBreakpoint: (bp: Breakpoint) => void;
}) {
  if (!section)
    return <div className="opacity-70 text-sm">Select a section</div>;

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold">Section</div>
        <div className="text-xs opacity-60">{section.label || section.id}</div>
      </div>

      <div className="flex gap-2">
        <button
          className={`border rounded px-2 py-1 text-xs ${breakpoint === "desktop" ? "bg-black text-white" : ""}`}
          onClick={() => onChangeBreakpoint("desktop")}
          type="button"
        >
          Desktop
        </button>
        <button
          className={`border rounded px-2 py-1 text-xs ${breakpoint === "tablet" ? "bg-black text-white" : ""}`}
          onClick={() => onChangeBreakpoint("tablet")}
          type="button"
        >
          Tablet
        </button>
        <button
          className={`border rounded px-2 py-1 text-xs ${breakpoint === "mobile" ? "bg-black text-white" : ""}`}
          onClick={() => onChangeBreakpoint("mobile")}
          type="button"
        >
          Mobile
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Section Style</div>
        <StyleEditor
          siteId={siteId}
          snapshotLike={snapshotLike}
          // StyleEditor expects { style }, so we pass a fake object
          block={{ style: section.style ?? {} }}
          breakpoint={breakpoint}
          onChange={(nextStyle: any) =>
            onChangeSection({ ...section, style: nextStyle })
          }
        />
      </div>
    </div>
  );
}
