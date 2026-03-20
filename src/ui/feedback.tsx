import React from 'react';
import { cn } from './cn';
import Button from './Button';

/**
 * The three states every data surface in this app has to render: loading,
 * empty, and failed. They were previously spelled out ad hoc on each page
 * ("Loading...", "Error loading leases") with no visual weight at all.
 */

export const Spinner: React.FC<{ className?: string; label?: string }> = ({ className, label }) => (
  <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-brand-500"
    />
    {label && <span className="text-sm text-ink-subtle">{label}</span>}
    {!label && <span className="sr-only">Loading</span>}
  </span>
);

/** A shimmering placeholder block, sized by the caller. */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'relative block overflow-hidden rounded bg-surface-accent',
      'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
      'after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent',
      className
    )}
  />
);

export interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

/**
 * Keeps the table's own chrome on screen while the first page loads, so the
 * layout does not jump when data arrives.
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 6, columns }) => (
  <div className="divide-y divide-line">
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton
            key={colIndex}
            className={cn('h-3.5 flex-1', colIndex === 0 && 'max-w-[3rem]')}
          />
        ))}
      </div>
    ))}
  </div>
);

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    <div
      aria-hidden="true"
      className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-accent text-ink-subtle"
    >
      {icon ?? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
    </div>
    <p className="text-base font-medium text-ink">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-ink-subtle">{description}</p>}
    {action && (
      <Button className="mt-4" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'The request did not complete. This is usually the API being unreachable.',
  onRetry,
  className,
}) => (
  <div
    role="alert"
    className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
  >
    <div
      aria-hidden="true"
      className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-negative-bg text-negative-fg"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.6 13.16A1.5 1.5 0 004.04 19.5h15.92a1.5 1.5 0 001.3-2.4l-7.6-13.16a1.5 1.5 0 00-2.6 0z"
        />
      </svg>
    </div>
    <p className="text-base font-medium text-ink">{title}</p>
    <p className="mt-1 max-w-sm text-sm text-ink-subtle">{description}</p>
    {onRetry && (
      <Button className="mt-4" size="sm" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
