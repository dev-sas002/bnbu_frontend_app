import React, { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from './cn';
import { EmptyState, ErrorState, TableSkeleton } from './feedback';

/**
 * One column, described rather than hand-written.
 *
 * Every table in the app used to be its own component with its own copy of
 * the header loop, the sort state machine, the "nothing here" row and the
 * hover styling. Describing a table as data means a new one is a `Column[]`,
 * and it means sorting, windowing and the empty state are fixed in one place.
 */
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  /**
   * Returning a value makes the column sortable. Returning a number sorts
   * numerically — which matters here, because several money fields arrive
   * from Django as decimal *strings*.
   */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: 'left' | 'right' | 'center';
  /** Extra classes for both the header cell and the body cells. */
  className?: string;
  /** Hide below the `md` breakpoint, for columns that are nice-to-have. */
  secondary?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  /** Accessible description of the table's contents. */
  caption?: string;
  /**
   * Above this many rows the body is windowed. 150 is comfortably past the
   * largest page the API serves (100), so the common case renders plainly and
   * the guard only engages for an unusually large `page_size`.
   */
  virtualizeAfter?: number;
  rowHeight?: number;
  maxBodyHeight?: number;
  className?: string;
}

const ALIGNMENT: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right tabular-nums',
  center: 'text-center',
};

/** Rows rendered above and below the viewport, to hide fast scrolling. */
const OVERSCAN = 6;

type SortValue = string | number | null | undefined;

const isMissing = (value: SortValue): boolean => value === null || value === undefined;

const compare = (a: SortValue, b: SortValue): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
};

function DataTableInner<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  error = false,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  caption,
  virtualizeAfter = 150,
  rowHeight = 48,
  maxBodyHeight = 640,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const safeRows = useMemo(() => rows ?? [], [rows]);

  const handleSort = useCallback(
    (key: string) => {
      setSortKey((currentKey) => {
        if (currentKey !== key) {
          setSortDirection('asc');
          return key;
        }
        // asc -> desc -> back to the API's own ordering.
        setSortDirection((current) =>
          current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc'
        );
        return key;
      });
    },
    []
  );

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDirection) return safeRows;
    const column = columns.find((candidate) => candidate.key === sortKey);
    if (!column?.sortValue) return safeRows;
    const accessor = column.sortValue;

    // Sorting a page is at most `page_size` rows, but it runs on every
    // render without this memo — including every poll tick on the analyzer.
    return [...safeRows].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);

      // Rows with no value sort to the bottom in *both* directions. Flipping
      // them with the rest would put "not priced yet" above every real figure
      // as soon as the user sorted descending.
      if (isMissing(left) || isMissing(right)) {
        if (isMissing(left) && isMissing(right)) return 0;
        return isMissing(left) ? 1 : -1;
      }

      const result = compare(left, right);
      return sortDirection === 'asc' ? result : -result;
    });
  }, [safeRows, columns, sortKey, sortDirection]);

  const virtualized = sortedRows.length > virtualizeAfter;

  const { visibleRows, offsetBefore, offsetAfter } = useMemo(() => {
    if (!virtualized) {
      return { visibleRows: sortedRows, offsetBefore: 0, offsetAfter: 0 };
    }
    const first = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
    const last = Math.min(
      sortedRows.length,
      Math.ceil((scrollTop + maxBodyHeight) / rowHeight) + OVERSCAN
    );
    return {
      visibleRows: sortedRows.slice(first, last),
      offsetBefore: first * rowHeight,
      offsetAfter: (sortedRows.length - last) * rowHeight,
    };
  }, [virtualized, sortedRows, scrollTop, rowHeight, maxBodyHeight]);

  const handleScroll = useCallback(() => {
    if (!virtualized) return;
    setScrollTop(scrollRef.current?.scrollTop ?? 0);
  }, [virtualized]);

  if (error) {
    return (
      <div className={cn('rounded-lg border border-line bg-surface', className)}>
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <div className={cn('rounded-lg border border-line bg-surface', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto"
        style={virtualized ? { maxHeight: maxBodyHeight, overflowY: 'auto' } : undefined}
      >
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-10 bg-surface-sunken">
            <tr>
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sortKey === column.key && sortDirection;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    className={cn(
                      'border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle',
                      ALIGNMENT[column.align ?? 'left'],
                      column.secondary && 'hidden md:table-cell',
                      column.className
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded transition-colors hover:text-ink',
                          active && 'text-ink'
                        )}
                      >
                        {column.header}
                        <span aria-hidden="true" className="text-[0.65rem] leading-none">
                          {active ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {offsetBefore > 0 && (
              <tr aria-hidden="true" style={{ height: offsetBefore }}>
                <td colSpan={columns.length} />
              </tr>
            )}
            {visibleRows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                style={virtualized ? { height: rowHeight } : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-sunken focus:bg-surface-sunken'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-ink-muted',
                      ALIGNMENT[column.align ?? 'left'],
                      column.secondary && 'hidden md:table-cell',
                      column.className
                    )}
                  >
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
            {offsetAfter > 0 && (
              <tr aria-hidden="true" style={{ height: offsetAfter }}>
                <td colSpan={columns.length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * `React.memo` with a generic component loses the type parameter, so the cast
 * puts it back. Worth it: the analyzer re-renders on every 5s progress tick,
 * and without this the whole table reconciles each time.
 */
const DataTable = React.memo(DataTableInner) as typeof DataTableInner;

export default DataTable;
