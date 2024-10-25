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
    return <Layout><div>Loading...</div></Layout>; // Keep the layout wrapper even for loading state
  }

  if (isError) {
    return <Layout><div>Error loading data. Please try again.</div></Layout>; // Keep the layout for consistency
  }

  if (isSuccess && data) {
    return (
      <Layout>
        <div className="flex-1 p-6 bg-white shadow-md rounded-lg"> Adjusted padding and layout for dashboard
          {data.user_type === 'admin' ? <AdminDashboard /> : <UserDashboard />}
        </div>
      </Layout>
    );
  }

  return <Layout><div>No data available.</div></Layout>;
};

export default Dashboard;
