import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import { useGetUserProfileQuery } from '@/services/api';
import { ErrorState, Spinner } from '@/ui';

/**
 * Branches on the signed-in user's role. The shell (header, sidebar) is
 * supplied by the route, so this renders only the page body — the loading and
 * error branches used to each mount their own copy of `<Layout>`.
 */
const Dashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetUserProfileQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading your dashboard…" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Could not load your profile"
        description="The API did not return an account for this session."
        onRetry={refetch}
      />
    );
  }

  return data.user_type === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;
