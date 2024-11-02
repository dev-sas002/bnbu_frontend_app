import React, { useState } from 'react';
import LeaseTable from '../components/LeaseTable';
import LeaseSearchBar from '../components/LeaseSearchBar';
import UploadLeaseModal from '../components/UploadLeaseModal';
import { useGetAllLeasesQuery, useUploadLeaseMutation, useUpdateLeaseMutation, useSearchLeasesQuery} from '../services/api';
import Layout from '../components/Layout';
import { Lease } from '@/types/leaseTypes';

const LeaseManagement = () => {
  const [page, setPage] = useState(1); // State for current page
  const { data: leases, refetch, isLoading, isError } = useGetAllLeasesQuery(page); // Fetch leases based on current page
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLease] = useUploadLeaseMutation();
  const [updateLease] = useUpdateLeaseMutation();


  const handleUploadLease = async (leaseData: FormData) => {
    try {
      await uploadLease(leaseData).unwrap();
      refetch(); // Refresh leases after upload
      setUploadModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Failed to upload lease:", error);
    }
  };

  const handleUpdateLease = async (leaseData: Lease) => {
    try {
      await updateLease(leaseData).unwrap();
      refetch(); // Refresh leases after update
    } catch (error) {
      console.error("Failed to update lease:", error);
    }
  };


  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    refetch(); // Refetch leases when page changes
  };

  if (isLoading) {
    return <Layout><div>Loading...</div></Layout>; // Keep Layout for loading state
  }

  if (isError) {
    return <Layout><div>Error loading leases</div></Layout>; // Keep Layout for error state
  }

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Leases</h2>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Upload Lease
          </button>
        </div>
        <LeaseSearchBar onSearch={refetch} />
        <LeaseTable leases={leases?.results || []} onUpdate={handleUpdateLease} />

        
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
            disabled={!leases?.next} // Disable if there is no next page
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Upload Lease Modal */}
        <UploadLeaseModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUploadLease} // Pass handler to upload lease
          onUpdate={handleUpdateLease} // Pass handler to update lease
        />
      </div>
    </Layout>
  );

};

export default LeaseManagement;
