import { baseApi, listTags } from '../baseApi';
import type { ChatHistoryResponse, ChatReply, Page } from '@/types/api';
import type { Document } from '@/types/leaseTypes';

/**
 * Lease documents and the GPT review over them.
 *
 * `DocumentChat` is a separate tag from `Document` because the chat history is
 * polled while an analysis is running: invalidating it must not drag the
 * lease's document list along on every tick.
 */
export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<Page<Document>, number | void>({
      query: (page = 1) => `api/documents/?page=${page}`,
      providesTags: (result) => listTags('Document', result?.results),
    }),

    getDocumentNamesByLeaseId: builder.query<Document[], string | number | undefined>({
      // Trailing slash matters: DRF's router registers this action with one,
      // so the slash-less form relied on Django's APPEND_SLASH redirect and
      // paid an extra round trip on every load.
      query: (leaseId) => `api/documents/lease/${leaseId}/documents/`,
      providesTags: (result) => listTags('Document', result),
    }),

    getDocumentById: builder.query<Document, string | number | undefined>({
      query: (documentId) => `api/documents/${documentId}/`,
      providesTags: (_result, _error, id) => [{ type: 'Document', id: id ?? 'LIST' }],
    }),

    /** Returns a signed URL for the stored file, not the bytes. */
    previewDocument: builder.query<{ file_url: string }, string | number | undefined>({
      query: (documentId) => `api/documents/preview/${documentId}/`,
      providesTags: (_result, _error, id) => [{ type: 'Document', id: id ?? 'LIST' }],
    }),

    reviewDocuments: builder.mutation<unknown, { documentIds: number[] }>({
      query: ({ documentIds }) => ({
        url: 'api/documents/review/',
        method: 'POST',
        body: { document_ids: documentIds },
      }),
      // Kicking off a review changes both the document status and, through
      // the Django save hook, the parent lease's.
      invalidatesTags: [
        { type: 'Document', id: 'LIST' },
        { type: 'Lease', id: 'LIST' },
        { type: 'DocumentChat', id: 'LIST' },
      ],
    }),

    chatWithGpt: builder.mutation<ChatReply, { documentId: string | number; message: string }>({
      query: ({ documentId, message }) => ({
        url: `api/documents/${documentId}/chat/`,
        method: 'POST',
        body: { document_id: documentId, message },
      }),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: 'DocumentChat', id: documentId },
      ],
    }),

    getChatHistory: builder.query<ChatHistoryResponse, string | number | undefined>({
      query: (documentId) => `api/documents/${documentId}/get-chat-history/`,
      providesTags: (_result, _error, documentId) => [
        { type: 'DocumentChat', id: documentId ?? 'LIST' },
        { type: 'DocumentChat', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentNamesByLeaseIdQuery,
  useGetDocumentByIdQuery,
  usePreviewDocumentQuery,
  useReviewDocumentsMutation,
  useChatWithGptMutation,
  useGetChatHistoryQuery,
} = documentsApi;
