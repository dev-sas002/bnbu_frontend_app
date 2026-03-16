/**
 * Shared shapes for the BnBu API.
 *
 * These are hand-written against the Django serializers in the sibling
 * `bnbu_backend_api` repo. Where the API is inconsistent, the comment says so
 * — the frontend's job is to absorb that, not to pretend it is not there.
 */

/** The standard DRF `PageNumberPagination` envelope. */
export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * `filtered-list/` wraps an object rather than a list: the same paginator,
 * but `results` holds the page of properties plus the batch ids across the
 * whole filtered set.
 */
export interface EnvelopedPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T;
}

export type UserType = 'admin' | 'research' | 'coach' | 'client' | 'customer';

export interface ApiUser {
  id: number;
  email: string;
  /** Always `null`: the column was dropped but the serializer still lists it. */
  username?: string | null;
  first_name: string;
  last_name: string;
  user_type: UserType | string;
  is_active: boolean;
  is_first_login?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** `api/token/` returns the pair and nothing else — no user payload. */
export interface TokenPair {
  access: string;
  refresh: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content?: string;
  timestamp?: string;
}

/**
 * The analysis blob. Written by the backend as
 * `{status, message, created_time}` but re-keyed to `timestamp` by the
 * get-chat-history views, so both spellings are declared.
 */
export interface GptAnalysis {
  status?: string | null;
  message?: string | null;
  timestamp?: string | null;
  created_time?: string | null;
}

export interface ChatHistoryResponse {
  gpt_response: GptAnalysis | null;
  chat_history: ChatTurn[];
  /**
   * Documents only. `str(datetime)` on the Django side, so it is
   * `2025-09-02 18:22:41.512345+00:00` — a space, not a `T`.
   */
  document_uploaded_at?: string | null;
}

export interface ChatReply {
  response: string;
  chat_history: ChatTurn[];
  summary?: string | null;
}

export interface TaskProgress {
  success: boolean;
  state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE' | string;
  progress: number;
  message?: string;
  error?: string;
  /** JSON-encoded string of the merged rows, not an object. */
  result?: string | null;
}

export interface TaskResult {
  success: boolean;
  message: string;
  error?: string;
  result?: string | null;
}

export interface UploadPropertiesResponse {
  success: boolean;
  message: string;
  task_id: string;
  batch_id?: number;
}
