import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * A base query that answers from fixtures instead of the network.
 *
 * Selected by `VITE_DEMO_MODE=true`, which is what `docker compose up` sets —
 * so the image boots into a populated console with no backend running, and a
 * reviewer sees the product rather than eight empty tables.
 *
 * The fixtures are loaded with a dynamic `import()`, so in an ordinary build
 * they are a chunk that is never requested rather than dead weight in the
 * main bundle.
 */

/** A small delay, so loading and empty states are visible rather than skipped. */
const LATENCY_MS = 180;

export const isDemoMode = (): boolean => import.meta.env.VITE_DEMO_MODE === 'true';

export const demoBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  const [{ handleDemoRequest }] = await Promise.all([
    import('./handlers'),
    new Promise((resolve) => setTimeout(resolve, LATENCY_MS)),
  ]);

  const result = handleDemoRequest(args);
  return result.error ? { error: result.error } : { data: result.data };
};
