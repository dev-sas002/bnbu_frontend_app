import React, { useState } from 'react';
import { toLongApiDate } from '@/lib/format';
import { RentalPropertyStatus, type RentalFilters } from '@/types/rentalTypes';
import { Button, Field, FilterBar, Input, Select } from '@/ui';
import DateRangePicker from '@/ui/DateRangePicker';
import { SearchIcon } from '@/ui/icons';

interface RentalSearchBarProps {
  onSearch: (filters: RentalSearchFilters) => void;
  /** Batch ids across the whole filtered set, supplied by the page. */
  batchIds: number[];
}

export type RentalSearchFilters = RentalFilters;

const RentalSearchBar: React.FC<RentalSearchBarProps> = ({ onSearch, batchIds }) => {
  const [minProfit, setMinProfit] = useState('');
  const [maxProfit, setMaxProfit] = useState('');
  const [batchId, setBatchId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      setError('The start date must come before the end date.');
      return;
    }
    if (minProfit && maxProfit && Number(minProfit) > Number(maxProfit)) {
      setError('Minimum profit is above the maximum.');
      return;
    }
    setError(null);

    onSearch({
      min_profit: minProfit ? Number(minProfit) : undefined,
      max_profit: maxProfit ? Number(maxProfit) : undefined,
      batch_id: batchId ? Number(batchId) : undefined,
      status: status ? (status as RentalPropertyStatus) : undefined,
      // The rental endpoints parse dates with `%B %d, %Y` — "March 3, 2024" —
      // while the lease and regulation endpoints want `2024-03-01`. The two
      // are not interchangeable; see the README.
      start_date: startDate ? toLongApiDate(startDate) : undefined,
      end_date: endDate ? toLongApiDate(endDate) : undefined,
    });
  };

  const handleReset = () => {
    setMinProfit('');
    setMaxProfit('');
    setBatchId('');
    setStatus('');
    setStartDate(null);
    setEndDate(null);
    setError(null);
    onSearch({});
  };

  return (
    <FilterBar onSubmit={handleSearch} onReset={handleReset} error={error}>
      <Field label="Min profit" className="w-full sm:w-32">
        <Input
          type="number"
          inputMode="numeric"
          value={minProfit}
          onChange={(event) => setMinProfit(event.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Max profit" className="w-full sm:w-32">
        <Input
          type="number"
          inputMode="numeric"
          value={maxProfit}
          onChange={(event) => setMaxProfit(event.target.value)}
          placeholder="Any"
        />
      </Field>

      <Field label="Batch" className="w-full sm:w-36">
        <Select value={batchId} onChange={(event) => setBatchId(event.target.value)}>
          <option value="">All batches</option>
          {batchIds.map((id) => (
            <option key={id} value={id}>
              Batch {id}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Status" className="w-full sm:w-36">
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Any status</option>
          <option value={RentalPropertyStatus.Approved}>Approved</option>
          <option value={RentalPropertyStatus.Rejected}>Rejected</option>
          <option value={RentalPropertyStatus.Error}>Error</option>
        </Select>
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

export default RentalSearchBar;
