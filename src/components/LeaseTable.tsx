import React, { useState } from 'react';
import LeaseRow from './LeaseRow';
import { Lease } from '../types/leaseTypes';
import UploadLeaseModal from './UploadLeaseModal';

interface LeaseTableProps {
  leases: Lease[];
  onUpdate: (leaseData: Lease) => void;
}

const LeaseTable: React.FC<LeaseTableProps> = ({ leases = [], onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  const handleEditClick = (lease: Lease) => {
    setSelectedLease(lease);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLease(null);
  };

  return (
    <div className="overflow-x-auto mt-6 w-full">
      <table className="w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-200">
          <tr>
            {["#", "Date", "Address", "City", "State", "Zip", "# of Docs", "Status", "Edit"].map((header, idx) => (
              <th
                key={idx}
                className="px-4 md:px-6 py-3 text-left text-xs font-bold uppercase text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leases.length > 0 ? (
            leases.map((lease, index) => (
              <LeaseRow
                key={lease.id}
                lease={lease}
                index={index + 1}
                onEditClick={handleEditClick}
              />
            ))
          ) : (
            <tr>
              <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                No leases available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Render modal for editing */}
      <UploadLeaseModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpload={console.log} // Replace with actual upload logic if needed
        leaseData={selectedLease}
        isEditMode={true} // Set to true for editing
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default LeaseTable;
