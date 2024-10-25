// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/UserList.tsx
import React, { useState } from 'react'
import { useGetUsersQuery } from '../services/api'

export interface User {
  id: number
  email: string
  user_type: string
  first_name: string
  last_name: string
  is_active: boolean
}

interface UserListProps {
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

const UserList: React.FC<UserListProps> = ({ onEdit, onDelete }) => {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useGetUsersQuery(page)

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading users</div>

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">User List</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Name
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Name
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Type
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.results.map((user: User) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.user_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {user.is_active ? 'Active' : 'Inactive'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!data.next}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserList
