// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation} from '../services/api';
import { toast } from 'react-toastify';
import UserForm from './UserForm';
import UserList, { User } from './UserList';
import Chart from './Chart';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Layout from './Layout';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: users, isLoading, isError, refetch } = useGetUsersQuery(currentPage);
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userList, setUserList] = useState<User[]>(users?.results || []); // Local state for user list
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (users) {
      setUserList(users.results); // Update local user list whenever fetched users change
    }
  }, [users]);

  const handleCreateUser = async (userData : User ) => {
    try {
      await createUser(userData).unwrap();
      toast.success('User created successfully');
      refetch(); // Refetch the users after creating a new user
      setIsModalOpen(false);
      setIsCreating(false);
    } catch (err) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (userData : User ) => {
    try {
      await updateUser({...userData, id: userData.id }).unwrap();
      toast.success('User updated successfully');
      refetch(); // Refetch the users after updating a user
      setSelectedUser(null);
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id : number) => {
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted successfully');
      refetch(); // Refetch the users after deleting a user
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    refetch(); // Fetch data on component mount and when currentPage changes
  }, [currentPage, refetch]);

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
          <div className="text-lg text-red-500">Error loading users</div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="p-4 flex-1 bg-white w-full mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
        <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold">Dashboard</h2> 
        </div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => {
            setIsCreating(true);
            setIsModalOpen(true);
            setSelectedUser(null);
          }}
          >
          Create New User
        </button>
      </div>

        <Modal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          setIsCreating(false);
          setSelectedUser(null);
        }}>
          {isCreating ? (
            <UserForm
              onSubmit={handleCreateUser}
              initialData={null}
              onCancel={() => {
                setIsCreating(false);
                setIsModalOpen(false);
              }}
            />
          ) : selectedUser ? (
            <UserForm
              onSubmit={handleUpdateUser}
              initialData={selectedUser}
              onCancel={() => {
                setSelectedUser(null);
                setIsModalOpen(false);
              }}
            />
          ) : null}
        </Modal>

        <UserList
          users={users} // Use local state for users
          onEdit={(user) => {
            setSelectedUser(user);
            setIsCreating(false);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteUser}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      <div className='p-10 flex-1 bg-white w-full mx-auto'>
        <h2 className="text-2xl font-bold mb-4">User Statistics for Page {currentPage}</h2>
        <Chart data={userList} /> {/* Use local state for user statistics */}
      </div>
    </div>
  );
};

export default AdminDashboard;
