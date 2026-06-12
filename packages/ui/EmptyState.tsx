import * as React from "react";
import { cn } from "./cn";

export interface EmptyStateProps {
  /** Optional leading icon/illustration. */
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** Primary call-to-action (usually a Button). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Friendly empty/zero state. Use whenever a list, table, or panel has no data
 * yet — gives the user a clear next step instead of a blank screen.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "px-6 py-12 gap-3",
        className,
      )}
    >
      {icon && (
        <div className="text-muted [&>svg]:h-8 [&>svg]:w-8" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && (
          <p className="text-sm text-muted max-w-sm mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
