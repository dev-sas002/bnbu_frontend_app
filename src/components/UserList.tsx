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
  users : any
  onEdit: (user: User) => void
  onDelete: (id: number) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

const UserList: React.FC<UserListProps> = ({users, onEdit, onDelete, currentPage, setCurrentPage}) => {


  return (
    <div className="mt-8">
      <div className="relative overflow-x-auto shadow-md">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">Email</th>
              <th scope="col" className="px-6 py-3 text-center">First Name</th>
              <th scope="col" className="px-6 py-3 text-center">Last Name</th>
              <th scope="col" className="px-6 py-3 text-center">User Type</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="odd:bg-white even:bg-gray-50 border-b">
            {users.results.map((user: User) => (
              <tr key={user.id} className='border-b'>
                <td className="px-6 py-4 text-center text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-center text-gray-500">{user.first_name}</td>
                <td className="px-6 py-4 text-center text-gray-500">{user.last_name}</td>
                <td className="px-6 py-4 text-center text-gray-500">{user.user_type}</td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {user.is_active ? 'Active' : 'Inactive'}
                </td>
                <td className="px-6 py-4 text-center font-medium">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50 hover:bg-red-600"
          >
            Previous
          </button>
          <span className="text-gray-500">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!users.next}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50 hover:bg-red-600"
          >
            Next
          </button>
      </div>
    </div>
  )
}


export default UserList
