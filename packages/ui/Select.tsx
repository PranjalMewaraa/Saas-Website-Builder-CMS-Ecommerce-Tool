import * as React from "react";
import { cn } from "./cn";
import { Field, fieldAria, controlClass } from "./Field";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
  fieldClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      required,
      hint,
      error,
      id,
      className,
      fieldClassName,
      children,
      ...props
    },
    ref,
  ) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <Field
        htmlFor={inputId}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={fieldClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            required={required}
            className={cn(
              controlClass(!!error),
              "h-10 appearance-none pr-9 cursor-pointer",
              className,
            )}
            {...fieldAria(inputId, hint, error)}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Field>
    );
  },
);
