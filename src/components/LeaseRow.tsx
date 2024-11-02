// LeaseRow.tsx
import React from 'react';
import { Lease } from '../types/leaseTypes';
import { PencilIcon } from '@heroicons/react/24/outline';

interface LeaseRowProps {
  lease: Lease;
  index: number;
  onEditClick: (lease: Lease) => void;
}

const LeaseRow: React.FC<LeaseRowProps> = ({ lease, index, onEditClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'text-gray-600';
      case 'Rejected':
        return 'text-red-600';
      case 'Approved':
        return 'text-green-600';
      default:
        return 'text-black';
    }
  };

  //console.log("LeaseRow props:", lease);


  return (
    <tr className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{index}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.date}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.address1 + ' ' + lease.address2}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.city}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.state}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.zip_code}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.num_of_docs}</td>
      <td className={`px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap ${getStatusColor(lease.status)}`}>
        {lease.status}
      </td>
      <td className="px-4 md:px-6 py-2 whitespace-nowrap">
        <button onClick={() => onEditClick(lease)} className="text-indigo-600 hover:text-indigo-900">
          <PencilIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export default LeaseRow;