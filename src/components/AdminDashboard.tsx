import React, { useState, useEffect } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useLogoutMutation } from '../services/api';
import { toast } from 'react-toastify';
import UserForm from './UserForm';
import UserList, { User } from './UserList';
import Chart from './Chart';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: users, isLoading, isError, refetch } = useGetUsersQuery(currentPage);
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userList, setUserList] = useState<User[]>(users?.results || []); // Local state for user list
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (users) {
      setUserList(users.results); // Update local user list whenever fetched users change
    }
  }, [users]);

  const handleCreateUser = async (userData) => {
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

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser({ id: userData.id, ...userData }).unwrap();
      toast.success('User updated successfully');
      refetch(); // Refetch the users after updating a user
      setSelectedUser(null);
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted successfully');
      refetch(); // Refetch the users after deleting a user
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  useEffect(() => {
    refetch(); // Fetch data on component mount and when currentPage changes
  }, [currentPage, refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading users</div>;

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setIsCreating(true);
            setIsModalOpen(true);
            setSelectedUser(null);
          }}
        >
          Create New User
        </button>

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
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">User Statistics for Page {currentPage}</h2>
        <Chart data={userList} /> {/* Use local state for user statistics */}
      </div>
      <div className="px-4 py-5">
        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
