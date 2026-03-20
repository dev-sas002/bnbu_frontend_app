import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Lease } from '@/types/leaseTypes';
import { Button, Field, Input, Modal } from '@/ui';
import Dropzone from '@/ui/Dropzone';

interface UploadLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (leaseData: FormData) => void | Promise<void>;
  onUpdate?: (leaseData: Lease) => void | Promise<void>;
  leaseData?: Lease | null;
  isEditMode?: boolean;
  submitting?: boolean;
}

interface AddressFields {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_ADDRESS: AddressFields = { address1: '', address2: '', city: '', state: '', zip: '' };

const toAddressFields = (lease?: Lease | null): AddressFields =>
  lease
    ? {
        address1: lease.address1 ?? '',
        address2: lease.address2 ?? '',
        city: lease.city ?? '',
        state: lease.state ?? '',
        zip: lease.zip_code ?? '',
      }
    : EMPTY_ADDRESS;

/** Creates a lease from a set of PDFs, or edits an existing lease's address. */
const UploadLeaseModal: React.FC<UploadLeaseModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onUpdate,
  leaseData,
  isEditMode = false,
  submitting = false,
}) => {
  const [fields, setFields] = useState<AddressFields>(() => toAddressFields(leaseData));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFields(toAddressFields(leaseData));
    setFiles([]);
    setError(null);
  }, [leaseData, isOpen]);

  const update = (key: keyof AddressFields) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fields.address1 || !fields.city || !fields.state || !fields.zip) {
      setError('Address line 1, city, state and ZIP are all required.');
      return;
    }
    if (!isEditMode && files.length === 0) {
      setError('Add at least one PDF to analyse.');
      return;
    }
    setError(null);

    try {
      if (isEditMode && leaseData) {
        await onUpdate?.({
          ...leaseData,
          address1: fields.address1,
          address2: fields.address2,
          city: fields.city,
          state: fields.state,
          zip_code: fields.zip,
        });
      } else {
        const formData = new FormData();
        files.forEach((file) => formData.append('documents', file));
        formData.append('address1', fields.address1);
        formData.append('address2', fields.address2);
        formData.append('state', fields.state);
        formData.append('city', fields.city);
        formData.append('zip_code', fields.zip);
        await onUpload?.(formData);
      }
    } catch {
      toast.error('Failed to save the lease');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit lease' : 'New lease'}
      description={
        isEditMode
          ? 'Correct the property address. Documents are managed from the lease page.'
          : 'Where is the property, and which documents should LeaseGuard AI read?'
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Field label="Address line 1" required>
          <Input value={fields.address1} onChange={update('address1')} placeholder="1200 Pine St" />
        </Field>

        <Field label="Address line 2">
          <Input value={fields.address2} onChange={update('address2')} placeholder="Apt 4B" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" required className="sm:col-span-1">
            <Input value={fields.city} onChange={update('city')} placeholder="Seattle" />
          </Field>
          <Field label="State" required>
            <Input value={fields.state} onChange={update('state')} placeholder="WA" maxLength={2} />
          </Field>
          <Field label="ZIP" required>
            <Input value={fields.zip} onChange={update('zip')} placeholder="98101" />
          </Field>
        </div>

        {!isEditMode && (
          <Field label="Lease documents" required>
            <Dropzone
              id="lease-upload"
              files={files}
              onFilesChange={setFiles}
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={20}
              hint="PDF only, up to 20 files"
            />
          </Field>
        )}

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
            {isEditMode ? 'Save changes' : 'Analyse lease'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadLeaseModal;
