import React, { useEffect, useState } from 'react';
import { formatAddress } from '@/lib/format';
import type { Lease } from '@/types/leaseTypes';
import { Button, Modal } from '@/ui';
import Dropzone from '@/ui/Dropzone';

interface UploadRevisionLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaseData: Lease | null;
  onUpdateRevision: (leaseId: number, revisedData: FormData) => Promise<void>;
  submitting?: boolean;
}

/** Adds a new version of the documents on an existing lease. */
const UploadRevisionLeaseModal: React.FC<UploadRevisionLeaseModalProps> = ({
  isOpen,
  onClose,
  leaseData,
  onUpdateRevision,
  submitting = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (files.length === 0) {
      setError('Choose at least one PDF.');
      return;
    }
    if (!leaseData?.id) {
      setError('This lease has no id, so the revision cannot be attached to it.');
      return;
    }
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));
    await onUpdateRevision(leaseData.id, formData);
    setFiles([]);
  };

  if (!leaseData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload a revision"
      description={`New documents for ${formatAddress(leaseData)}, ${leaseData.city}.`}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Dropzone
          files={files}
          onFilesChange={setFiles}
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={20}
          hint="PDF only, up to 20 files"
        />

        {error && (
          <p role="alert" className="text-sm text-negative-fg">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Upload revision
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadRevisionLeaseModal;
