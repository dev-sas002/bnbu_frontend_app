import { baseApi } from '../baseApi';
import type { ApiUser, LoginRequest, TokenPair } from '@/types/api';

/** Authentication, the signed-in user's own profile, and password changes. */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenPair, LoginRequest>({
      query: (credentials) => ({
        url: 'api/token/',
        method: 'POST',
        body: credentials,
      }),
      // A fresh session must not see the previous user's cached rows.
      invalidatesTags: ['Profile', 'User', 'Lease', 'Document', 'Regulation', 'RentalProperty'],
    }),

    logout: builder.mutation<{ message?: string }, void>({
      query: () => ({ url: 'account/logout/', method: 'POST' }),
      invalidatesTags: ['Profile', 'User', 'Lease', 'Document', 'Regulation', 'RentalProperty'],
    }),

    getUserProfile: builder.query<ApiUser, void>({
      query: () => 'account/profile/',
      providesTags: ['Profile'],
    }),

    getDashboard: builder.query<Record<string, unknown>, void>({
      query: () => 'account/dashboard/',
      providesTags: ['Profile'],
    }),

    /** First-login password set, addressed by user id and not authenticated. */
    updatePassword: builder.mutation<
      { message?: string },
      { id: string | number | undefined; passwordData: { password: string } }
    >({
      query: ({ id, passwordData }) => ({
        url: `account/users/update-password/${id}/`,
        method: 'PUT',
        body: passwordData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),

    changePassword: builder.mutation<
      { message?: string },
      { old_password: string; new_password: string; confirm_new_password: string }
    >({
      query: (passwordData) => ({
        url: 'account/password/change/',
        method: 'POST',
        body: passwordData,
      }),
    }),

    resetPassword: builder.mutation<{ message?: string }, string>({
      query: (email) => ({
        url: 'account/password/reset/',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetUserProfileQuery,
  useGetDashboardQuery,
  useUpdatePasswordMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
} = authApi;
