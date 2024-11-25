import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDocumentByIdQuery, useGetLeaseByIdQuery, useReviseLeaseMutation, useReviewDocumentsMutation } from '../services/api';
import UploadRevisionLeaseModal from '../components/UploadRevisionLeaseModal';
import Layout from '../components/Layout';
import ChatBox from '../components/ChatBox';
import { useSelector } from 'react-redux';
import { toggleRefreshDocuments } from '../store/slices/authSlice';
import { useDispatch} from 'react-redux';
import { RootState } from '@/store';
import { Document } from '@/types/leaseTypes';
import { toast } from 'react-toastify';
import LeaseBreadcrumb from '@/components/LeaseBreadcrumb';
import UploadIcon from '@/assets/images/UploadIcon.png';

const ViewNotes = () => {
  const { id, documentId } = useParams<{ id: string; documentId: string }>();

  const leaseId = id ? Number(id) : undefined;
  const docId = documentId ? Number(documentId) : undefined;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toggle = useSelector((state: RootState) => state.auth.refreshDocuments);

  const { data: lease, refetch: refetchLease } = useGetLeaseByIdQuery(id);
  const { data: document, isLoading, isError, refetch: refetchDocument } = useGetDocumentByIdQuery(documentId);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviseLease] = useReviseLeaseMutation();
  const [reviewDocuments] = useReviewDocumentsMutation();

  const handleUploadRevision = async (leaseId: number, formData: FormData) => {
    try {
      // console.log("FormData being sent:", Array.from(formData.entries()));
      const uploadedLeaseStatus = await reviseLease({ id: leaseId, revisedData: formData }).unwrap();
      setUploadModalOpen(false);
      
      // Trigger refetch
      refetchLease();
      refetchDocument();

      const documentIds = uploadedLeaseStatus.document_ids;

      if (documentIds && documentIds.length > 0) {
        try {
          await reviewDocuments({ documentIds });
          dispatch(toggleRefreshDocuments());
          // console.log("Documents reviewed successfully.");
        } catch (reviewError) {
          console.error("Error reviewing documents:", reviewError);
          toast.error('Failed to review documents');
        }
      }
    } catch (error) {
      console.error("Failed to upload revision:", error);
    }
  };

  // Automatically refetch when the toggle flag changes
  useEffect(() => {
    if (toggle) {
      refetchLease();
      refetchDocument();
    }
  }, [toggle, refetchLease, refetchDocument]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  if (isError || !lease) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">Error loading document details</div>
        </div>
      </Layout>
    );
  }

  const fullAddress = lease.address1 + (lease.address2 ? `, ${lease.address2}` : '');
  const currentDocument = (lease.documents as Document[]).find(doc => doc.id == Number(documentId));

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white w-full mx-auto">
        {/* Document Detail and Upload Button */}
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
          <div className="flex flex-col items-center md:items-start lg:pl-7">
            <h2 className="text-xl font-bold ">Document Detail</h2>
            <div>
              <LeaseBreadcrumb lease={lease}/>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-red-500 text-white px-4 py-3 lg:mr-7 rounded hover:bg-red-600 flex items-center space-x-2"
          >
            <img src={UploadIcon} alt="Upload Revision Icon" className='w-5 h-5'/>
            <span>Upload Revision</span>
          </button>
        </div>
  
        {/* Address, Document Name, and Status */}
        <div className="mt-4 text-left space-y-2 text-black font-medium text-lg pl-7">
          <p>{fullAddress || "No address available"}</p>
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
          leaseData={lease}
          onUpdateRevision={handleUploadRevision}
        />
      </div>

      {/* Chat Box Component */}
      <div className="w-full mt-6">
        <div className="w-full mx-auto">
          <ChatBox documentId={documentId} lease={lease} />
        </div>
      </div>
    </Layout>
  );
};

export default ViewNotes;
