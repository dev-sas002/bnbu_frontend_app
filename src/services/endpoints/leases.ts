import { baseApi, listTags } from '../baseApi';
import { buildQuery } from '../queryString';
import type { Page } from '@/types/api';
import type {
  Lease,
  LeaseSearchParams,
  ReviseLeaseResponse,
  UploadLeaseResponse,
} from '@/types/leaseTypes';

/**
 * Leases.
 *
 * Every write invalidates `Lease` and `Document`: uploading or revising a
 * lease creates documents, and `Document.save()` on the Django side mirrors
 * the newest document's status back onto its lease, so the two are never
 * independently stale.
 */
export const leasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllLeases: builder.query<Page<Lease>, number | void>({
      query: (page = 1) => `api/leases/?page=${page}`,
      providesTags: (result) => listTags('Lease', result?.results),
    }),

    searchLeases: builder.query<Page<Lease>, LeaseSearchParams | void>({
      query: (params) => {
        const { page, address, startDate, endDate, status } = params ?? {};
        return buildQuery('api/leases/search/', {
          page,
          address,
          start_date: startDate,
          end_date: endDate,
          status,
        });
      },
      providesTags: (result) => listTags('Lease', result?.results),
    }),

    getLeaseById: builder.query<Lease, string | number | undefined>({
      query: (id) => `api/leases/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Lease', id: id ?? 'LIST' }],
    }),

    uploadLease: builder.mutation<UploadLeaseResponse, FormData>({
      query: (leaseData) => ({
        url: 'api/leases/upload/',
        method: 'POST',
        body: leaseData,
      }),
      invalidatesTags: [
        { type: 'Lease', id: 'LIST' },
        { type: 'Document', id: 'LIST' },
      ],
    }),

    reviseLease: builder.mutation<ReviseLeaseResponse, { id: number; revisedData: FormData }>({
      query: ({ id, revisedData }) => ({
        url: `api/leases/${id}/revised/`,
        method: 'POST',
        body: revisedData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Lease', id },
        { type: 'Lease', id: 'LIST' },
        { type: 'Document', id: 'LIST' },
      ],
    }),

    updateLease: builder.mutation<Lease, Lease>({
      query: ({ id, ...leaseData }) => ({
        url: `api/leases/${id}/update/`,
        method: 'PUT',
        body: leaseData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Lease', id },
        { type: 'Lease', id: 'LIST' },
      ],
    }),

    deleteLease: builder.mutation<void, number>({
      query: (id) => ({ url: `api/leases/${id}/`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Lease', id },
        { type: 'Lease', id: 'LIST' },
        { type: 'Document', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllLeasesQuery,
  useSearchLeasesQuery,
  useGetLeaseByIdQuery,
  useUploadLeaseMutation,
  useReviseLeaseMutation,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
} = leasesApi;
