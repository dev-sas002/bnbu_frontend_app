import React, {useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useGetRegulationByIdQuery } from '../services/api';
import Layout from '../components/Layout';
import RegulationChatBox from '../components/RegulationChatBox';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const ViewRegulationChat = () => {
  const { regulationId } = useParams();
  const { data: regulation, isLoading, isError, refetch } = useGetRegulationByIdQuery(regulationId);
  const toggle = useSelector((state: RootState) => state.auth.refreshRegulations);
  useEffect(() => {
    refetch();
  }, [toggle])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  if (isError || !regulation) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">Error loading regulation details</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full mt-6">
        <div className="w-full mx-auto">
          <RegulationChatBox regulation={regulation} />
        </div>
      </div>
    </Layout>
  );
};

export default ViewRegulationChat;
