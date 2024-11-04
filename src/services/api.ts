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

    // Lease API endpoints
    // Get all leases
    // getAllLeases: builder.query({
    //   query: () => 'api/leases/',
    // }),

    // Fetch all leases with pagination
    getAllLeases: builder.query({
      query: (page = 1) => `api/leases/?page=${page}`, // Include page number in query
      keepUnusedDataFor: 0, // Prevent caching
    }),

    // Upload lease
    uploadLease: builder.mutation({
      query: (leaseData) => ({
        url: 'api/leases/upload/',
        method: 'POST',
        body: leaseData,
      }),
    }),

    // Fetch a list of leases with search functionality
    searchLeases: builder.query({
      query: (params) => {
        const {page, address, startDate, endDate, status } = params || {};
        let query = `api/leases/search/?`;
        
        // Append page to the query if provided and defined
        if (page !== undefined) query += `page=${page}&`;

        // Append address to the query if provided
        if (address) query += `address=${encodeURIComponent(address)}&`;
        
        // Append startDate to the query if provided
        if (startDate) query += `start_date=${encodeURIComponent(startDate)}&`;
        
        // Append endDate to the query if provided
        if (endDate) query += `end_date=${encodeURIComponent(endDate)}&`;
        
        // Append status to the query if provided
        if (status) query += `status=${encodeURIComponent(status)}`;
        
        // Remove the last '&' if it exists
        if (query.endsWith('&')) {
          query = query.slice(0, -1);
        }
        
        return query;
      },
    }),


    // Fetch a single lease by ID
    getLeaseById: builder.query({
      query: (id) => `api/leases/${id}/`,
    }),

    // Revise lease documents for an existing lease
    reviseLease: builder.mutation({
      query: ({ id, revisedData }) => ({
        url: `api/leases/${id}/revised/`,
        method: 'POST',
        body: revisedData,
      }),
    }),

    // Update lease information
    updateLease: builder.mutation({
      query: ({ id, ...leaseData }) => ({
        url: `api/leases/${id}/update/`,  // Changed to call the update action
        method: 'PUT',                   // Changed from PUT to PATCH
        body: leaseData,
      }),
    }),

    // Delete a lease
    deleteLease: builder.mutation({
      query: (id) => ({
        url: `api/leases/${id}/`,  // This should still point to the delete action for the lease
        method: 'DELETE',
      }),
    }),

    // Fetch documents with pagination
    getDocuments: builder.query({
      query: (page = 1) => `api/documents/?page=${page}`, // Include page number in query
    }),

    // Fetch document names by lease ID
    getDocumentNamesByLeaseId: builder.query({
      query: (leaseId) => `api/documents/lease/${leaseId}/documents`,
    }),

    // Preview a specific document by document ID
    previewDocument: builder.query<Blob, { documentId: number }>({
      query: ({ documentId }) => `api/documents/preview/${documentId}/`,
      transformResponse: (response: Blob) => response, // Assuming the server responds with a Blob
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
  useGetAllLeasesQuery,
  useUploadLeaseMutation,
  useSearchLeasesQuery,
  useGetLeaseByIdQuery,
  useReviseLeaseMutation,
  useUpdateLeaseMutation, 
  useDeleteLeaseMutation,
  useGetDocumentsQuery,
  useGetDocumentNamesByLeaseIdQuery,
  usePreviewDocumentQuery,
} = api
