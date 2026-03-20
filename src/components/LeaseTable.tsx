import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/format';
import type { Lease } from '@/types/leaseTypes';
import { Button, Column, DataTable, LEASE_STATUSES, StatusBadge } from '@/ui';
import { PencilIcon } from '@/ui/icons';

interface LeaseTableProps {
  leases: Lease[];
  onEdit: (lease: Lease) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onUpload?: () => void;
  /** True when a filter is in force, so the empty state can say so. */
  filtered?: boolean;
}

/**
 * The lease list, expressed as columns.
 *
 * The old version owned two modals, their open/close state and the selected
 * lease, on top of rendering rows — so opening the edit dialog re-rendered
 * every row. The dialogs now live with the page that owns the mutations.
 */
const LeaseTable: React.FC<LeaseTableProps> = ({
  leases,
  onEdit,
  loading,
  error,
  onRetry,
  onUpload,
  filtered = false,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<Array<Column<Lease>>>(
    () => [
      {
        key: 'date',
        header: 'Date',
        sortValue: (lease) => lease.date,
        render: (lease) => formatDate(lease.date),
      },
      {
        key: 'address',
        header: 'Address',
        sortValue: (lease) => `${lease.address1 ?? ''}`,
        render: (lease) => (
          <span className="font-medium text-ink">
            {[lease.address1, lease.address2].filter(Boolean).join(', ')}
          </span>
        ),
      },
      {
        key: 'city',
        header: 'City',
        sortValue: (lease) => lease.city,
        render: (lease) => lease.city,
      },
      {
        key: 'state',
        header: 'State',
        secondary: true,
        sortValue: (lease) => lease.state,
        render: (lease) => lease.state,
      },
      {
        key: 'zip_code',
        header: 'ZIP',
        secondary: true,
        sortValue: (lease) => lease.zip_code,
        render: (lease) => lease.zip_code,
      },
      {
        key: 'num_of_docs',
        header: 'Docs',
        align: 'right',
        sortValue: (lease) => lease.num_of_docs,
        render: (lease) => lease.num_of_docs,
      },
      {
        key: 'status',
        header: 'Status',
        sortValue: (lease) => lease.status,
        render: (lease) => <StatusBadge vocabulary={LEASE_STATUSES} value={lease.status} />,
      },
      {
        key: 'actions',
        header: 'Edit',
        align: 'right',
        render: (lease) => (
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Edit the lease at ${lease.address1}`}
            onClick={(event) => {
              // The row itself navigates to the detail page.
              event.stopPropagation();
              onEdit(lease);
            }}
            icon={<PencilIcon className="h-4 w-4" />}
          />
        ),
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      caption="Leases"
      columns={columns}
      rows={leases}
      rowKey={(lease) => lease.id}
      onRowClick={(lease) => navigate(`/lease/${lease.id}`)}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={filtered ? 'No leases match those filters' : 'No leases yet'}
      emptyDescription={
        filtered
          ? 'Try a wider date range, or clear the filters to see everything.'
          : 'Upload a lease and LeaseGuard AI will read it and flag the clauses that matter.'
      }
      emptyAction={!filtered && onUpload ? { label: 'Upload a lease', onClick: onUpload } : undefined}
    />
  );
};

export default LeaseTable;
