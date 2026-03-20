import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Removes the internal padding, for cards whose child is a full-bleed table. */
  flush?: boolean;
}

/** A raised panel. The product's only container treatment. */
export const Card: React.FC<CardProps> = ({ flush = false, className, children, ...rest }) => (
  <div
    className={cn(
      'rounded-lg border border-line bg-surface shadow-card',
      !flush && 'p-5',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export interface CardHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, actions, className }) => (
  <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
    <div className="min-w-0">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-ink-subtle">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export default Card;
