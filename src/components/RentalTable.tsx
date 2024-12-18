// RentalTable.tsx
import React, { useState } from 'react';
import RentalRow from './RentalRow';
import RentalDetailsModal from "./RentalDetailsModal";
import { RentalProperty } from '../types/rentalTypes';

interface RentalTableProps {
  rentals: RentalProperty[];
}

const RentalTable: React.FC<RentalTableProps> = ({ rentals = [] }) => {
  const [selectedRental, setSelectedRental] = useState<RentalProperty | null>(null);
  
  const handleRowClick = (rental: RentalProperty) => {
    setSelectedRental(rental);
  };

  const closeModal = () => {
    setSelectedRental(null);
  };
  return (
    <div className="overflow-x-auto mt-6 w-full">
      <table className="w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-200">
          <tr>
            {[
              '#', 
              'Date', 
              'Location', 
              'Rent', 
              'Bedrooms', 
              'Estimated Profit', 
              'Link', 
              'Zillow Property Status'
            ].map((header, idx) => (
              <th 
                key={idx} 
                className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">{header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rentals.length > 0 ? (
            rentals.map((rental, idx) => (
              <RentalRow 
                key={`${rental.batch_id}-${idx}`}
                rental={rental} 
                index={idx + 1} 
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

