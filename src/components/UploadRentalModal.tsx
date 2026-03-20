import React, { useEffect, useState } from 'react';
import { REQUIRED_COLUMNS, VALID_FILE_EXTENSIONS } from '@/types/rentalTypes';
import { Button, Modal } from '@/ui';
import Dropzone from '@/ui/Dropzone';

interface UploadRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void | Promise<void>;
  submitting: boolean;
}

/** Starts a pricing run from a spreadsheet of listings. */
const UploadRentalModal: React.FC<UploadRentalModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  submitting,
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
      setError('Choose a spreadsheet to upload.');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    await onUpload(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload listings"
      description="Each row is priced against market ADR and occupancy. Processing runs in the background."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Dropzone
          id="rental-upload"
          files={files}
          onFilesChange={setFiles}
          accept={{
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/csv': ['.csv'],
          }}
          maxFiles={1}
          hint={`${VALID_FILE_EXTENSIONS.join(', ')} — one file at a time`}
          disabled={submitting}
        />

        <div className="rounded-md bg-surface-sunken px-3 py-2.5">
          <p className="text-xs font-medium text-ink-muted">Required columns</p>
          <p className="mt-1 font-mono text-xs text-ink-subtle">{REQUIRED_COLUMNS.join(' · ')}</p>
        </div>

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
            Start pricing
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadRentalModal;
