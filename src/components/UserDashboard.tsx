// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/UserDashboard.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useGetUserProfileQuery} from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const UserDashboard: React.FC = () => {
  const { data: user, isLoading } = useGetUserProfileQuery(undefined);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  // console.log('User:', user);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-gray-700">Loading user information...</div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">No user information available.</div>
        </div>
      </Layout>
    );
  }


  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-4xl pt-8 p-4 h-full sm:p-6 lg:p-8 mx-auto">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          User Information
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
          </div>
          <div className="bg-white px-4 py-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">First Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.first_name}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.last_name}</dd>
          </div>
          <div className="bg-white px-4 py-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">User Type</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.user_type}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {user.is_active ? 'Active' : 'Inactive'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default UserDashboard;
