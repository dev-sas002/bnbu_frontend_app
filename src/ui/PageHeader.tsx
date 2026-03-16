import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

export interface Crumb {
  name: string;
  path?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}

/**
 * The top of every page: breadcrumb trail, title, optional one-line
 * description, and the page's primary actions on the right.
 *
 * Replaces a block of flex classes that was pasted into seven pages with
 * small, accidental differences in spacing.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => (
  <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
    <div className="min-w-0">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1.5">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-subtle">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.name}-${index}`} className="flex items-center gap-1">
                  {crumb.path && !isLast ? (
                    <Link to={crumb.path} className="rounded hover:text-ink hover:underline">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className={cn(isLast && 'font-medium text-ink-muted')} aria-current={isLast ? 'page' : undefined}>
                      {crumb.name}
                    </span>
                  )}
                  {!isLast && (
                    <span aria-hidden="true" className="text-line-strong">
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-ink-subtle">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
