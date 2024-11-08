// LeaseRow.tsx
import React from 'react';
import { Lease } from '../types/leaseTypes';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface LeaseRowProps {
  lease: Lease;
  index: number;
  onEditClick: (lease: Lease) => void;
  onUploadRevisionClick: (lease: Lease) => void;
}

const LeaseRow: React.FC<LeaseRowProps> = ({ lease, index, onEditClick }) => {
  const navigate = useNavigate();


  const handleRowClick = () => {
    navigate(`/lease/${lease.id}`);
  };

  return (
    <tr onClick={handleRowClick} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{index}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.date}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.address1 + ' ' + lease.address2}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.city}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.state}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.zip_code}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{lease.num_of_docs}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
        <span
          title={lease.status}
          className={`px-2 py-1 rounded ${
            lease.status === "Draft" ? "bg-yellow-300 text-yellow-800" 
            : lease.status === "Rejected" ? "bg-red-300 text-red-800" 
            : lease.status === "Approved" ? "bg-green-300 text-green-800" 
            : "bg-gray-300 text-gray-800"
          }`}
        >
          {lease.status}
        </span>
      </td>
      <td className="px-4 md:px-6 py-2 whitespace-nowrap">
        <button onClick={(e) => { e.stopPropagation(); onEditClick(lease); }} className="text-indigo-600 hover:text-indigo-900">
          <PencilIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export default LeaseRow;