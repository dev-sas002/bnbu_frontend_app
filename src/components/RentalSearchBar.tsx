import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RentalPropertyStatus } from '../types/rentalTypes';
import { format } from 'date-fns';
import { batch } from 'react-redux';

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
    <div className="bg-gray-100 p-4 rounded-lg flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
        {/* Min Profit */}
        <input
          type="number"
          value={minProfit}
          onChange={(e) => setMinProfit(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Min Profit"
          className="p-2 border rounded-lg bg-gray-50 w-full sm:w-auto"
        />

        {/* Max Profit */}
        <input
          type="number"
          value={maxProfit}
          onChange={(e) => setMaxProfit(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Max Profit"
          className="p-2 border rounded-lg bg-gray-50 w-full sm:w-auto"
        />

        {/* Batch ID */}
        <input
          type="number"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Batch ID"
          className="p-2 border rounded-lg bg-gray-50 w-full sm:w-auto"
        />

        {/* Date Picker Range */}
        <div className="relative w-full sm:w-auto">
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
            className="w-full p-2 border rounded-lg bg-gray-50"
            todayButton="Today"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded-lg bg-gray-50 w-full sm:w-auto appearance-none pr-8"
          >
            <option value="">Select Status</option>
            <option value={RentalPropertyStatus.Pending.toLowerCase()}>Pending</option>
            <option value={RentalPropertyStatus.Approved.toLowerCase()}>Approved</option>
            <option value={RentalPropertyStatus.Rejected.toLowerCase()}>Rejected</option>
            <option value={RentalPropertyStatus.Error.toLowerCase()}>Error</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
      >
        Search
      </button>

      {/* Error Message */}
      {error && <div className="text-red-500 mt-2 w-full text-center md:text-left">{error}</div>}
    </div>
  );
};

export default RentalSearchBar;
