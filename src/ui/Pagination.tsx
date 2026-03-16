import React from 'react';
import Button from './Button';
import { Select } from './Field';
import { cn } from './cn';

export interface PaginationProps {
  page: number;
  onPageChange: (page: number) => void;
  /** DRF gives a `next` URL rather than a page count. */
  hasNext: boolean;
  /** Total row count, when the endpoint reports one. */
  count?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

/**
 * Pagination for DRF pages.
 *
 * The API returns `next`/`previous` URLs and a `count` but no page total, so
 * the control shows a range ("11–20 of 57") rather than pretending to know how
 * many pages there are.
 */
const Pagination: React.FC<PaginationProps> = ({
  page,
  onPageChange,
  hasNext,
  count,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  disabled = false,
  className,
}) => {
  const from = pageSize ? (page - 1) * pageSize + 1 : null;
  const to = pageSize && count !== undefined ? Math.min(page * pageSize, count) : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3',
        className
      )}
    >
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={disabled || page === 1}
      >
        Previous
      </Button>

      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-subtle">
        {onPageSizeChange && pageSize !== undefined && (
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select
              className="h-8 w-20 py-1"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={disabled}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        )}
        <span className="tabular-nums">
          {count !== undefined && from !== null && to !== null
            ? `${count === 0 ? 0 : from}–${to} of ${count}`
            : `Page ${page}`}
        </span>
      </div>

      <Button
        size="sm"
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || !hasNext}
      >
        Next
      </Button>
    </nav>
  );
};

export default Pagination;
