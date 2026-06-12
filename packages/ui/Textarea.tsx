import * as React from "react";
import { cn } from "./cn";
import { Field, fieldAria, controlClass } from "./Field";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
  fieldClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      required,
      hint,
      error,
      id,
      className,
      fieldClassName,
      rows = 4,
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
        <textarea
          ref={ref}
          rows={rows}
          required={required}
          className={cn(controlClass(!!error), "py-2 resize-y", className)}
          {...fieldAria(inputId, hint, error)}
          {...props}
        />
      </Field>
    );
  },
);
