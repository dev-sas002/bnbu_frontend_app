import React from 'react';
import { cn } from './cn';
import { Skeleton } from './feedback';

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  /** One short clause of context — never a second headline number. */
  caption?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * A single headline figure.
 *
 * Deliberately not a chart: a count or a median is one number, and a number
 * set in large type is read faster than any plot of it.
 */
const StatTile: React.FC<StatTileProps> = ({ label, value, caption, loading, className }) => (
  <div className={cn('rounded-lg border border-line bg-surface p-4 shadow-card', className)}>
    <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
    {loading ? (
      <Skeleton className="mt-2 h-7 w-24" />
    ) : (
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    )}
    {caption && <p className="mt-1 text-xs text-ink-subtle">{caption}</p>}
  </div>
);

export default StatTile;
