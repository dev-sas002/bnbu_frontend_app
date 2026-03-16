import React from 'react';
import { cn } from './cn';

/**
 * The wiring behind `Field`.
 *
 * It lives apart from the components so `Field.tsx` exports components only —
 * which is what `react-refresh/only-export-components` asks for, and what
 * keeps hot reload from dropping form state on every edit.
 */

export interface FieldContextValue {
  controlId: string;
  describedBy?: string;
  invalid: boolean;
}

export const FieldContext = React.createContext<FieldContextValue | null>(null);

export const CONTROL_BASE =
  'block w-full rounded-md border bg-surface px-3 py-2 text-base text-ink transition-colors ' +
  'placeholder:text-ink-subtle disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-subtle';

export const controlTone = (invalid?: boolean): string =>
  invalid
    ? 'border-negative-line focus:border-negative-fg'
    : 'border-line hover:border-line-strong focus:border-brand-500';

/** Styling for a bare control that is not one of the `Field` primitives. */
export const controlClassName = cn(CONTROL_BASE, controlTone(false));

/**
 * Lets a third-party control (the date picker) adopt the id its enclosing
 * `Field` generated, so the field's label points at something real.
 */
export const useFieldControlId = (): string | undefined =>
  React.useContext(FieldContext)?.controlId;

/** id / aria-describedby / aria-invalid for a control inside a `Field`. */
export const useFieldWiring = (invalidProp?: boolean) => {
  const context = React.useContext(FieldContext);
  return {
    id: context?.controlId,
    'aria-describedby': context?.describedBy,
    'aria-invalid': (invalidProp ?? context?.invalid) || undefined,
    invalid: invalidProp ?? context?.invalid ?? false,
  };
};
