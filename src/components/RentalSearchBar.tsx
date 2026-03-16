import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RentalPropertyStatus } from '../types/rentalTypes';
import { useFilteredListQuery } from '../services/api'; // Assuming this hook fetches the data

interface RentalSearchBarProps {
  onSearch: (filters: RentalSearchFilters) => void;
}

interface RentalSearchFilters {
  min_profit?: number;
  max_profit?: number;
  status?: RentalPropertyStatus;
  start_date?: string;
  end_date?: string;
  batch_id?: number;
}

const RentalSearchBar: React.FC<RentalSearchBarProps> = ({ onSearch }) => {
  const [minProfit, setMinProfit] = useState<number | ''>('');
  const [maxProfit, setMaxProfit] = useState<number | ''>('');
  const [batchId, setBatchId] = useState<number | ''>('');
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allBatchIds, setAllBatchIds] = useState<number[]>([]); // State for all batch ids

  const { data } = useFilteredListQuery({});
  // console.log(data);

  useEffect(() => {
    if (data?.results?.all_batch_ids) {
      setAllBatchIds(data?.results?.all_batch_ids);
    }
  }, [data]);

  // Helper function to format dates as "Month Day, Year"
  const formatDate = (date: string | Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const handleSearch = () => {
    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      setError('Start date must be before end date.');
      return;
    } else {
      setError(null); // Clear any previous error
    }

    const formattedStartDate = startDate ? formatDate(startDate) : undefined;
    const formattedEndDate = endDate ? formatDate(endDate) : undefined;

    const filters: RentalSearchFilters = {
      min_profit: minProfit ? minProfit : undefined,
      max_profit: maxProfit ? maxProfit : undefined,
      batch_id: batchId ? batchId : undefined,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    };

    // Only include status in the filters if it's not an empty string
    if (status) {
      filters.status = status as RentalPropertyStatus;
    }

    onSearch(filters);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex flex-col gap-4 items-start md:items-center lg:items-start relative">
      <div className="flex flex-wrap gap-4 w-full">
        {/* Min Profit */}
        <input
          type="number"
          value={minProfit}
          onChange={(e) => setMinProfit(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Min Profit"
          className="p-2 border rounded-lg bg-gray-50 w-full md:w-[calc(50%-8px)] lg:w-auto"
        />

        {/* Max Profit */}
        <input
          type="number"
          value={maxProfit}
          onChange={(e) => setMaxProfit(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Max Profit"
          className="p-2 border rounded-lg bg-gray-50 w-full md:w-[calc(50%-8px)] lg:w-auto"
        />

        {/* Batch ID Dropdown */}
        <div className="relative w-full md:w-[calc(50%-8px)] lg:w-auto">
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value ? parseInt(e.target.value) : '')}
            className="p-2 border rounded-lg bg-gray-50 w-full appearance-none pr-8"
          >
            <option value="">Select Batch ID</option>
            {allBatchIds.map((id) => (
              <option key={id} value={id}>
                Batch ID {id}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full md:w-[calc(50%-8px)] lg:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded-lg bg-gray-50 w-full appearance-none pr-8"
          >
            <option value="">Select Status</option>
            {/* <option value={RentalPropertyStatus.Pending}>Pending</option> */}
            <option value={RentalPropertyStatus.Approved}>Approved</option>
            <option value={RentalPropertyStatus.Rejected}>Rejected</option>
            <option value={RentalPropertyStatus.Error}>Error</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Date Picker Range */}
        <div className="relative w-full lg:w-auto">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              const [start, end] = date;
              setStartDate(start);
              setEndDate(end);
            }}
            startDate={startDate as Date}
            endDate={endDate as Date}
            selectsRange
            placeholderText="Select Date Range"
            className="p-2 border rounded-lg bg-gray-50 w-full lg:w-auto"
            todayButton="Today"
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="flex w-full justify-center lg:justify-end lg:absolute lg:top-4 lg:right-4 lg:w-auto mt-4 md:mt-0">
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full md:w-auto"
        >
          Search
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 mt-2 w-full text-center md:text-left">{error}</div>}
    </div>
  );
};

export default RentalSearchBar;
