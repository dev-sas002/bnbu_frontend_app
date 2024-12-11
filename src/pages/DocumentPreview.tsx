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

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.file_url) {
                const secureUrl = data.file_url.replace(/^http:\/\//, 'https://');
                setDocumentUrl(secureUrl);
                setError(null);
            } else {
                throw new Error('File URL not found in response.');
            }
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
