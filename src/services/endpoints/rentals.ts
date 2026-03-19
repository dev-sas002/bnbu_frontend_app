import { baseApi, listTags } from '../baseApi';
import { compact } from '../queryString';
import type { EnvelopedPage, Page, TaskProgress, TaskResult, UploadPropertiesResponse } from '@/types/api';
import {
  FilteredRentalResults,
  normaliseRentalProperty,
  RawRentalProperty,
  RentalFilters,
  RentalListArgs,
  RentalProperty,
} from '@/types/rentalTypes';

const normaliseList = (rows: RawRentalProperty[] | undefined): RentalProperty[] =>
  Array.isArray(rows) ? rows.map(normaliseRentalProperty) : [];

/** The Rental Analyzer: spreadsheet upload, the priced list, and CSV export. */
export const rentalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadProperties: builder.mutation<UploadPropertiesResponse, FormData>({
      query: (file) => ({
        url: 'api/rental_properties/upload-properties/',
        method: 'POST',
        body: file,
      }),
      // The rows do not exist yet — the Celery task creates them — so the
      // list is invalidated when the task finishes, not here.
      invalidatesTags: [{ type: 'RentalTask', id: 'LIST' }],
    }),

    getAllProperties: builder.query<Page<RentalProperty>, number | void>({
      query: (page = 1) => `api/rental_properties/all-properties/?page=${page}`,
      transformResponse: (response: Page<RawRentalProperty>) => ({
        ...response,
        results: normaliseList(response?.results),
      }),
      providesTags: (result) => listTags('RentalProperty', result?.results),
    }),

    /**
     * The odd one out: filters go in a POST body while paging stays in the
     * query string, and `results` is an object rather than a list.
     */
    filteredList: builder.query<EnvelopedPage<FilteredRentalResults>, RentalListArgs | void>({
      query: (filters) => {
        const {
          min_profit,
          max_profit,
          status,
          batch_id,
          start_date,
          end_date,
          page = 1,
          pageSize = 10,
        } = filters ?? {};

        return {
          url: `api/rental_properties/filtered-list/?page=${page}&page_size=${pageSize}`,
          method: 'POST',
          body: compact({
            min_profit,
            max_profit,
            status,
            batch_id,
            start_date,
            end_date,
            page,
            page_size: pageSize,
          }),
        };
      },
      transformResponse: (response: EnvelopedPage<Partial<FilteredRentalResults>>) => ({
        count: response?.count ?? 0,
        next: response?.next ?? null,
        previous: response?.previous ?? null,
        results: {
          properties: normaliseList(response?.results?.properties as RawRentalProperty[]),
          all_batch_ids: response?.results?.all_batch_ids ?? [],
        },
      }),
      providesTags: (result) => listTags('RentalProperty', result?.results.properties),
    }),

    downloadCsv: builder.query<string, RentalFilters | void>({
      query: (filters) => {
        const { min_profit, max_profit, status, batch_id, start_date, end_date } = filters ?? {};
        return {
          url: 'api/rental_properties/download-csv/',
          method: 'GET',
          params: compact({ min_profit, max_profit, status, batch_id, start_date, end_date }),
          responseHandler: (response) => response.text(),
        };
      },
      providesTags: [{ type: 'RentalProperty', id: 'LIST' }],
    }),

    getTaskResult: builder.query<TaskResult, string | null | undefined>({
      query: (taskId) => `api/rental_properties/task-result/?task_id=${taskId}`,
      providesTags: (_result, _error, taskId) => [{ type: 'RentalTask', id: taskId ?? 'LIST' }],
    }),

    taskProgress: builder.query<TaskProgress, string | null | undefined>({
      query: (taskId) => `api/rental_properties/task-progress/?task_id=${taskId}`,
      providesTags: (_result, _error, taskId) => [{ type: 'RentalTask', id: taskId ?? 'LIST' }],
    }),
  }),
});

export const {
  useUploadPropertiesMutation,
  useGetAllPropertiesQuery,
  useFilteredListQuery,
  useDownloadCsvQuery,
  useGetTaskResultQuery,
  useTaskProgressQuery,
} = rentalsApi;
