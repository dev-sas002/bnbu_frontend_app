// RentalRow.tsx
import React from 'react';
import { RentalProperty, RentalPropertyStatus } from '../types/rentalTypes';

interface RentalRowProps {
  rental: RentalProperty;
  onClick: () => void;
  // index: number;
}

const RentalRow: React.FC<RentalRowProps> = ({ rental, onClick}) => {
  return (
    <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer">
      {/* <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{index}</td> */}
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{rental.created_at_formatted || 'N/A'}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{rental.location || 'N/A'}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">${rental.rent?.toLocaleString() || 'N/A'}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{rental.no_of_bedrooms || 'N/A'}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">${rental.monthly_estimated_profit?.toLocaleString() || 'N/A'}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
        <a 
          href={rental.property_zillow_link}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-red-600 underline">
          View Property
        </a>
      </td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
        <span
          title={rental.property_status}
          className={`px-2 py-1 rounded ${
            rental.property_status === RentalPropertyStatus.Approved ? "bg-green-300 text-green-800" 
            : rental.property_status === RentalPropertyStatus.Pending ? "bg-yellow-300 text-yellow-800" 
            : rental.property_status === RentalPropertyStatus.Rejected ? "bg-red-300 text-red-800" 
            : "bg-gray-300 text-gray-800"
          }`}
        >
          {rental.property_status}
        </span>
      </td>
    </tr>
  );
};

export default RentalRow;