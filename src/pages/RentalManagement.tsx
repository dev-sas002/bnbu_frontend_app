import React, { useState, useEffect } from 'react';
import RentalTable from '../components/RentalTable';
import RentalSearchBar from '../components/RentalSearchBar';
import UploadRentalModal from '../components/UploadRentalModal';
import { useFilteredListQuery, useUploadPropertiesMutation, useDownloadCsvQuery } from '../services/api';
import Layout from '../components/Layout';
import { RentalProperty } from '@/types/rentalTypes';
import { toggleRefreshRentals } from '@/store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toast } from 'react-toastify';
import download from '@/assets/images/download.png';
import upload from '@/assets/images/upload.png';


const RentalManagement = () => {
  const [page, setPage] = useState(1);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProperties] = useUploadPropertiesMutation();

  const [searchFilters, setSearchFilters] = useState({
    batch_id: undefined,
    status: undefined,
    minProfit: undefined,
    maxProfit: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const { data: filteredRentals, refetch, isLoading, isError } = useFilteredListQuery({
    ...searchFilters,
    page,
  });

  const { data: csvData, error: csvError, isLoading: csvLoading } = useDownloadCsvQuery(searchFilters);

  const toggle = useSelector((state: RootState) => state.auth.refreshRentals);
  useEffect(() => {
    refetch();
  }, [toggle, refetch]);

  const displayedRentals = filteredRentals?.results || [];

  const dispatch = useDispatch();

  const handleUploadRental = async (file: FormData) => {
    try {
      await uploadProperties(file).unwrap();
      dispatch(toggleRefreshRentals());
      setUploadModalOpen(false);
      // toast.success('Properties uploaded successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to upload properties:', error);
      // toast.error('Failed to upload properties');
    }
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    setPage(1); // Reset to the first page when applying new filters
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDownloadCsv = (csvData: string | null) => {
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rental_properties.csv'; // This will be the file name for the download
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Show success toast
      toast.success('CSV download successful!');
    } else {
      console.error('Error: No CSV data found');
      toast.error('Error downloading CSV');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">Error loading properties</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white w-full mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold">Your Rental Properties</h2>
          </div>
          <div className="flex flex-row justify-end items-center space-x-2">
            <button
              onClick={() => handleDownloadCsv(csvData)}
              className="bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center space-x-2"
            >
              <img src={download} alt="Download Icon" className="w-5 h-5"/>
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center space-x-2"
            >
              <img src={upload} alt="Upload Icon" className="w-5 h-5" />
              <span>Upload Properties</span>
            </button>
          </div>
        </div>
        <RentalSearchBar onSearch={handleSearch} />
        <RentalTable rentals={displayedRentals} />

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-4">Page {page}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!filteredRentals?.next}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Upload Rental Modal */}
        <UploadRentalModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUploadRental}
        />
      </div>
    </Layout>
  );
};

export default RentalManagement;
