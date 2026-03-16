import React, { useState } from 'react';
import { toApiDate } from '@/lib/format';
import { Button, Field, FilterBar, Input, Select } from '@/ui';
import DateRangePicker from '@/ui/DateRangePicker';
import { SearchIcon } from '@/ui/icons';

interface LeaseSearchBarProps {
  onSearch: (filters: LeaseSearchFilters) => void;
}

export interface LeaseSearchFilters {
  address: string;
  status: string;
  /** `YYYY-MM-DD` — what the Django view parses with `%Y-%m-%d`. */
  startDate?: string;
  endDate?: string;
}

const EMPTY: LeaseSearchFilters = { address: '', status: '' };

const LeaseSearchBar: React.FC<LeaseSearchBarProps> = ({ onSearch }) => {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      setError('The start date must come before the end date.');
      return;
    }
    setError(null);

    onSearch({
      address,
      status,
      // The search endpoint widens `end_date` by a day itself. Formatting the
      // *local* calendar date keeps the day the user picked; the previous code
      // added 86399999ms and called toISOString(), which rolls both ends
      // forward a day in any UTC-negative timezone.
      startDate: startDate ? toApiDate(startDate) : undefined,
      endDate: endDate ? toApiDate(endDate) : undefined,
    });
  };

  const handleReset = () => {
    setAddress('');
    setStatus('');
    setStartDate(null);
    setEndDate(null);
    setError(null);
    onSearch(EMPTY);
  };

  return (
    <FilterBar onSubmit={handleSearch} onReset={handleReset} error={error}>
      <Field label="Address" className="min-w-[14rem] flex-1">
        <Input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Street, city or ZIP"
        />
      </Field>

      <Field label="Uploaded between" className="w-full sm:w-56">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={([start, end]) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </Field>

      <Field label="Status" className="w-full sm:w-44">
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Any status</option>
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </Field>

      <div className="flex gap-2 pb-[1px]">
        <Button type="submit" icon={<SearchIcon className="h-4 w-4" />}>
          Search
        </Button>
        <Button type="reset" variant="ghost">
          Clear
        </Button>
      </div>
    </FilterBar>
  );
};

export default LeaseSearchBar;
