import React, { useState } from 'react';
import RentalRow from './RentalRow';
import RentalDetailsModal from "./RentalDetailsModal";
import { RentalProperty } from '../types/rentalTypes';

interface RentalTableProps {
  rentals: RentalProperty[];
}

type SortOrder = 'asc' | 'desc' | null;

const RentalTable: React.FC<RentalTableProps> = ({ rentals = [] }) => {
  const [selectedRental, setSelectedRental] = useState<RentalProperty | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleRowClick = (rental: RentalProperty) => {
    setSelectedRental(rental);
  };

  const closeModal = () => {
    setSelectedRental(null);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle sort order
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : prevOrder === 'desc' ? null : 'asc'));
    } else {
      // Set new sort column and default to ascending
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const getSortedRentals = () => {
    if (!sortColumn || !sortOrder) return rentals;

    return [...rentals].sort((a, b) => {
      const aValue = a[sortColumn as keyof RentalProperty];
      const bValue = b[sortColumn as keyof RentalProperty];

      if (aValue == null || bValue == null) return 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return 0;
    });
  };

  const sortedRentals = getSortedRentals();

  const headers = [
    // { label: '#', key: 'index' },
    { label: 'Date', key: 'created_at_formatted' },
    { label: 'Location', key: 'location' },
    { label: 'Rent', key: 'rent' },
    { label: 'Bedrooms', key: 'no_of_bedrooms' },
    { label: 'Estimated Profit', key: 'monthly_estimated_profit' },
    { label: 'Link', key: 'property_zillow_link' },
    { label: 'Zillow Property Status', key: 'property_status' },
  ];

  return (
    <div className="overflow-x-auto mt-6 w-full">
      <table className="w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-200">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700 cursor-pointer"
                onClick={() => header.key && handleSort(header.key)}
              >
                {header.label}
                {sortColumn === header.key && sortOrder && (
                  <span className="ml-2">
                    {sortOrder === 'asc' ? '⬆' : '⬇'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedRentals.length > 0 ? (
            sortedRentals.map((rental, idx) => (
              <RentalRow 
                key={`${rental.batch_id}-${idx}`}
                rental={rental}
                // index={idx + 1}
                onClick={() => handleRowClick(rental)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                No rental properties available
              </td>
            </tr>
          )}      
        </tbody>
      </table>
      {selectedRental && (
        <RentalDetailsModal rental={selectedRental} onClose={closeModal} />
      )}
    </div>
  );
};

export default RentalTable;

