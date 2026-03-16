import { useGetChatHistoryQuery } from '@/services/api';
import { useEffect } from 'react';

const usePollingChatHistory = (documentId: string | undefined, shouldPoll: boolean) => {
  const { data, error, refetch } = useGetChatHistoryQuery(documentId, {
    skip: !documentId,
  });

  useEffect(() => {
    if (!documentId) return;

    const interval = setInterval(() => {
      if (shouldPoll) refetch();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [documentId, refetch, shouldPoll]);

  return { data, error };
};

export default usePollingChatHistory;
