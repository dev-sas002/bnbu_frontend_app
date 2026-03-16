import React, { useEffect, useState } from 'react';
import RegulationTable from '../components/RegulationTable';
import RegulationSearchBar from '../components/RegulationSearchBar';
import { useGetRegulationsQuery, useSearchRegulationsQuery } from '../services/api';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import RegulationBreadcrumb from '@/components/RegulationBreadcrumb';
import SearchIcon from '@/assets/images/SearchIcon.png';

const RegulationManagement = () => {
  const [page, setPage] = useState(1);
  const { data: regulations, refetch, isLoading, isError } = useGetRegulationsQuery(page);
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    status: '',
    startDate: undefined,
    endDate: undefined,
  });

  const isFilterApplied = () => {
    return !!(searchFilters.query || searchFilters.status || searchFilters.startDate || searchFilters.endDate);
  };

  const { data: searchResults } = useSearchRegulationsQuery(
    isFilterApplied() ? { ...searchFilters, ...(page ? { page } : {}) } : undefined
  );

  const toggle = useSelector((state: RootState) => state.auth.refreshRegulations);
  useEffect(() => {
    refetch();
  }, [toggle])

  const navigate = useNavigate(); // Initialize navigate for navigation

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    refetch();
  };

  const handleNewSearch = () => {
    navigate('/regulation/detail'); // Navigate to the regulation detail page
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
          <div className="text-lg text-red-500">Error loading regulations</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white w-full mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold">Your Regulation Searches</h2>
            <div>
              <RegulationBreadcrumb />
            </div>
          </div>
          <button
            onClick={handleNewSearch} // Handle new search click
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
          >
            <span><img src={SearchIcon} alt="Search Icon" className='w-5 h-5'/></span>
            <span>New Search</span>
          </button>
        </div>
        <RegulationSearchBar onSearch={handleSearch} />
        <RegulationTable regulations={isFilterApplied() ? searchResults?.results : regulations?.results} />

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
            disabled={isFilterApplied() ? !searchResults?.next : !regulations?.next}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default RegulationManagement;
