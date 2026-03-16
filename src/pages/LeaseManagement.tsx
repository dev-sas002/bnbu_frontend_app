import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import LeaseSearchBar, { LeaseSearchFilters } from '@/components/LeaseSearchBar';
import LeaseTable from '@/components/LeaseTable';
import UploadLeaseModal from '@/components/UploadLeaseModal';
import {
  useGetAllLeasesQuery,
  useReviewDocumentsMutation,
  useSearchLeasesQuery,
  useUpdateLeaseMutation,
  useUploadLeaseMutation,
} from '@/services/api';
import type { Document, Lease } from '@/types/leaseTypes';
import { Button, PageHeader, Pagination } from '@/ui';
import { UploadIcon } from '@/ui/icons';

const NO_FILTERS: LeaseSearchFilters = { address: '', status: '' };

const hasFilters = (filters: LeaseSearchFilters): boolean =>
  Boolean(filters.address || filters.status || filters.startDate || filters.endDate);

/** Leases: the paginated list, the filters over it, and the upload flow. */
const LeaseManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LeaseSearchFilters>(NO_FILTERS);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<Lease | null>(null);

  const filtered = hasFilters(filters);

  // Only one of the two queries is ever subscribed: `skip` keeps the other
  // from firing, where the old code kept both mounted and simply ignored one
  // result. Both provide the `Lease` tag, so an upload refreshes whichever is
  // live without either page knowing about the other.
  const listQuery = useGetAllLeasesQuery(page, { skip: filtered });
  const searchQuery = useSearchLeasesQuery({ ...filters, page }, { skip: !filtered });
  const active = filtered ? searchQuery : listQuery;

  const [uploadLease, { isLoading: isUploading }] = useUploadLeaseMutation();
  const [updateLease] = useUpdateLeaseMutation();
  const [reviewDocuments] = useReviewDocumentsMutation();

  const leases = useMemo(() => active.data?.results ?? [], [active.data]);

  const handleUpload = async (leaseData: FormData) => {
    try {
      const uploaded = await uploadLease(leaseData).unwrap();
      setUploadOpen(false);
      toast.success('Lease uploaded');

      const documentIds = (uploaded.documents ?? [])
        .map((document: Document) => document.id)
        .filter(Boolean);

      if (documentIds.length > 0) {
        // Kicking off the review is a second call; a failure here leaves the
        // lease uploaded but unanalysed, which is worth saying out loud.
        await reviewDocuments({ documentIds }).unwrap();
        toast.info('LeaseGuard AI is reading the documents.');
      }
    } catch {
      toast.error('Failed to upload the lease');
    }
  };

  const handleUpdate = async (lease: Lease) => {
    try {
      await updateLease(lease).unwrap();
      setEditing(null);
      toast.success('Lease updated');
    } catch {
      toast.error('Failed to update the lease');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your leases"
        description="Uploaded leases and what LeaseGuard AI made of them."
        breadcrumbs={[{ name: 'Home', path: '/dashboard' }, { name: 'Leases' }]}
        actions={
          <Button onClick={() => setUploadOpen(true)} icon={<UploadIcon className="h-4 w-4" />}>
            Upload lease
          </Button>
        }
      />

      <LeaseSearchBar
        onSearch={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <LeaseTable
          leases={leases}
          onEdit={setEditing}
          loading={active.isLoading}
          error={active.isError}
          onRetry={active.refetch}
          onUpload={() => setUploadOpen(true)}
          filtered={filtered}
        />
        <Pagination
          page={page}
          onPageChange={setPage}
          hasNext={Boolean(active.data?.next)}
          count={active.data?.count}
          pageSize={10}
          disabled={active.isFetching}
        />
      </div>

      <UploadLeaseModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        submitting={isUploading}
      />

      <UploadLeaseModal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        leaseData={editing}
        isEditMode
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default LeaseManagement;
