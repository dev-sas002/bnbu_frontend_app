// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as RootState).auth.token
      if (!token){
        token = localStorage.getItem("token")
      }
      // console.log("===> ",token)
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

    // Fetch a specific document by document ID
    getDocumentById: builder.query({
      query: (documentId) => `api/documents/${documentId}/`,
    }),

    // Review multiple documents by document IDs
    reviewDocuments: builder.mutation({
      query: ({ documentIds }) => ({
        url: 'api/documents/review/',  // Updated endpoint for batch document review action
        method: 'POST',
        body: { document_ids: documentIds }  // Send the document IDs as part of the request body
      }),
    }),


    // Chat with GPT about a specific document by document ID
    chatWithGpt: builder.mutation({
      query: ({ documentId, message }) => ({
        url: `/api/documents/${documentId}/chat/`, // Endpoint for chat action
        method: 'POST',
        body: { document_id: documentId, message },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Chat history for a specific document by document ID
    getChatHistory: builder.query({
      query: (documentId) => ({
        url: `/api/documents/${documentId}/get-chat-history/`, // Endpoint for chat history
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    getRegulations: builder.query({
      query: (page = 1) => ({
        url: `/api/regulations/?page=${page}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      keepUnusedDataFor: 0, // Prevent caching
    }),
    


    // Regulations: Create a new regulation
    createRegulation: builder.mutation({
      query: (regulationData) => ({
        url: '/api/regulations/',
        method: 'POST',
        body: regulationData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Regulations: Fetch a specific regulation by ID
    getRegulationById: builder.query({
      query: (id) => ({
        url: `/api/regulations/${id}/`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Regulations: Send a message to GPT about a specific regulation
    RegulationchatWithGpt: builder.mutation({
      query: ({ regulationId, message }) => ({
        url: `/api/regulations/${regulationId}/chat/`, // Endpoint for chat action
        method: 'POST',
        body: { regulation_id: regulationId, message },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Regulations: Get the chat history for a specific regulation
    RegulationgetChatHistory: builder.query({
      query: (regulationId) => ({
        url: `/api/regulations/${regulationId}/get-chat-history/`, // Endpoint for chat history
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Fetch a list of regulations with search functionality
    searchRegulations: builder.query({
      query: (params) => {
        const { page, query, startDate, endDate, status } = params || {};
        let url = `api/regulations/search/?`; // Updated endpoint for regulations search
        
        // Append page to the query if provided and defined
        if (page !== undefined) url += `page=${page}&`;

        // Append query (address, city, or area) to the query if provided
        if (query) url += `query=${encodeURIComponent(query)}&`;
        
        // Append startDate to the query if provided
        if (startDate) url += `start_date=${encodeURIComponent(startDate)}&`;
        
        // Append endDate to the query if provided
        if (endDate) url += `end_date=${encodeURIComponent(endDate)}&`;
        
        // Append status to the query if provided
        if (status) url += `status=${encodeURIComponent(status)}`;
        
        // Remove the last '&' if it exists
        if (url.endsWith('&')) {
          url = url.slice(0, -1);
        }
        
        return url;
      },
    }),

    // Upload properties mutation
    uploadProperties: builder.mutation({
      query: (file) => ({
        url: '/api/rental_properties/upload-properties/',
        method: 'POST',
        body: file,
      }),
    }),

    // Fetch all rental properties with pagination
    getAllProperties: builder.query({
      query: (page = 1) => `api/rental_properties/all-properties/?page=${page}`,  // Include page number in query
      keepUnusedDataFor: 0, // Prevent caching
    }),


    // Filtered list of rental properties with pagination
    filteredList: builder.query({
      query: (filters) => {
        const { min_profit, max_profit, status, batch_id, start_date, end_date, page = 1, pageSize = 10, all_batch_ids } = filters || {};

        // Create the payload for the request body
        const body: Record<string, string> = {
          min_profit,
          max_profit,
          status,
          batch_id,
          start_date,
          end_date,
          page,
          page_size: pageSize,
          all_batch_ids,
        };

        // Filter out undefined values from the body
        Object.keys(body).forEach((key) => {
          if (body[key] === undefined) {
            delete body[key];
          }
        });

        return {
          url: `/api/rental_properties/filtered-list/?page=${page}&page_size=${pageSize}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body), // Include the body in the request
        };
      },
      keepUnusedDataFor: 0, // Prevent caching
    }),

    // downloadCsv query based on filters (GET method)
    downloadCsv: builder.query({
      query: (filters) => {
        const { min_profit, max_profit, status, batch_id, start_date, end_date } = filters || {};
        
        // Prepare the query parameters
        const queryParams: Record<string, string> = {};
        if (min_profit) queryParams.min_profit = min_profit;
        if (max_profit) queryParams.max_profit = max_profit;
        if (status) queryParams.status = status;
        if (batch_id) queryParams.batch_id = batch_id;
        if (start_date) queryParams.start_date = start_date;
        if (end_date) queryParams.end_date = end_date;

        return {
          url: `api/rental_properties/download-csv/`,
          method: 'GET',
          params: queryParams,
          responseHandler: async (response) => {
            // Ensure the response is in text (CSV) format
            const csvText = await response.text();
            return csvText;
          },
        };
      },
    }),

    // Fetch task result by task_id
    getTaskResult: builder.query({
      query: (task_id) => {
        if (!task_id) {
          throw new Error("Task ID is required");
        }

        return {
          url: `/api/rental_properties/task-result/?task_id=${task_id}`,
          method: 'GET',
        };
      },
      keepUnusedDataFor: 0, // Prevent caching
    }),

    // Fetch task progress by task_id
    taskProgress: builder.query({
      query: (task_id) => {
        if (!task_id) {
          throw new Error("Task ID is required");
        }

        return {
          url: `/api/rental_properties/task-progress/?task_id=${task_id}`,
          method: 'GET',
        };
      },
      keepUnusedDataFor: 0, // Prevent caching
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
  useGetDocumentByIdQuery,
  useReviewDocumentsMutation,
  useChatWithGptMutation,
  useGetChatHistoryQuery,
  useGetRegulationsQuery,
  useCreateRegulationMutation,
  useGetRegulationByIdQuery,
  useRegulationchatWithGptMutation,
  useRegulationgetChatHistoryQuery,
  useSearchRegulationsQuery,
  useUploadPropertiesMutation,
  useFilteredListQuery,
  useGetAllPropertiesQuery,
  useDownloadCsvQuery,
  useGetTaskResultQuery,
  useTaskProgressQuery,

} = api
