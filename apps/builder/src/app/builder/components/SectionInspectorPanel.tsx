"use client";

import { Button } from "@acme/ui";
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
    return <div className="text-muted text-sm">Select a section</div>;

  const breakpoints: Breakpoint[] = ["desktop", "tablet", "mobile"];

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold">Section</div>
        <div className="text-xs text-muted">{section.label || section.id}</div>
      </div>

      <div
        className="flex gap-1.5"
        role="group"
        aria-label="Preview breakpoint"
      >
        {breakpoints.map((bp) => (
          <Button
            key={bp}
            variant={breakpoint === bp ? "accent" : "secondary"}
            size="sm"
            aria-pressed={breakpoint === bp}
            onClick={() => onChangeBreakpoint(bp)}
          >
            {bp.charAt(0).toUpperCase() + bp.slice(1)}
          </Button>
        ))}
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
