import React, { useMemo, useState } from 'react';
import { formatCurrency, formatNumber, formatOccupancy } from '@/lib/format';
import type { RentalProperty } from '@/types/rentalTypes';
import { Column, DataTable, RENTAL_STATUSES, StatusBadge, cn } from '@/ui';
import RentalDetailsModal from './RentalDetailsModal';

interface RentalTableProps {
  rentals: RentalProperty[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onUpload?: () => void;
  filtered?: boolean;
}

/**
 * The priced-listings table.
 *
 * Sorting is delegated to `DataTable`, which compares the value a column
 * *declares* rather than whatever happens to be in the cell. That matters
 * here: Django serialises `DecimalField`s as strings, so profit and ADR
 * arrived as `"1850.00"`, and the old table's `typeof === 'number'` check fell
 * through to a lexicographic compare — `"900.00"` sorted above `"1850.00"`.
 * The data layer now parses them, and these accessors are typed as numbers.
 */
const RentalTable: React.FC<RentalTableProps> = ({
  rentals,
  loading,
  error,
  onRetry,
  onUpload,
  filtered = false,
}) => {
  const [selected, setSelected] = useState<RentalProperty | null>(null);

  const columns = useMemo<Array<Column<RentalProperty>>>(
    () => [
      {
        key: 'created_at_formatted',
        header: 'Date',
        sortValue: (rental) => rental.created_at ?? rental.created_at_formatted ?? null,
        render: (rental) => rental.created_at_formatted ?? '—',
      },
      {
        key: 'location',
        header: 'Location',
        sortValue: (rental) => rental.location ?? null,
        render: (rental) => (
          <span className="font-medium text-ink">{rental.location ?? '—'}</span>
        ),
      },
      {
        key: 'rent',
        header: 'Rent',
        align: 'right',
        sortValue: (rental) => rental.rent ?? null,
        render: (rental) => formatCurrency(rental.rent),
      },
      {
        key: 'no_of_bedrooms',
        header: 'Bedrooms',
        align: 'right',
        secondary: true,
        sortValue: (rental) => rental.no_of_bedrooms ?? null,
        render: (rental) => formatNumber(rental.no_of_bedrooms),
      },
      {
        key: 'adr',
        header: 'ADR',
        align: 'right',
        secondary: true,
        sortValue: (rental) => rental.adr ?? null,
        render: (rental) => formatCurrency(rental.adr),
      },
      {
        key: 'occupancy_rate',
        header: 'Occupancy',
        align: 'right',
        secondary: true,
        sortValue: (rental) => rental.occupancy_rate ?? null,
        render: (rental) => formatOccupancy(rental.occupancy_rate),
      },
      {
        key: 'monthly_estimated_profit',
        header: 'Estimated profit',
        align: 'right',
        sortValue: (rental) => rental.monthly_estimated_profit ?? null,
        render: (rental) => {
          const profit = rental.monthly_estimated_profit;
          return (
            <span
              className={cn(
                'font-medium',
                profit === null || profit === undefined
                  ? 'text-ink-subtle'
                  : profit < 0
                    ? 'text-negative-fg'
                    : 'text-ink'
              )}
            >
              {formatCurrency(profit)}
            </span>
          );
        },
      },
      {
        key: 'property_zillow_link',
        header: 'Link',
        render: (rental) => (
          <a
            href={rental.property_zillow_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded font-medium text-brand-700 underline underline-offset-2"
          >
            Listing
          </a>
        ),
      },
      {
        key: 'property_status',
        header: 'Status',
        sortValue: (rental) => rental.property_status,
        render: (rental) => (
          <StatusBadge vocabulary={RENTAL_STATUSES} value={rental.property_status} />
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        caption="Priced rental properties"
        columns={columns}
        rows={rentals}
        rowKey={(rental, index) => rental.id ?? `${rental.batch_id}-${index}`}
        onRowClick={setSelected}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No rental properties available"
        emptyDescription={
          filtered
            ? 'No listings in this batch match those filters.'
            : 'Upload a spreadsheet of listings and each row is priced against market ADR and occupancy.'
        }
        emptyAction={
          !filtered && onUpload ? { label: 'Upload listings', onClick: onUpload } : undefined
        }
      />
      <RentalDetailsModal rental={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default RentalTable;
