import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '@/services/api';
import { Button, Card, CardHeader, Modal, PageHeader, StatTile } from '@/ui';
import { PlusIcon } from '@/ui/icons';
import CategoryBars from '@/ui/charts/CategoryBars';
import UserForm, { UserFormValues } from './UserForm';
import UserList, { User } from './UserList';

/**
 * The admin view: account CRUD and a read on who is in the workspace.
 *
 * All the manual `refetch()` calls that used to follow every mutation are
 * gone — the endpoints invalidate the `User` tag and RTK Query refetches the
 * page that is actually on screen.
 */
const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: users, isLoading, isFetching, isError, refetch } = useGetUsersQuery(currentPage);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const rows = useMemo(() => users?.results ?? [], [users]);

  const roleBreakdown = useMemo(() => {
    const counts = rows.reduce<Record<string, number>>((accumulator, user) => {
      const key = user.user_type || 'unknown';
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const activeOnPage = rows.filter((user) => user.is_active).length;

  const openCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (selectedUser) {
        await updateUser({ ...values, id: selectedUser.id }).unwrap();
        toast.success('User updated');
      } else {
        await createUser(values).unwrap();
        toast.success('User created');
      }
      closeModal();
    } catch {
      toast.error(selectedUser ? 'Failed to update the user' : 'Failed to create the user');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete the user');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Accounts with access to the BnBu console."
        actions={
          <Button onClick={openCreate} icon={<PlusIcon className="h-4 w-4" />}>
            Create user
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total users"
          value={users?.count ?? '—'}
          caption="Across every page"
          loading={isLoading}
        />
        <StatTile
          label="Active on this page"
          value={`${activeOnPage} of ${rows.length}`}
          caption="Accounts able to sign in"
          loading={isLoading}
        />
        <StatTile
          label="Roles in use"
          value={roleBreakdown.length}
          caption="Distinct user types on this page"
          loading={isLoading}
        />
        <StatTile
          label="Page"
          value={currentPage}
          caption={users?.next ? 'More pages available' : 'Last page'}
          loading={isLoading}
        />
      </div>

      <UserList
        users={users}
        onEdit={(user) => {
          setSelectedUser(user);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        onCreate={openCreate}
      />

      <Card>
        <CardHeader
          title="Users by role"
          description={`The ${rows.length} ${rows.length === 1 ? 'account' : 'accounts'} on page ${currentPage}.`}
        />
        <div className="mt-4">
          <CategoryBars
            data={roleBreakdown}
            emptyMessage={isFetching ? 'Loading…' : 'No accounts on this page.'}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedUser ? 'Edit user' : 'Create user'}
        description={
          selectedUser
            ? `Update the account for ${selectedUser.email}.`
            : 'The new user sets their own password the first time they sign in.'
        }
      >
        <UserForm
          onSubmit={handleSubmit}
          initialData={selectedUser}
          onCancel={closeModal}
          submitting={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
