import React from 'react';
import { EMPTY, formatCurrency, formatNumber, formatOccupancy } from '@/lib/format';
import type { RentalProperty } from '@/types/rentalTypes';
import { Modal, RENTAL_STATUSES, StatusBadge } from '@/ui';

interface RentalDetailsModalProps {
  rental: RentalProperty | null;
  onClose: () => void;
}

interface DetailGroup {
  heading: string;
  rows: Array<{ label: string; value: React.ReactNode }>;
}

/**
 * Everything the backend knows about one listing.
 *
 * Grouped rather than listed flat: the previous version rendered fourteen
 * label/value pairs in one column, so the figures that matter for a decision
 * sat between the ZIP code and a link.
 */
const RentalDetailsModal: React.FC<RentalDetailsModalProps> = ({ rental, onClose }) => {
  if (!rental) return null;

  const groups: DetailGroup[] = [
    {
      heading: 'Property',
      rows: [
        { label: 'Location', value: rental.location ?? EMPTY },
        { label: 'Bedrooms', value: formatNumber(rental.no_of_bedrooms) },
        { label: 'Bathrooms', value: formatNumber(rental.no_of_bathrooms) },
        {
          label: 'Square feet',
          value: rental.square_feet ? `${formatNumber(rental.square_feet)} sq ft` : EMPTY,
        },
        {
          label: 'Listing',
          value: (
            <a
              href={rental.property_zillow_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-medium text-brand-700 underline underline-offset-2"
            >
              Open on Zillow
            </a>
          ),
        },
      ],
    },
    {
      heading: 'Costs',
      rows: [
        { label: 'Monthly rent', value: formatCurrency(rental.rent) },
        { label: 'Utilities', value: formatCurrency(rental.utilities, { precise: true }) },
        { label: 'Yearly rent + utilities', value: formatCurrency(rental.yearly_rent_cost_util) },
      ],
    },
    {
      heading: 'Projection',
      rows: [
        { label: 'Average daily rate', value: formatCurrency(rental.adr, { precise: true }) },
        { label: 'Occupancy', value: formatOccupancy(rental.occupancy_rate) },
        { label: 'Yearly revenue', value: formatCurrency(rental.yearly_projected_revenue) },
        {
          label: 'Monthly profit',
          value: (
            <span
              className={
                (rental.monthly_estimated_profit ?? 0) < 0
                  ? 'font-semibold text-negative-fg'
                  : 'font-semibold text-ink'
              }
            >
              {formatCurrency(rental.monthly_estimated_profit, { precise: true })}
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={rental.location ?? 'Rental property'}
      description={`Batch ${rental.batch_id} · added ${rental.created_at_formatted ?? 'recently'}`}
      footer={<StatusBadge vocabulary={RENTAL_STATUSES} value={rental.property_status} />}
    >
      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.heading}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              {group.heading}
            </h3>
            <dl className="rounded-md border border-line">
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-line px-3 py-2.5 last:border-0"
                >
                  <dt className="text-sm text-ink-subtle">{row.label}</dt>
                  <dd className="text-right text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  );
};

export default RentalDetailsModal;
