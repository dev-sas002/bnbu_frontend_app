import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { demoBaseQuery, isDemoMode } from '../demo/demoBaseQuery';
import { Mutex } from './mutex';
import type { RootState } from '../store';

/**
 * The single RTK Query instance.
 *
 * Endpoints live in `services/endpoints/*` and attach themselves with
 * `injectEndpoints`, so this file owns exactly three concerns: where the API
 * is, how a request is authenticated, and what the cache tags are.
 */

// The .env.* files carrying VITE_API_URL are gitignored, so a fresh checkout
// has no value for it. `baseUrl: undefined` made every request resolve against
// the page's own origin and 404 silently, which is much harder to diagnose than
// a wrong-but-visible default. Matches the .env.development value and the
// Dockerfile's VITE_API_URL build arg.
const DEFAULT_API_BASE_URL = 'http://localhost:8000/';

const resolveApiBaseUrl = (): string => {
  const configured = import.meta.env.VITE_API_URL;
  if (!configured) {
    console.warn(
      `VITE_API_URL is not set; falling back to ${DEFAULT_API_BASE_URL}. ` +
        'Set it in .env.development / .env.production.'
    );
    return DEFAULT_API_BASE_URL;
  }
  // Callers append paths directly (`${API_BASE_URL}api/documents/...`).
  return configured.endsWith('/') ? configured : `${configured}/`;
};

export const API_BASE_URL = resolveApiBaseUrl();

export const ACCESS_TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // The store is the source of truth; localStorage is the cold-start
    // fallback, for the first render after a page reload.
    const token =
      (getState() as RootState).auth.token ?? localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Serialises refresh attempts. Without it, a dashboard that fires six queries
// at once would fire six refreshes on expiry, five of which race the sixth's
// rotation and fail.
const refreshMutex = new Mutex();

const isUnauthorized = (error?: FetchBaseQueryError): boolean =>
  Boolean(error && 'status' in error && error.status === 401);

/**
 * Wraps the base query with a single-flight token refresh.
 *
 * On a 401 we try `api/token/refresh/` once with the stored refresh token. If
 * that works the original request is replayed transparently; if it does not,
 * the session is cleared and `auth/sessionExpired` is dispatched, which the
 * app listens for to bounce the user to the login page. Previously an expired
 * JWT simply made every request fail with no recovery and no signal.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  await refreshMutex.waitForUnlock();
  let result = await rawBaseQuery(args, apiContext, extraOptions);

  if (!isUnauthorized(result.error)) return result;

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    apiContext.dispatch({ type: 'auth/sessionExpired' });
    return result;
  }

  if (refreshMutex.isLocked()) {
    // Another request is already refreshing; wait for it and retry once.
    await refreshMutex.waitForUnlock();
    return rawBaseQuery(args, apiContext, extraOptions);
  }

  const release = await refreshMutex.acquire();
  try {
    const refreshResult = await rawBaseQuery(
      { url: 'api/token/refresh/', method: 'POST', body: { refresh: refreshToken } },
      apiContext,
      extraOptions
    );

    const access = (refreshResult.data as { access?: string } | undefined)?.access;
    if (!access) {
      apiContext.dispatch({ type: 'auth/sessionExpired' });
      return result;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    apiContext.dispatch({ type: 'auth/setToken', payload: access });
    result = await rawBaseQuery(args, apiContext, extraOptions);
  } finally {
    release();
  }

  return result;
};

/**
 * Cache tags.
 *
 * These replaced three booleans on the auth slice (`refreshDocuments`,
 * `refreshRegulations`, `refreshRentals`) that pages watched in order to call
 * `refetch()` by hand. That pattern refetched everything any page happened to
 * be subscribed to, whether or not it was affected, and needed a
 * `keepUnusedDataFor: 0` on most queries to behave — which disabled the cache
 * outright.
 */
export const TAG_TYPES = [
  'User',
  'Profile',
  'Lease',
  'Document',
  'DocumentChat',
  'Regulation',
  'RegulationChat',
  'RentalProperty',
  'RentalTask',
] as const;

export type TagType = (typeof TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: 'api',
  // Demo mode swaps the transport and nothing else: the endpoints, the tags
  // and every component above them are identical either way.
  baseQuery: isDemoMode() ? demoBaseQuery : baseQueryWithReauth,
  tagTypes: TAG_TYPES,
  // Refetch a stale list when the user comes back to the tab, but not on every
  // remount — the tables are read-mostly and the backend pages are cheap.
  refetchOnFocus: true,
  refetchOnReconnect: true,
  // 60s is long enough that paging back and forth is instant, short enough
  // that a long-lived tab does not show yesterday's analysis.
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});

/**
 * Tag every row of a list plus a sentinel for the list itself.
 *
 * Rows without an `id` are tagged only through the list sentinel — the rental
 * serializer omits one on some payloads, and a tag of `undefined` would
 * quietly match every other untagged row.
 */
export const listTags = <T extends { id?: number | string }>(
  type: TagType,
  rows: T[] | undefined
) => [
  ...(rows ?? [])
    .filter((row): row is T & { id: number | string } => row.id !== undefined)
    .map((row) => ({ type, id: row.id }) as const),
  { type, id: 'LIST' } as const,
];
