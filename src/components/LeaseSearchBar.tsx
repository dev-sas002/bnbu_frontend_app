import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface LeaseSearchBarProps {
  onSearch: (filters: LeaseSearchFilters) => void;
}

interface LeaseSearchFilters {
  address: string;
  status: string;
  startDate?: string; // ISO string format
  endDate?: string;   // ISO string format
}

const LeaseSearchBar: React.FC<LeaseSearchBarProps> = ({ onSearch }) => {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      setError('Start date must be before end date.');
      return;
    } else {
      setError(null); // Clear any previous error
    }
  
    const formattedStartDate = startDate ? new Date(startDate.getTime() + 86399999).toISOString().split('T')[0] : undefined;
  
    // Ensure that the end date includes the full day
    const formattedEndDate = endDate 
      ? new Date(endDate.getTime() + 86399999).toISOString().split('T')[0] // Adding 23 hours, 59 minutes, 59 seconds
      : undefined;
    onSearch({ address, status, startDate: formattedStartDate, endDate: formattedEndDate });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="p-2 border rounded-lg bg-gray-50 w-full sm:w-auto"
        />
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
        <div className="relative w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded-lg bg-gray-50 w-full sm:w-auto appearance-none pr-8"
          >
            <option value="">Select Status</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
            <option value="Approved">Approved</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
      >
        Search
      </button>
      {error && <div className="text-red-500 mt-2 w-full text-center md:text-left">{error}</div>}
    </div>
  );
};

export default LeaseSearchBar;
