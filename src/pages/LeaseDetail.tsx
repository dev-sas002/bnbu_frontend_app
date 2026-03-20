import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import UploadRevisionLeaseModal from '@/components/UploadRevisionLeaseModal';
import { formatAddress, formatDate } from '@/lib/format';
import {
  useGetDocumentNamesByLeaseIdQuery,
  useGetLeaseByIdQuery,
  useReviewDocumentsMutation,
  useReviseLeaseMutation,
} from '@/services/api';
import type { Document } from '@/types/leaseTypes';
import {
  Button,
  Card,
  Column,
  DataTable,
  DOCUMENT_STATUSES,
  ErrorState,
  LEASE_STATUSES,
  PageHeader,
  Spinner,
  StatTile,
  StatusBadge,
} from '@/ui';
import { UploadIcon } from '@/ui/icons';

/** One lease: its address, its status, and every version of its documents. */
const LeaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRevisionOpen, setRevisionOpen] = useState(false);

  const {
    data: lease,
    isLoading,
    isError,
    refetch,
  } = useGetLeaseByIdQuery(id, { skip: !id });

  const documentsQuery = useGetDocumentNamesByLeaseIdQuery(id, { skip: !id });
  const [reviseLease, { isLoading: isRevising }] = useReviseLeaseMutation();
  const [reviewDocuments] = useReviewDocumentsMutation();

  const documents = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);

  const columns = useMemo<Array<Column<Document>>>(
    () => [
      {
        key: 'index',
        header: '#',
        align: 'right',
        render: (_document, index) => index + 1,
      },
      {
        key: 'uploaded_at',
        header: 'Uploaded',
        sortValue: (document) => document.uploaded_at,
        render: (document) => formatDate(document.uploaded_at),
      },
      {
        key: 'name',
        header: 'Document',
        sortValue: (document) => document.name,
        render: (document) => (
          <span className="font-medium text-ink" title={document.name}>
            {document.name}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortValue: (document) => document.status,
        render: (document) => (
          <StatusBadge vocabulary={DOCUMENT_STATUSES} value={document.status} />
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (document) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/preview/${document.id}`);
              }}
            >
              View file
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/lease/${id}/documents/${document.id}/notes`);
              }}
            >
              Review notes
            </Button>
          </div>
        ),
      },
    ],
    [navigate, id]
  );

  const handleRevision = async (leaseId: number, formData: FormData) => {
    try {
      const result = await reviseLease({ id: leaseId, revisedData: formData }).unwrap();
      setRevisionOpen(false);
      toast.success('Revision uploaded');

      const documentIds = result.document_ids ?? [];
      if (documentIds.length > 0) {
        await reviewDocuments({ documentIds }).unwrap();
        toast.info('LeaseGuard AI is reading the new documents.');
      }
    } catch {
      toast.error('Failed to upload the revision');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading the lease…" />
      </div>
    );
  }

  if (isError || !lease) {
    return (
      <ErrorState
        title="Could not load this lease"
        description="It may have been deleted, or the API is unreachable."
        onRetry={refetch}
      />
    );
  }

  const latest = documents[documents.length - 1];

  return (
    <div className="space-y-5">
      <PageHeader
        title={formatAddress(lease)}
        description={`${lease.city}, ${lease.state} ${lease.zip_code}`}
        breadcrumbs={[
          { name: 'Home', path: '/dashboard' },
          { name: 'Leases', path: '/leases' },
          { name: formatAddress(lease) },
        ]}
        actions={
          <Button onClick={() => setRevisionOpen(true)} icon={<UploadIcon className="h-4 w-4" />}>
            Upload revision
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Lease status"
          value={<StatusBadge vocabulary={LEASE_STATUSES} value={lease.status} />}
          caption="Mirrors the newest document"
        />
        <StatTile
          label="Documents"
          value={documents.length || lease.num_of_docs}
          caption="Every version uploaded"
          loading={documentsQuery.isLoading}
        />
        <StatTile
          label="Last upload"
          value={formatDate(latest?.uploaded_at ?? lease.date)}
          caption={latest ? latest.name : 'No documents yet'}
          loading={documentsQuery.isLoading}
        />
      </div>

      <Card flush>
        <DataTable
          className="rounded-lg border-0 shadow-none"
          caption="Documents on this lease"
          columns={columns}
          rows={documents}
          rowKey={(document) => document.id}
          loading={documentsQuery.isLoading}
          error={documentsQuery.isError}
          onRetry={documentsQuery.refetch}
          emptyTitle="No documents on this lease"
          emptyDescription="Upload a revision to attach the first document."
          emptyAction={{ label: 'Upload revision', onClick: () => setRevisionOpen(true) }}
        />
      </Card>

      <UploadRevisionLeaseModal
        isOpen={isRevisionOpen}
        onClose={() => setRevisionOpen(false)}
        leaseData={lease}
        onUpdateRevision={handleRevision}
        submitting={isRevising}
      />
    </div>
  );
};

export default LeaseDetail;
