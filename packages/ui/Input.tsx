import * as React from "react";
import { cn } from "./cn";
import { Field, fieldAria, controlClass } from "./Field";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** Optional explicit id; auto-generated otherwise. */
  id?: string;
  fieldClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, required, hint, error, id, className, fieldClassName, ...props },
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
        <input
          ref={ref}
          required={required}
          className={cn(controlClass(!!error), "h-10", className)}
          {...fieldAria(inputId, hint, error)}
          {...props}
        />
      </Field>
    );
  },
);
