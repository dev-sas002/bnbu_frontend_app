import dayjs from 'dayjs';

/**
 * Presentation helpers.
 *
 * Every one of these existed two or three times in the codebase, inline in a
 * component, with slightly different fallbacks — `${rental.rent}` in one row,
 * `$${rental.adr || 0}` in the modal, three separate `formatDate` copies that
 * disagreed on what to do with a null.
 */

const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const CURRENCY_PRECISE = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER = new Intl.NumberFormat('en-US');

/** An em dash, used everywhere a value is genuinely absent. */
export const EMPTY = '—';

export const formatCurrency = (
  value: number | null | undefined,
  { precise = false }: { precise?: boolean } = {}
): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
  return (precise ? CURRENCY_PRECISE : CURRENCY).format(value);
};

export const formatNumber = (value: number | null | undefined): string =>
  value === null || value === undefined || !Number.isFinite(value) ? EMPTY : NUMBER.format(value);

/**
 * The API expresses occupancy as a fraction (`0.72`) but some rows arrive
 * already scaled to a percentage. Anything above 1 is treated as the latter.
 */
export const formatOccupancy = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
  const percent = value <= 1 ? value * 100 : value;
  return `${Math.round(percent)}%`;
};

/** `2024-03-01` — the format the search endpoints parse. */
export const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * `March 3, 2024` — what the *rental* endpoints parse, with `%B %d, %Y`.
 * The two formats are not interchangeable; see the README.
 */
export const toLongApiDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return EMPTY;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY') : EMPTY;
};

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return EMPTY;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY, h:mm A') : EMPTY;
};

export const formatAddress = (
  parts: { address1?: string | null; address2?: string | null } | null | undefined
): string => {
  if (!parts) return EMPTY;
  const joined = [parts.address1, parts.address2].filter(Boolean).join(', ');
  return joined || EMPTY;
};

/** First letter of the local part of an email, for the avatar chip. */
export const initialFromEmail = (email: string | null | undefined): string =>
  email ? email.split('@')[0].charAt(0).toUpperCase() : '?';

/**
 * A one-line, markdown-free preview of an AI answer.
 *
 * The lease and regulation analyses come back as markdown, and table cells
 * were rendering it raw — the first row of the regulation table read
 * `**SHORT-TERM RENTALS ALLOWED WITH RESTRICTIONS**`, asterisks and all.
 * Rendering the markdown properly inside a one-line cell is the wrong fix: it
 * pulls the 118 kB renderer onto a list route. Stripping the syntax is enough
 * for a preview, and the full answer is still rendered as markdown on the
 * detail page.
 */
export const plainTextPreview = (value: string | null | undefined): string => {
  if (!value) return '';
  const firstLine = value.split('\n').find((line) => line.trim().length > 0) ?? '';
  return firstLine
    .replace(/^#{1,6}\s+/, '') // heading marker
    .replace(/^>\s?/, '') // blockquote marker
    .replace(/^[-*+]\s+/, '') // bullet marker
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1') // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/\s+/g, ' ')
    .trim();
};
