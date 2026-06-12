import * as React from "react";
import { cn } from "./cn";

export interface FieldProps {
  /** The input's id — wired to the label's htmlFor and error/hint aria. */
  htmlFor: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Accessible field wrapper: always renders a real <label>, marks required
 * fields, and shows hint/error text linked via aria-describedby. Every form
 * control in the product should be wrapped by this (or a component that uses it).
 */
export function Field({
  htmlFor,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-ink flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared describedby/invalid props for controls rendered inside a Field. */
export function fieldAria(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    "aria-describedby": ids || undefined,
    "aria-invalid": error ? (true as const) : undefined,
  };
}

export const controlClass = (error?: boolean) =>
  cn(
    "w-full rounded-control border bg-surface text-ink placeholder:text-muted/70",
    "px-3 text-sm transition-colors",
    "focus:outline-none focus:border-accent",
    "disabled:opacity-50 disabled:bg-canvas",
    error ? "border-danger" : "border-line hover:border-muted/40",
  );
