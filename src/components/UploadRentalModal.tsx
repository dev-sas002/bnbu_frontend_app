import React, { useState, useCallback, useEffect } from 'react';
import Modal from './Modal';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { VALID_FILE_EXTENSIONS } from '../types/rentalTypes'; // Importing file validation constants
import UploadIcon from '@/assets/images/UploadIcon.png';

interface UploadRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  loading: boolean; // Added loading prop to reflect upload progress
}

const UploadRentalModal: React.FC<UploadRentalModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  loading,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1, // Only allow 1 file for rental data upload
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.warn('Please select a file to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      // Call the upload function with the formData
      await onUpload(formData);
      toast.success('Rental data file uploaded. Processing started.');
      setFiles([]); // Clear files after successful upload
      onClose();
    } catch (error) {
      console.error('Failed to upload rental data file:', error);
      toast.error('Failed to upload rental data file.');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal-title text-lg font-semibold mb-4 text-red-500">
        Upload Deals
      </h3>

      <div className="mt-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}`}
        >
          <input {...getInputProps()} id="rental-upload" />
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
                ? 'Drop file here'
                : files.length > 0
                ? `${files.length} file(s) selected`
                : 'Drop or Select File Here'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Accepted file types: {VALID_FILE_EXTENSIONS.join(', ')}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={handleUpload}
          className="upload-button bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-3 flex items-center space-x-2"
          disabled={loading}
        >
          {!loading && <img src={UploadIcon} alt="Upload Icon" className="w-5 h-5" />}
          <span>Upload</span>
        </button>
        <button
          onClick={() => {
            setFiles([]);
            onClose();
          }}
          className="cancel-button bg-gray-500 text-white hover:bg-gray-600 rounded-lg px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default UploadRentalModal;
