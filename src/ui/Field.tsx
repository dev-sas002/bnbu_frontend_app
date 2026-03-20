import React, { useId } from 'react';
import { cn } from './cn';
import { CONTROL_BASE, FieldContext, controlTone, useFieldWiring } from './fieldContext';

/**
 * Form primitives.
 *
 * The point of `Field` is that label/control/error/description wiring
 * (`htmlFor`, `aria-describedby`, `aria-invalid`) happens once here. Before
 * this existed, roughly half the inputs in the app were bare `<input>` tags
 * with a placeholder standing in for a label.
 */

export interface FieldProps {
  label: React.ReactNode;
  /** Renders the required marker on the label. */
  required?: boolean;
  /** Helper copy shown under the control when there is no error. */
  hint?: React.ReactNode;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  required,
  hint,
  error,
  className,
  children,
}) => {
  const controlId = useId();
  const messageId = `${controlId}-message`;
  const invalid = Boolean(error);

  return (
    <FieldContext.Provider
      value={{ controlId, describedBy: error || hint ? messageId : undefined, invalid }}
    >
      <div className={cn('space-y-1.5', className)}>
        <label htmlFor={controlId} className="block text-sm font-medium text-ink-muted">
          {label}
          {required && (
            <span className="ml-0.5 text-brand-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {children}
        {(error || hint) && (
          <p
            id={messageId}
            className={cn('text-xs', error ? 'text-negative-fg' : 'text-ink-subtle')}
            role={error ? 'alert' : undefined}
          >
            {error || hint}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest },
  ref
) {
  const { invalid: isInvalid, ...wiring } = useFieldWiring(invalid);
  return (
    <input
      ref={ref}
      {...wiring}
      {...rest}
      id={rest.id ?? wiring.id}
      className={cn(CONTROL_BASE, controlTone(isInvalid), className)}
    />
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref
) {
  const { invalid: isInvalid, ...wiring } = useFieldWiring(invalid);
  return (
    <div className="relative">
      <select
        ref={ref}
        {...wiring}
        {...rest}
        id={rest.id ?? wiring.id}
        className={cn(CONTROL_BASE, controlTone(isInvalid), 'appearance-none pr-9', className)}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
});
