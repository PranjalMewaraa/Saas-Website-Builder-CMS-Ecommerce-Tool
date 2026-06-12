import * as React from "react";
import { cn } from "./cn";

type Tone = "neutral" | "accent" | "draft" | "danger" | "live";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas text-muted border-line",
  accent: "bg-accent-soft text-accent border-transparent",
  draft: "bg-draft-soft text-draft border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  live: "bg-accent-soft text-accent border-transparent",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Renders a leading status dot. Pairs with status tones (live/draft). */
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
