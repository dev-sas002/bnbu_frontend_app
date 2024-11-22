import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AdminDashboard from '../components/AdminDashboard';
import UserDashboard from '../components/UserDashboard';
import { useGetUserProfileQuery } from '@/services/api';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const { data, isLoading, isSuccess, isError } = useGetUserProfileQuery(undefined);
  const user = useSelector((state: RootState) => state.auth.user);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  if (isError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">Error loading data. Please try again.</div>
        </div>
      </Layout>
    );
  }

  if (isSuccess && data) {
    return (
      <Layout>
        <div className="flex-1 bg-white">
          {data.user_type === 'admin' ? <AdminDashboard /> : <UserDashboard />}
        </div>
      </Layout>
    );
  }

  return <Layout><div>No data available.</div></Layout>;
};

export default Dashboard;
