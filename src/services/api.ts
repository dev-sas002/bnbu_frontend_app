// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as RootState).auth.token
      if (!token){
        token = localStorage.getItem("token")
      }
      console.log("===> ",token)
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    // Login mutation to get the token
    login: builder.mutation({
      query: (credentials) => ({
        url: 'api/token/',
        method: 'POST',
        body: credentials,
      }),
    }),

    // // Fetch users (for admin)
    // getUsers: builder.query({
    //   query: () => 'account/users/',
    // }),

    getUsers: builder.query({
      query: (page = 1) => `account/users/?page=${page}`, // Default to the first page
      keepUnusedDataFor: 0, // Prevent caching
    }),
    

    // Create a user (for admin)
    createUser: builder.mutation({
      query: (userData) => ({
        url: 'account/users/',
        method: 'POST',
        body: userData,
      }),
    }),

    // Update user information (for admin)
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `account/users/${id}/`,
        method: 'PUT',
        body: userData,
      }),
    }),

    // Delete a user (for admin)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `account/users/${id}/`,
        method: 'DELETE',
      }),
    }),

    // First-time password update
    updatePassword: builder.mutation({
      query: ({ id, passwordData }) => ({
        url: `account/users/update-password/${id}/`,
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Password change endpoint (for authenticated users)
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: 'account/password/change/',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Password reset endpoint (request reset link)
    resetPassword: builder.mutation({
      query: (email) => ({
        url: 'account/password/reset/',
        method: 'POST',
        body: { email },
      }),
    }),

    // Fetch user dashboard data
    getDashboard: builder.query({
      query: () => 'account/dashboard/',
    }),

    // Fetch user profile information
    getUserProfile: builder.query({
      query: () => 'account/profile/',
    }),

    // Logout endpoint
    logout: builder.mutation({
      query: () => ({
        url: 'account/logout/',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdatePasswordMutation,
  useChangePasswordMutation,   
  useResetPasswordMutation, 
  useGetDashboardQuery,
  useGetUserProfileQuery,
  useLogoutMutation,
} = api
