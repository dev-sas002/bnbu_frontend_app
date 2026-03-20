import React from 'react';
import { cn } from './cn';

export interface FilterBarProps {
  onSubmit: () => void;
  onReset?: () => void;
  /** Rendered under the controls when a filter combination is invalid. */
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

/**
 * The shell shared by the three search bars.
 *
 * It is a `<form>` so Enter submits — every one of these used to be a `<div>`
 * whose only trigger was clicking the Search button.
 */
const FilterBar: React.FC<FilterBarProps> = ({
  onSubmit,
  onReset,
  error,
  children,
  className,
}) => (
  <form
    role="search"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    onReset={(event) => {
      event.preventDefault();
      onReset?.();
    }}
    className={cn('rounded-lg border border-line bg-surface p-3 shadow-card', className)}
  >
    <div className="flex flex-wrap items-end gap-3">{children}</div>
    {error && (
      <p role="alert" className="mt-2 text-xs text-negative-fg">
        {error}
      </p>
    )}
  </form>
);

export default FilterBar;
