import { baseApi, listTags } from '../baseApi';
import type { ApiUser, Page } from '@/types/api';

export type UserWriteModel = Omit<ApiUser, 'id'> & { id?: number | string };

/** Admin-only user CRUD. */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<Page<ApiUser>, number | void>({
      query: (page = 1) => `account/users/?page=${page}`,
      // Tagging the page replaced `keepUnusedDataFor: 0` plus a manual
      // refetch() after every create/update/delete.
      providesTags: (result) => listTags('User', result?.results),
    }),

    createUser: builder.mutation<ApiUser, UserWriteModel>({
      query: (userData) => ({
        url: 'account/users/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<ApiUser, UserWriteModel & { id: number | string }>({
      query: ({ id, ...userData }) => ({
        url: `account/users/${id}/`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `account/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
