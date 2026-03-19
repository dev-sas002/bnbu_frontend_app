export type QueryValue = string | number | boolean | null | undefined;

/**
 * Build `path?a=1&b=2`, dropping empty values.
 *
 * Three endpoints used to assemble their query strings by concatenating
 * `key=value&` and then slicing a stray trailing `&` off the end — the same
 * eight lines, copied, with the status parameter accidentally omitted from
 * the slice in one of them.
 *
 * `encodeURIComponent` rather than `URLSearchParams` on purpose: the Django
 * views read these with `request.GET`, and `URLSearchParams` would encode a
 * space as `+` where the existing (working) behaviour sends `%20`.
 */
export const buildQuery = (path: string, params: Record<string, QueryValue>): string => {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  return `${path}?${pairs.join('&')}`;
};

/** Strip keys whose value is `undefined`, for request bodies. */
export const compact = <T extends Record<string, unknown>>(input: T): Partial<T> => {
  const output: Record<string, unknown> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) output[key] = value;
  });
  return output as Partial<T>;
};
