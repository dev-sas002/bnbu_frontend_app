import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface LeaseSearchBarProps {
  onSearch: (filters: any) => void;
}

const LeaseSearchBar: React.FC<LeaseSearchBarProps> = ({ onSearch }) => {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSearch = () => {
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : undefined;
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : undefined;
    
    onSearch({ address, status, startDate: formattedStartDate, endDate: formattedEndDate });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="p-2 border rounded-lg bg-gray-50"
        />
        <div className="relative">
          <DatePicker
            selected={startDate}
            onChange={(dates) => {
              const [start, end] = dates;
              setStartDate(start || undefined);
              setEndDate(end || undefined);
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            placeholderText="Select Date Range"
            className="w-full p-2 border rounded-lg bg-gray-50"
            todayButton="Today"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded-lg bg-gray-50 appearance-none pr-8" // Added padding to the right for the dropdown arrow
          >
            <option value="">Select Status</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
            <option value="Approved">Approved</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"> {/* Custom caret icon */}
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Search
      </button>
    </div>
  );
};

export default LeaseSearchBar;
