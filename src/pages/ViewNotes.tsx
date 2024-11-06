import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDocumentByIdQuery, useGetLeaseByIdQuery, useReviseLeaseMutation } from '../services/api';
import UploadRevisionLeaseModal from '../components/UploadRevisionLeaseModal';
import Layout from '../components/Layout';
import ChatBox from '../components/ChatBox';

const ViewNotes = () => {
  // const { documentId } = useParams(); 
  const { id } = useParams();
  const { data: lease} = useGetLeaseByIdQuery(id);
  console.log("Lease data:", lease);
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { data: document, isLoading, isError, refetch } = useGetDocumentByIdQuery(documentId); // Fetch document-specific data
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviseLease] = useReviseLeaseMutation();

  const handleUploadRevision = async (formData : FormData) => {
    try {
      console.log("FormData being sent:", Array.from(formData.entries()));
      await reviseLease({ id, revisedData: formData }).unwrap(); // Use documentId for revision
      setUploadModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to upload revision:", error);
    }
  };

  if (isLoading) return <Layout><div>Loading...</div></Layout>;
  if (isError || !lease) return <Layout><div>Error loading document details</div></Layout>;

  const fullAddress = lease.address1 + (lease.address2 ? `, ${lease.address2}` : '');
  // Assuming lease.documents is the array of documents
  const currentDocument = lease.documents.find(doc => doc.id == documentId); 
  console.log(currentDocument, documentId)

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white w-full mx-auto">
          {/* Document Detail and Upload Button */}
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0">
            <div>
            <h2 className="text-xl font-bold">Document Detail</h2>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Upload Revision
            </button>
          </div>
  
          {/* Address, Document Name, and Status */}
          <div className="mt-4 text-left space-y-2 text-black font-medium text-lg">
            <p>{fullAddress || "No address available"}</p>
            {/* <p>Current Document: {lease.currentDocumentName || "<Document Name>"}</p> */}
            <p>Current Document: {currentDocument ? currentDocument.name : "<Document Name>"}</p>
            <p>
              Status:{" "}
              <span
                className={`${
                  currentDocument?.status === "Draft"
                    ? "bg-yellow-300 text-yellow-800"
                    : currentDocument?.status === "Rejected"
                    ? "bg-red-300 text-red-800"
                    : currentDocument?.status === "Approved"
                    ? "bg-green-300 text-green-800"
                    : "bg-gray-300 text-gray-800"
                } px-2 py-1 rounded`}
              >
                {currentDocument?.status || "No status available"}
              </span>
            </p>
          </div>
  
        {/* Upload Revision Modal */}
        <UploadRevisionLeaseModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          leaseData={lease} // Pass document-specific data
          onUpdateRevision={handleUploadRevision}
        />
      </div>
      {/* Chat Box Component */}
      <div className="w-full mt-6 md:mt-0">
          <div className="w-full max-w-5xl mx-auto">
            <ChatBox documentId={documentId} />
          </div>
        </div>
    </Layout>
  );
    
};

export default ViewNotes;
