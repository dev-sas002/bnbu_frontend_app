import React, { useMemo } from 'react';
import { Button, Column, DataTable, Pagination, StatusBadge } from '@/ui';
import { PencilIcon, TrashIcon } from '@/ui/icons';
import type { StatusVocabulary } from '@/ui/statusRegistry';

export interface User {
  id: number;
  email: string;
  user_type: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

/** DRF-style paginated page of users. */
export interface UserPage {
  results?: User[];
  next?: string | null;
  previous?: string | null;
  count?: number;
}

interface UserListProps {
  users?: UserPage | null;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onCreate?: () => void;
}

/** Account state is a two-value vocabulary, so it gets its own registry entry. */
const ACCOUNT_STATUSES: StatusVocabulary = {
  Active: { tone: 'positive', description: 'Can sign in' },
  Inactive: { tone: 'neutral', description: 'Sign-in disabled' },
};

const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  loading = false,
  error = false,
  onRetry,
  onCreate,
}) => {
  const rows = users?.results ?? [];

  const columns = useMemo<Array<Column<User>>>(
    () => [
      {
        key: 'email',
        header: 'Email',
        sortValue: (user) => user.email,
        render: (user) => <span className="font-medium text-ink">{user.email}</span>,
      },
      {
        key: 'name',
        header: 'Name',
        sortValue: (user) => `${user.last_name} ${user.first_name}`,
        render: (user) => [user.first_name, user.last_name].filter(Boolean).join(' ') || '—',
      },
      {
        key: 'user_type',
        header: 'Role',
        sortValue: (user) => user.user_type,
        secondary: true,
        render: (user) => <span className="capitalize">{user.user_type}</span>,
      },
      {
        key: 'is_active',
        header: 'Status',
        sortValue: (user) => (user.is_active ? 1 : 0),
        render: (user) => (
          <StatusBadge vocabulary={ACCOUNT_STATUSES} value={user.is_active ? 'Active' : 'Inactive'} />
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (user) => (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Edit"
              onClick={() => onEdit(user)}
              icon={<PencilIcon className="h-4 w-4" />}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Delete"
              className="hover:text-negative-fg"
              onClick={() => onDelete(user.id)}
              icon={<TrashIcon className="h-4 w-4" />}
            />
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <DataTable
        className="rounded-none border-0 shadow-none"
        caption="Console users"
        columns={columns}
        rows={rows}
        rowKey={(user) => user.id}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No users on this page"
        emptyDescription="Create the first account, or step back to an earlier page."
        emptyAction={onCreate ? { label: 'Create a user', onClick: onCreate } : undefined}
      />
      <Pagination
        page={currentPage}
        onPageChange={setCurrentPage}
        hasNext={Boolean(users?.next)}
        count={users?.count}
        pageSize={users?.count !== undefined ? 10 : undefined}
      />
    </div>
  );
};

export default UserList;
