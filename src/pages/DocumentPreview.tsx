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
          const apiUrl = import.meta.env.VITE_API_URL;
          const response = await fetch(`${apiUrl}api/documents/preview/${documentId}/`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
        //   console.log("response:", response);
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {documentUrl && (
                <div style={{ width: '100%', maxWidth: '100%', padding: '0 1rem' }}>
                <iframe
                    src={documentUrl}
                    style={{
                    width: '100%',
                    height: 'calc(100vh - 100px)', // Adjusts height based on viewport
                    maxWidth: '100%',
                    border: 'none',
                    }}
                    title="Document Preview"
                />
                </div>
            )}
        </div>

    );
};

export default DocumentPreview;