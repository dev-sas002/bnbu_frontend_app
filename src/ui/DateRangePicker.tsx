import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFieldControlId } from './fieldContext';

export interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: [Date | null, Date | null]) => void;
  placeholder?: string;
}

/**
 * The date-range control, wrapped once.
 *
 * `react-datepicker` renders its own `<input>`, which means it does not pick
 * up the id its enclosing `Field` generated — so every range filter in the app
 * had a label pointing at nothing. This adopts the id from the field context
 * and applies the shared control styling (see the overrides in index.css).
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = 'Any date',
}) => {
  const id = useFieldControlId();

  return (
    <DatePicker
      id={id}
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      onChange={(range) => onChange(range as [Date | null, Date | null])}
      selectsRange
      placeholderText={placeholder}
      todayButton="Today"
      isClearable
      dateFormat="d MMM yyyy"
    />
  );
};

export default DateRangePicker;
