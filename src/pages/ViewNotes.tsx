import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChatBox from '@/components/ChatBox';
import UploadRevisionLeaseModal from '@/components/UploadRevisionLeaseModal';
import { formatAddress, formatDate } from '@/lib/format';
import {
  useGetDocumentNamesByLeaseIdQuery,
  useGetLeaseByIdQuery,
  useReviewDocumentsMutation,
  useReviseLeaseMutation,
} from '@/services/api';
import {
  Button,
  DOCUMENT_STATUSES,
  ErrorState,
  PageHeader,
  Spinner,
  StatTile,
  StatusBadge,
} from '@/ui';
import { UploadIcon } from '@/ui/icons';

/** One document: its review, and the conversation over it. */
const ViewNotes: React.FC = () => {
  const { id, documentId } = useParams<{ id: string; documentId: string }>();
  const [isRevisionOpen, setRevisionOpen] = useState(false);

  const { data: lease, isLoading, isError, refetch } = useGetLeaseByIdQuery(id, { skip: !id });
  // The lease payload's nested `documents` omits `file_url` and is not always
  // present; the per-lease list is the authoritative source for a document's
  // name and status.
  const { data: documents } = useGetDocumentNamesByLeaseIdQuery(id, { skip: !id });

  const [reviseLease, { isLoading: isRevising }] = useReviseLeaseMutation();
  const [reviewDocuments] = useReviewDocumentsMutation();

  const currentDocument =
    documents?.find((document) => document.id === Number(documentId)) ??
    // `documents` is optional on the lease payload — this used to call .find()
    // straight through a cast and threw on a lease with none.
    (lease?.documents ?? []).find((document) => document.id === Number(documentId));

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
        <Spinner label="Loading the document…" />
      </div>
    );
  }

  if (isError || !lease) {
    return (
      <ErrorState
        title="Could not load this document"
        description="The lease it belongs to could not be fetched."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={currentDocument?.name ?? 'Document'}
        description={`${formatAddress(lease)} · ${lease.city}, ${lease.state}`}
        breadcrumbs={[
          { name: 'Home', path: '/dashboard' },
          { name: 'Leases', path: '/leases' },
          { name: formatAddress(lease), path: `/lease/${lease.id}` },
          { name: 'Review notes' },
        ]}
        actions={
          <Button onClick={() => setRevisionOpen(true)} icon={<UploadIcon className="h-4 w-4" />}>
            Upload revision
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Document status"
          value={<StatusBadge vocabulary={DOCUMENT_STATUSES} value={currentDocument?.status} />}
          caption="Set by the review"
        />
        <StatTile
          label="Uploaded"
          value={formatDate(currentDocument?.uploaded_at)}
          caption={currentDocument?.version ? `Version ${currentDocument.version}` : 'Latest version'}
        />
        <StatTile
          label="Lease"
          value={lease.num_of_docs}
          caption={lease.num_of_docs === 1 ? 'document on this lease' : 'documents on this lease'}
        />
      </div>

      <ChatBox documentId={documentId} lease={lease} />

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

export default ViewNotes;
