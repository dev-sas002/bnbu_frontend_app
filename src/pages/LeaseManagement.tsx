// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/pages/LeaseManagement.tsx
import React, { useEffect, useState } from 'react';
import LeaseTable from '../components/LeaseTable';
import LeaseSearchBar from '../components/LeaseSearchBar';
import UploadLeaseModal from '../components/UploadLeaseModal';
import { useGetAllLeasesQuery, useUploadLeaseMutation, useUpdateLeaseMutation, useSearchLeasesQuery, useReviewDocumentsMutation, useReviseLeaseMutation } from '../services/api';
import Layout from '../components/Layout';
import { Lease } from '@/types/leaseTypes';
import { set } from 'react-datepicker/dist/date_utils';
import { toggleRefreshDocuments } from '../store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Document } from '@/types/leaseTypes';
import { toast } from 'react-toastify';
import LeaseBreadcrumb from '../components/LeaseBreadcrumb';
import UploadIcon from '@/assets/images/UploadIcon.png';

const LeaseManagement = () => {
  const [page, setPage] = useState(1);
  const { data: leases, refetch, isLoading, isError } = useGetAllLeasesQuery(page);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLease] = useUploadLeaseMutation();
  const [updateLease] = useUpdateLeaseMutation();
  const [reviseLease] = useReviseLeaseMutation();
  const [reviewDocuments] = useReviewDocumentsMutation(); 
  const [searchFilters, setSearchFilters] = useState({
    address: '',
    status: '',
    startDate: undefined,
    endDate: undefined,
  });

  const isFilterApplied = () => {
    return !!(searchFilters.address || searchFilters.status || searchFilters.startDate || searchFilters.endDate);
  };

  // const { data: searchResults } = useSearchLeasesQuery(searchFilters.address || searchFilters.status || searchFilters.startDate || searchFilters.endDate ? {...searchFilters, "page" : page} : undefined );
  const { data: searchResults } = useSearchLeasesQuery(
    isFilterApplied() ? { ...searchFilters, ...(page ? { page } : {}) } : undefined
  );
  
  const toggle = useSelector((state: RootState) => state.auth.refreshDocuments);
  useEffect(() => {
    refetch();
  }, [toggle])

  const displayedLeases =  isFilterApplied() ? searchResults?.results : leases?.results;
  // console.log("displayedLeases:", displayedLeases);
  // console.log("searchResults:", searchResults);
  // console.log("leases:", leases);
  // console.log("filters:", searchFilters);
  // console.log("================>")
  // console.log("Search filters:", searchFilters);
  // console.log("Current page:", page);
  // console.log("Final search query:", isFilterApplied());

  const dispatch = useDispatch()

  const handleUploadLease = async (leaseData: FormData) => {
    try {
      // Upload the lease
      const uploadedLease = await uploadLease(leaseData).unwrap();
      refetch();
      setUploadModalOpen(false);

    if (uploadedLease.documents && uploadedLease.documents.length > 0) {
      const documentIds = uploadedLease.documents.map((doc: Document) => doc.id).filter((id: number) => id); // Collect document IDs

      try {
        // Review all documents at once using the reviewDocuments mutation
        await reviewDocuments({ documentIds });
        dispatch(toggleRefreshDocuments()) 
        // console.log(`All documents reviewed.`);
      } catch (reviewError) {
        console.error(`Error reviewing documents:`, reviewError);
        toast.error('Failed to review documents');
      }
    }
    
    } catch (error) {
      console.error("Failed to upload lease:", error);
    }
  };

  const handleUpdateLease = async (leaseData: Lease) => {
    try {
      await updateLease(leaseData).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update lease:", error);
    }
  };

  const handleReviseLease = async (leaseId: number, revisedData: FormData) => {
    try {
      await reviseLease({ id: leaseId, revisedData }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to revise lease:", error);
    }
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    setPage(1);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
          <div className="text-lg text-red-500">Error loading leases</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white w-full mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold">Your Leases</h2>
            {/* Added spacing between the heading and breadcrumb */}
            <div>
              <LeaseBreadcrumb />
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center space-x-2"
          >
            <img src={UploadIcon} alt="Upload Revision Icon" className='w-5 h-5'/>
            <span>Upload Lease</span>
          </button>
        </div>
        <LeaseSearchBar onSearch={handleSearch} />
        <LeaseTable leases={displayedLeases} onUpdate={handleUpdateLease} onUpdateRevision={handleReviseLease}/>

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
            disabled={isFilterApplied() ? !searchResults?.next : !leases?.next}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Upload Lease Modal */}
        <UploadLeaseModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUploadLease}
          onUpdate={handleUpdateLease}
        />
      </div>
    </Layout>
  );
};

export default LeaseManagement;
