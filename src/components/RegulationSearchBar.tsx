import React, { useState } from 'react';
import { toApiDate } from '@/lib/format';
import { Button, Field, FilterBar, Input, Select } from '@/ui';
import DateRangePicker from '@/ui/DateRangePicker';
import { SearchIcon } from '@/ui/icons';

interface RegulationSearchBarProps {
  onSearch: (filters: RegulationSearchFilters) => void;
}

export interface RegulationSearchFilters {
  /** Address, city or area. */
  query: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

const EMPTY: RegulationSearchFilters = { query: '', status: '' };

const RegulationSearchBar: React.FC<RegulationSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
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
      query,
      status,
      // `%Y-%m-%d`, formatted from the local calendar date — see LeaseSearchBar.
      startDate: startDate ? toApiDate(startDate) : undefined,
      endDate: endDate ? toApiDate(endDate) : undefined,
    });
  };

  const handleReset = () => {
    setQuery('');
    setStatus('');
    setStartDate(null);
    setEndDate(null);
    setError(null);
    onSearch(EMPTY);
  };

  return (
    <FilterBar onSubmit={handleSearch} onReset={handleReset} error={error}>
      <Field label="Location" className="min-w-[14rem] flex-1">
        <Input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Address, city or area"
        />
      </Field>

      <Field label="Asked between" className="w-full sm:w-56">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={([start, end]) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </Field>

      <Field label="Outcome" className="w-full sm:w-60">
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Any outcome</option>
          <option value="STR Allowed">STR Allowed</option>
          <option value="STR Not Allowed">STR Not Allowed</option>
          <option value="STR Allowed with Restrictions">STR Allowed with Restrictions</option>
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

export default RegulationSearchBar;
