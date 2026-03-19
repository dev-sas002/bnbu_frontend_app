import { baseApi, listTags } from '../baseApi';
import { buildQuery } from '../queryString';
import type { ChatHistoryResponse, ChatReply, Page } from '@/types/api';
import type { Regulation, RegulationCreate, RegulationSearchParams } from '@/types/regulationTypes';

/** Saved "can I run a short-term rental here?" questions and their answers. */
export const regulationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegulations: builder.query<Page<Regulation>, number | void>({
      query: (page = 1) => `api/regulations/?page=${page}`,
      providesTags: (result) => listTags('Regulation', result?.results),
    }),

    searchRegulations: builder.query<Page<Regulation>, RegulationSearchParams | void>({
      query: (params) => {
        const { page, query, startDate, endDate, status } = params ?? {};
        return buildQuery('api/regulations/search/', {
          page,
          query,
          start_date: startDate,
          end_date: endDate,
          status,
        });
      },
      providesTags: (result) => listTags('Regulation', result?.results),
    }),

    getRegulationById: builder.query<Regulation, string | number | undefined>({
      query: (id) => `api/regulations/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Regulation', id: id ?? 'LIST' }],
    }),

    createRegulation: builder.mutation<Regulation, RegulationCreate>({
      query: (regulationData) => ({
        url: 'api/regulations/',
        method: 'POST',
        body: regulationData,
      }),
      invalidatesTags: [{ type: 'Regulation', id: 'LIST' }],
    }),

    chatWithRegulation: builder.mutation<
      ChatReply,
      { regulationId: string | number; message: string }
    >({
      query: ({ regulationId, message }) => ({
        url: `api/regulations/${regulationId}/chat/`,
        method: 'POST',
        body: { regulation_id: regulationId, message },
      }),
      invalidatesTags: (_result, _error, { regulationId }) => [
        { type: 'RegulationChat', id: regulationId },
      ],
    }),

    getRegulationChatHistory: builder.query<ChatHistoryResponse, string | number | undefined>({
      query: (regulationId) => `api/regulations/${regulationId}/get-chat-history/`,
      providesTags: (_result, _error, regulationId) => [
        { type: 'RegulationChat', id: regulationId ?? 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRegulationsQuery,
  useSearchRegulationsQuery,
  useGetRegulationByIdQuery,
  useCreateRegulationMutation,
  useChatWithRegulationMutation,
  useGetRegulationChatHistoryQuery,
} = regulationsApi;
