import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetLeaseByIdQuery, useGetDocumentNamesByLeaseIdQuery, useReviseLeaseMutation } from '../services/api';
import UploadRevisionLeaseModal from '../components/UploadRevisionLeaseModal';
import Layout from '../components/Layout';
import { Lease } from '@/types/leaseTypes';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString: string) => {
  // If the dateString is null or undefined, return "Invalid Date"
  if (!dateString) return "Invalid Date";

  // Try to create a date object
  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Handle invalid date gracefully
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const LeaseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: lease, isLoading, isError, refetch } = useGetLeaseByIdQuery(id);
  const { data: documents, refetch: refetchDocuments } = useGetDocumentNamesByLeaseIdQuery(id);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviseLease] = useReviseLeaseMutation();
  // Update the upload logic in LeaseDetail to convert Lease to FormData
  const handleUploadRevision = async (formData: FormData) => {
    try {
      console.log("FormData being sent:", Array.from(formData.entries()));
      await reviseLease({ id, revisedData: formData }).unwrap();
      setUploadModalOpen(false);
      refetch();
      refetchDocuments();
    } catch (error) {
      console.error("Failed to upload revision:", error);
    }
  };
  
  if (isLoading) return <Layout><div>Loading...</div></Layout>;
  if (isError || !lease) return <Layout><div>Error loading lease details</div></Layout>;

  // Concatenate address1 and address2, handling null or empty case for address2
  const fullAddress = lease.address1 + (lease.address2 ? `, ${lease.address2}` : '');

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Lease Detail</h2>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Upload Revision
          </button>
        </div>
        
        {/* Displaying full address below the lease detail */}
        <div className="mt-5">
          <p className="text-black text-left font-medium text-lg">{fullAddress}</p>
        </div>
        
        <table className="w-full table-auto divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">#</th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">Date</th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">Document Name</th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">Status</th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">View Document</th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">View Notes</th>
            </tr>
          </thead>
          <tbody>
            {documents?.map((doc, index) => {
              return (
                <tr key={`${doc.id}-${index}`} className="hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                  <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{formatDate(doc.uploaded_at)}</td>
                  <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap truncate" title={doc.name}>{doc.name}</td>
                  <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap" title={doc.status}>{doc.status}</td>
                  <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
                    <button onClick={() => {
                        console.log("Button clicked, navigating to preview");
                        navigate(`/preview/${doc.id}`);
                        }}>
                        View Document
                    </button>
                  </td>
                  <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
                    <button onClick={() => console.log("View notes clicked")} className="text-blue-500 hover:underline">
                      View Notes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Upload Revision Modal */}
        <UploadRevisionLeaseModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          leaseData={lease}
          onUpdateRevision={handleUploadRevision}
        />
      </div>
    </Layout>
  );
};

export default LeaseDetail;
