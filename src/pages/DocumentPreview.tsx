import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePreviewDocumentQuery } from '@/services/api';
import { Button, Card, ErrorState, PageHeader, Spinner } from '@/ui';

/**
 * Shows the stored file for one document.
 *
 * The endpoint returns a signed URL rather than bytes, so the page embeds it.
 * This used to be a hand-rolled `fetch` with its own `AbortController`, its
 * own token read out of localStorage and its own error state — all of which
 * the data layer already does.
 */
const DocumentPreview: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = usePreviewDocumentQuery(documentId, {
    skip: !documentId,
  });

  // Cloudinary serves over both schemes; forcing https avoids a mixed-content
  // block when the console itself is served over TLS.
  const fileUrl = data?.file_url ? String(data.file_url).replace(/^http:\/\//, 'https://') : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Document preview"
        breadcrumbs={[{ name: 'Home', path: '/dashboard' }, { name: 'Document preview' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-md">
                <Button>Open in a new tab</Button>
              </a>
            )}
          </>
        }
      />

      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="Fetching the file…" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load this document"
          description="The API did not return a file URL for it."
          onRetry={refetch}
        />
      )}

      {fileUrl && (
        <Card flush className="overflow-hidden">
          <iframe
            src={fileUrl}
            title="Document preview"
            className="h-[calc(100vh-16rem)] min-h-[32rem] w-full border-0"
          />
        </Card>
      )}
    </div>
  );
};

export default DocumentPreview;
