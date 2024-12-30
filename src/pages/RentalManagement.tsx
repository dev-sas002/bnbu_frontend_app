import React, { useState, useEffect } from 'react';
import RentalTable from '../components/RentalTable';
import RentalSearchBar from '../components/RentalSearchBar';
import UploadRentalModal from '../components/UploadRentalModal';
import { useFilteredListQuery, useUploadPropertiesMutation, useDownloadCsvQuery, useGetTaskResultQuery, useTaskProgressQuery } from '../services/api';
import Layout from '../components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setLoading, toggleRefreshRentals, setPolling, setTask } from '../store/slices/authSlice'; // Import actions
import { toast } from 'react-toastify';
import download from '@/assets/images/download.png';
import upload from '@/assets/images/upload.png';

const RentalManagement = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const { data: filteredRentals, refetch, isLoading } = useFilteredListQuery({
    ...searchFilters,
    page,
    pageSize: rowsPerPage, // Send the rows per page to the API
  });

  const { data: csvData, refetch: refetchCsvData } = useDownloadCsvQuery(searchFilters);

  const refreshRentals = useSelector((state: RootState) => state.auth.refreshRentals);
  const pageLoading = useSelector((state: RootState) => state.auth.isLoading); // Global loading state
  const polling = useSelector((state: RootState) => state.auth.polling); // Polling state
  const taskId = useSelector((state: RootState) => state.auth.taskId);

  const { data: taskResult, refetch: refetchTaskResult } = useGetTaskResultQuery(taskId, {
    skip: !taskId,
  });

  const { data: taskProgressData, isFetching: isFetchingProgress } = useTaskProgressQuery(taskId, {
    skip: !taskId,
    pollingInterval: 5000,
  });

  const progressPercentage = taskProgressData?.progress || 0;

  const dispatch = useDispatch();

  const [allBatchIds, setAllBatchIds] = useState<number[]>([]); // State for all batch ids

  const { data: batchIdData, refetch: refetchBatchIds } = useFilteredListQuery({}); // Assuming this query fetches all batch ids

  useEffect(() => {
    if (batchIdData?.results?.all_batch_ids) {
      setAllBatchIds(batchIdData.results.all_batch_ids);
    }
  }, [batchIdData]);

  useEffect(() => {
    refetchBatchIds(); 
  }, [refreshRentals, refetchBatchIds]);

  useEffect(() => {
    refetch();
  }, [refreshRentals, refetch, rowsPerPage]);

  useEffect(() => {
    let interval: number | undefined = undefined;

    if (polling && taskId) {
      interval = setInterval(async () => {
        const result = await refetchTaskResult();
        if (result.data?.success && result.data.message === "Task completed") {
          // Task completed, stop polling
          dispatch(setPolling(false));
          dispatch(setTask(null));
          toast.success('Task completed successfully!');
          dispatch(toggleRefreshRentals()); // Trigger rentals refresh
          refetchCsvData(); // Update CSV data
          dispatch(setLoading(false)); // Stop loading
          if (interval !== undefined) clearInterval(interval); // Clear the interval
        } else if (!result.data?.success && result.data?.message === "Task failed") {
          // Task failed, stop polling
          dispatch(setPolling(false));
          dispatch(setTask(null));
          toast.error('Task processing failed.');
          dispatch(toggleRefreshRentals());
          refetchCsvData(); 
          dispatch(setLoading(false)); // Stop loading
          if (interval !== undefined) clearInterval(interval); // Clear the interval
        }
      }, 5000);
    }
  
    // Cleanup function to clear the interval if polling stops
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [polling, taskId, refetchTaskResult, dispatch, refetchCsvData]);
  

  const handleUploadRental = async (file: FormData) => {
    try {
      dispatch(setLoading(true));
      const response = await uploadProperties(file).unwrap();
      if (response.task_id) {
        dispatch(setTask(response.task_id));
        dispatch(setPolling(true)); // Start polling
      }
      // After successful upload, update the batch_id in the search filters
      if (response.batch_id) {
        setSearchFilters((prevFilters) => {
          const newFilters = { ...prevFilters, batch_id: response.batch_id };
          return newFilters;
        });
      }
      // Refetch batch ids after upload
      refetchBatchIds();
    } catch (error) {
      console.error('Failed to upload properties:', error);
      toast.error('Failed to upload properties.');
      dispatch(setLoading(false)); // Stop loading on error
    }
  };

  useEffect(() => {
    if (searchFilters.batch_id) {
      refetch();
    }
  }, [searchFilters.batch_id, refetch]);

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    setPage(1); // Reset to first page when applying new filters
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleDownloadCsv = (csvData: string | null) => {
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rental_properties_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV download successful!');
    } else {
      console.error('Error: No CSV data found');
      toast.error('Error downloading CSV');
    }
  };

  return (
    <Layout>
      {/* Progress Bar with Percentage Centered */}
      {taskId && (
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <div className="w-1/3 bg-gray-200 rounded-full h-4">
            <div
              className="bg-red-500 h-4 rounded-full "
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Overlay for Blurring Content */}
      {polling && taskId && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-10 flex justify-center items-center">
          <div className="text-white text-lg font-bold">Processing... {progressPercentage}%</div>
        </div>
      )}


      <div className="p-4 flex-1 bg-white w-full mx-auto relative">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold">Your Rental Properties</h2>
          </div>
          <div className="flex flex-row justify-end items-center space-x-2">
            <button
              onClick={() => handleDownloadCsv(csvData)}
              className={`bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center space-x-2`}
              disabled={isFetchingProgress} // Disable during progress fetching
            >
              <img src={download} alt="Download Icon" className="w-5 h-5" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className={`bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center space-x-2`}
              disabled={isFetchingProgress} // Disable during progress fetching
            >
              <img src={upload} alt="Upload Icon" className="w-5 h-5" />
              <span>Upload Properties</span>
            </button>
          </div>
        </div>
        <RentalSearchBar onSearch={handleSearch} />
        <RentalTable rentals={filteredRentals?.results?.properties || []} />
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isFetchingProgress || pageLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="px-2 py-1 border rounded border-red-600 focus:border-red-600 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span>
              {(page - 1) * rowsPerPage + 1} -{' '}
              {Math.min(page * rowsPerPage, filteredRentals?.count || 0)} of{' '}
              {filteredRentals?.count || 0}
            </span>
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!filteredRentals?.next || isFetchingProgress || pageLoading}
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
          loading={pageLoading}
        />
      </div>
    </Layout>
  );
};

export default RentalManagement;
