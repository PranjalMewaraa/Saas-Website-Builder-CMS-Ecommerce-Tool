import * as React from "react";
import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Loading placeholder. Respects prefers-reduced-motion (pulse disabled via the
 * global motion reset in globals.css). Give it width/height via className.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-control bg-line/70", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
