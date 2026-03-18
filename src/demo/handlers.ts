import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  DEMO_BATCH_IDS,
  DEMO_CSV,
  DEMO_DOCUMENT_CHAT,
  DEMO_LEASES,
  DEMO_PROPERTIES,
  DEMO_REGULATIONS,
  DEMO_REGULATION_CHAT,
  DEMO_USER,
  DEMO_USERS,
  leaseDocuments,
} from './fixtures';

/**
 * The demo-mode request router.
 *
 * It answers the same URLs the Django API does, from the fixtures. This is
 * what makes the Docker image useful on its own: the container has no backend
 * to talk to, and an empty console would tell a reviewer nothing.
 *
 * It is imported dynamically by `demoBaseQuery`, so none of this — nor the
 * fixtures — is in the bundle a normal build produces.
 */

export interface DemoResult {
  data?: unknown;
  error?: FetchBaseQueryError;
}

const ok = (data: unknown): DemoResult => ({ data });

const notFound = (url: string): DemoResult => ({
  error: { status: 404, data: { detail: `No demo fixture for ${url}` } },
});

const idFrom = (url: string, pattern: RegExp): number | null => {
  const match = url.match(pattern);
  return match ? Number(match[1]) : null;
};

const slice = <T>(rows: T[], page: number, pageSize: number): T[] =>
  rows.slice((page - 1) * pageSize, page * pageSize);

const numberParam = (url: string, name: string, fallback: number): number => {
  const match = url.match(new RegExp(`[?&]${name}=(\\d+)`));
  return match ? Number(match[1]) : fallback;
};

/** A reply that reads like the assistant, without calling one. */
const cannedReply = (message: string): string =>
  `This console is running in demo mode, so no model was called. Your question — “${message}” — would be answered against the analysis shown above, citing the clauses it refers to.`;

