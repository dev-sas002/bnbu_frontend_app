import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { Lease } from '../types/leaseTypes';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import UploadIcon from '@/assets/images/UploadIcon.png';

interface UploadLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (leaseData: FormData) => void;
  onUpdate: (leaseData: Lease) => void;
  leaseData?: Lease | null;
  isEditMode?: boolean;
}

const UploadLeaseModal: React.FC<UploadLeaseModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onUpdate,
  leaseData,
  isEditMode = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (leaseData) {
      setAddress1(leaseData.address1);
      setAddress2(leaseData?.address2 || '');
      setState(leaseData.state);
      setCity(leaseData.city);
      setZip(leaseData.zip_code);
      setFiles([]);
    } else {
      setAddress1('');
      setAddress2('');
      setState('');
      setCity('');
      setZip('');
    }
  }, [leaseData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 20, // Allow up to 20 files or adjust as needed
    disabled: isEditMode,
  });

  const validateFields = () => {
    if (!address1 || !city || !state || !zip) {
      toast.warn('Please fill out all mandatory fields (Address 1, City, State, Zip Code).');
      return false;
    }
    return true;
  };


  const handleUpload = async () => {
    if (!validateFields()) {
      return; // Stop further processing if validation fails
    }
    if (!isEditMode && files.length === 0) {
      toast.warn('Please select at least one file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      files.forEach((file, index) => formData.append('documents', file)); // Append all files
      formData.append('address1', address1);
      formData.append('address2', address2);
      formData.append('state', state);
      formData.append('city', city);
      formData.append('zip_code', zip);
      const newLeaseData: Lease = {
        id: leaseData?.id || 0,
        date: leaseData?.date || '',
        address1: address1,
        address2: address2,
        state: state,
        city: city,
        zip_code: zip,
        status: leaseData?.status || 'Draft',
        num_of_docs: leaseData?.num_of_docs || 0,
        documents: leaseData?.documents,
      };

      if (isEditMode && leaseData?.id) {
        await onUpdate(newLeaseData);
        toast.success('Lease updated successfully!');
      } else {
        await onUpload(formData);
        toast.success('Lease uploaded successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Failed to upload/update lease:', error);
      toast.error('Failed to upload/update lease.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal-title text-lg font-semibold mb-4 text-red-500">
        {isEditMode ? 'Edit Lease Record' : 'Create New Lease Record'}
      </h3>

      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          placeholder="Address 1"
          className="modal-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          placeholder="Address 2 (Optional)"
          className="modal-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
          className="modal-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="modal-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Zip Code"
          className="modal-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {!isEditMode && (
        <div className="mt-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
          >
            <input {...getInputProps()} id="lease-upload" />
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop files here'
                  : files.length > 0
                  ? `${files.length} file(s) selected`
                  : 'Drop or Select File Here'}
              </p>
              <p className="text-xs text-gray-500 mt-2">PDF files only</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={handleUpload}
          className="upload-button bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-3 flex items-center space-x-2"
          disabled={isUploading}
        >
          {!isEditMode && <img src={UploadIcon} alt="Upload Icon" className="w-5 h-5" />}
          <span>{isEditMode ? 'Save Changes' : 'Analyze Lease'}</span>
        </button>
        <button
          onClick={onClose}
          className="cancel-button bg-gray-500 text-white hover:bg-gray-600 rounded-lg px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default UploadLeaseModal;