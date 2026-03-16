import React, { useState, useCallback } from 'react';
import { Lease } from '../types/leaseTypes';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import UploadIcon from '@/assets/images/UploadIcon.png';

interface UploadRevisionLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaseData: Lease | null;
  onUpdateRevision: (leaseId: number, revisedData: FormData) => Promise<void>;
}

const UploadRevisionLeaseModal: React.FC<UploadRevisionLeaseModalProps> = ({
  isOpen,
  onClose,
  leaseData,
  onUpdateRevision
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 20,
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.warn('Please select a file to upload.');
      return;
    }
  
    try {
      setIsUploading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file)); // Append all selected files
      if (leaseData?.id) {
        // Pass the leaseId and formData to the onUpdateRevision function
        await onUpdateRevision(leaseData.id, formData);
        toast.success('Lease revision uploaded successfully!');
        onClose();
      } else {
        toast.error('Lease ID is missing!');
      }
    } catch (error) {
      console.error('Failed to upload revision:', error);
      toast.error('Failed to upload revision.');
    } finally {
      setIsUploading(false);
      setFiles([]); // Clear files after upload
    }
  };
  
  if (!isOpen || !leaseData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-red-500">Upload Lease Revision</h2>
        <p className="mb-4">Uploading lease revision for: {leaseData.address1}, {leaseData.city}</p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
        >
          <input {...getInputProps()} />
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
              {isDragActive ? 'Drop file here' : files.length > 0 ? `${files.length} file(s) selected` : 'Drop or Select File Here'}
            </p>
            <p className="text-xs text-gray-500 mt-2">PDF file only</p>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleUpload}
            className="bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-3 flex items-center space-x-2"
            disabled={isUploading}
          >
            {!isUploading && <img src={UploadIcon} alt="Upload Icon" className="w-5 h-5" />}
            <span>{isUploading ? 'Uploading...' : 'Upload Revision'}</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white hover:bg-gray-600 rounded-lg px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadRevisionLeaseModal;
