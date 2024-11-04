import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


const DocumentPreview: React.FC = () => {
    const [documentUrl, setDocumentUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const documentId = useParams<{ documentId: string }>().documentId;

    useEffect(() => {
        handlePreview();
    }, [documentId]);

    const handlePreview = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
          setError('No authorization token found.');
          return;
      }
  
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/documents/preview/${documentId}/`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
          console.log("response:", response);
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
  
          // Log to confirm the blob data and type
          const blob = await response.blob();
  
          // Create a URL for the blob and set it as document URL
          const url = URL.createObjectURL(blob);
          setDocumentUrl(url);
          setError(null);
      } catch (err) {
          console.error('Error fetching document:', err);
          setError('Error fetching document.');
      }
  };
  

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {documentUrl && (
                <iframe
                    src={documentUrl}
                    width="1700"
                    height="950"
                    title="Document Preview"
                />
            )}
        </div>
    );
};

export default DocumentPreview;