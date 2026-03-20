/**
 * Join class names, dropping anything falsy.
 *
 * Deliberately not `clsx`: the whole need here is "conditionally include a
 * string", and a five-line helper avoids a dependency that would be bundled
 * into every route chunk.
 */
export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');