export const handleDemoRequest = (args: string | FetchArgs): DemoResult => {
  const url = typeof args === 'string' ? args : args.url;
  const method = (typeof args === 'string' ? 'GET' : (args.method ?? 'GET')).toUpperCase();
  const body = typeof args === 'string' ? undefined : (args.body as Record<string, unknown>);

  // --- auth -------------------------------------------------------------
  if (url.startsWith('api/token/refresh')) return ok({ access: 'demo-access-token' });
  if (url.startsWith('api/token/')) {
    return ok({ access: 'demo-access-token', refresh: 'demo-refresh-token' });
  }
  if (url.startsWith('account/logout/')) return ok({ message: 'Logged out' });
  if (url.startsWith('account/profile/')) return ok(DEMO_USER);
  if (url.startsWith('account/dashboard/')) return ok({ user_type: DEMO_USER.user_type });
  if (url.startsWith('account/password/')) return ok({ message: 'Password updated' });

  // --- users ------------------------------------------------------------
  if (url.startsWith('account/users/')) {
    if (method === 'GET') {
      const page = numberParam(url, 'page', 1);
      return ok({
        ...DEMO_USERS,
        next: page * 10 < DEMO_USERS.count ? `http://demo/account/users/?page=${page + 1}` : null,
        previous: page > 1 ? `http://demo/account/users/?page=${page - 1}` : null,
        results: page === 1 ? DEMO_USERS.results : DEMO_USERS.results.slice(0, 3),
      });
    }
    // Writes succeed and change nothing: the fixtures are the record.
    return ok({ ...DEMO_USER, ...(body ?? {}) });
  }

  // --- leases -----------------------------------------------------------
  if (url.startsWith('api/leases/upload/')) {
    return ok({ ...DEMO_LEASES.results[0], documents: leaseDocuments(41) });
  }
  if (/^api\/leases\/\d+\/revised\//.test(url)) return ok({ document_ids: [911] });
  if (/^api\/leases\/\d+\/update\//.test(url)) return ok(DEMO_LEASES.results[0]);
  if (url.startsWith('api/leases/search/')) {
    return ok({ ...DEMO_LEASES, next: null, count: DEMO_LEASES.results.length });
  }
  if (/^api\/leases\/\d+\//.test(url)) {
    const id = idFrom(url, /^api\/leases\/(\d+)\//);
    const lease = DEMO_LEASES.results.find((row) => row.id === id);
    return lease ? ok(lease) : notFound(url);
  }
  if (url.startsWith('api/leases/')) {
    const page = numberParam(url, 'page', 1);
    return ok({
      ...DEMO_LEASES,
      next: page * 8 < DEMO_LEASES.count ? `http://demo/api/leases/?page=${page + 1}` : null,
      results: page === 1 ? DEMO_LEASES.results : DEMO_LEASES.results.slice(0, 6),
    });
  }

  // --- documents --------------------------------------------------------
  if (/^api\/documents\/lease\/\d+\/documents/.test(url)) {
    const leaseId = idFrom(url, /^api\/documents\/lease\/(\d+)\//);
    return ok(leaseDocuments(leaseId ?? 0));
  }
  if (/^api\/documents\/preview\/\d+\//.test(url)) {
    return ok({ file_url: 'https://example.invalid/demo-document.pdf' });
  }
  if (url.startsWith('api/documents/review/')) return ok({ status: 'queued' });
  if (/^api\/documents\/\d+\/get-chat-history\//.test(url)) {
    const id = idFrom(url, /^api\/documents\/(\d+)\//);
    return ok(
      DEMO_DOCUMENT_CHAT[id ?? 0] ?? {
        document_uploaded_at: null,
        gpt_response: { message: null, status: 'Pending', timestamp: null },
        chat_history: [],
      }
    );
  }
  if (/^api\/documents\/\d+\/chat\//.test(url)) {
    const message = String(body?.message ?? '');
    return ok({
      response: cannedReply(message),
      chat_history: [{ role: 'assistant', content: cannedReply(message), timestamp: new Date().toISOString() }],
    });
  }
  if (/^api\/documents\/\d+\//.test(url)) {
    const id = idFrom(url, /^api\/documents\/(\d+)\//);
    const document = Object.values(DEMO_LEASES.results)
      .flatMap((lease) => leaseDocuments(lease.id))
      .find((row) => row.id === id);
    return document ? ok(document) : notFound(url);
  }

  // --- regulations ------------------------------------------------------
  if (url.startsWith('api/regulations/search/')) {
    return ok({ ...DEMO_REGULATIONS, next: null, count: DEMO_REGULATIONS.results.length });
  }
  if (/^api\/regulations\/\d+\/get-chat-history\//.test(url)) {
    const id = idFrom(url, /^api\/regulations\/(\d+)\//);
    const regulation = DEMO_REGULATIONS.results.find((row) => row.id === id);
    return ok(
      DEMO_REGULATION_CHAT[id ?? 0] ?? {
        gpt_response: regulation?.gpt_response ?? null,
        chat_history: regulation?.chat_history ?? [],
      }
    );
  }
  if (/^api\/regulations\/\d+\/chat\//.test(url)) {
    const message = String(body?.message ?? '');
    return ok({
      response: cannedReply(message),
      chat_history: [{ role: 'assistant', content: cannedReply(message), timestamp: new Date().toISOString() }],
    });
  }
  if (/^api\/regulations\/\d+\//.test(url)) {
    const id = idFrom(url, /^api\/regulations\/(\d+)\//);
    const regulation = DEMO_REGULATIONS.results.find((row) => row.id === id);
    return regulation ? ok(regulation) : notFound(url);
  }
  if (url.startsWith('api/regulations/')) {
    if (method === 'POST') {
      return ok({
        id: 99,
        date: new Date().toISOString().slice(0, 10),
        search: String(body?.search ?? 'New search'),
        status: 'pending',
        gpt_response: null,
        chat_history: [],
      });
    }
    const page = numberParam(url, 'page', 1);
    return ok({
      ...DEMO_REGULATIONS,
      next: page * 8 < DEMO_REGULATIONS.count ? `http://demo/api/regulations/?page=${page + 1}` : null,
      results: page === 1 ? DEMO_REGULATIONS.results : DEMO_REGULATIONS.results.slice(0, 3),
    });
  }

  // --- rentals ----------------------------------------------------------
  if (url.startsWith('api/rental_properties/upload-properties/')) {
    return ok({ success: true, message: 'Batch 8 processing started', task_id: 'demo-task', batch_id: 8 });
  }
  if (url.startsWith('api/rental_properties/task-progress/')) {
    return ok({ success: true, state: 'SUCCESS', progress: 100, message: 'Task completed successfully' });
  }
  if (url.startsWith('api/rental_properties/task-result/')) {
    return ok({ success: true, message: 'Task completed', result: '[]' });
  }
  if (url.startsWith('api/rental_properties/download-csv/')) return ok(DEMO_CSV);
  if (url.startsWith('api/rental_properties/filtered-list/')) {
    const page = numberParam(url, 'page', 1);
    const pageSize = numberParam(url, 'page_size', 10);
    const batchId = body?.batch_id === undefined ? null : Number(body.batch_id);
    const status = body?.status ? String(body.status) : null;
    const minProfit = body?.min_profit === undefined ? null : Number(body.min_profit);
    const maxProfit = body?.max_profit === undefined ? null : Number(body.max_profit);

    const matching = DEMO_PROPERTIES.filter((property) => {
      if (batchId !== null && property.batch_id !== batchId) return false;
      if (status && property.property_status !== status) return false;
      const profit = property.monthly_estimated_profit;
      const numericProfit = profit === null || profit === undefined ? null : Number(profit);
      if (minProfit !== null && (numericProfit === null || numericProfit < minProfit)) return false;
      if (maxProfit !== null && (numericProfit === null || numericProfit > maxProfit)) return false;
      return true;
    });

    return ok({
      count: matching.length,
      next: page * pageSize < matching.length ? `http://demo/filtered-list/?page=${page + 1}` : null,
      previous: page > 1 ? `http://demo/filtered-list/?page=${page - 1}` : null,
      results: {
        all_batch_ids: DEMO_BATCH_IDS,
        properties: slice(matching, page, pageSize),
      },
    });
  }
  if (url.startsWith('api/rental_properties/')) {
    const page = numberParam(url, 'page', 1);
    return ok({
      count: DEMO_PROPERTIES.length,
      next: null,
      previous: null,
      results: slice(DEMO_PROPERTIES, page, 10),
    });
  }

  return notFound(url);
};
