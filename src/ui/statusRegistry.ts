/**
 * The status registry.
 *
 * Every domain in this product (leases, documents, regulations, rental
 * properties) has its own status vocabulary, and every one of them used to be
 * rendered by an inline ternary chain that hardcoded Tailwind colours --
 * five copies of the same `status === 'Approved' ? 'bg-green-300 ...'` ladder,
 * in five files, which had already drifted apart.
 *
 * This is the seam a future developer actually needs: when the backend adds a
 * status (and it will -- `lease.status` is a free-text column on the Django
 * side), you add one line here and every table, badge and detail page picks it
 * up. Nothing else in the app branches on a status string.
 */

export type Tone = 'positive' | 'caution' | 'negative' | 'info' | 'neutral';

export interface StatusDescriptor {
  /** What the user reads. Falls back to the raw value when absent. */
  label?: string;
  tone: Tone;
  /** Optional longer copy, surfaced as the badge's tooltip. */
  description?: string;
}

/** A named vocabulary of statuses for one domain. */
export type StatusVocabulary = Record<string, StatusDescriptor>;

export const LEASE_STATUSES: StatusVocabulary = {
  Draft: { tone: 'caution', description: 'Uploaded, analysis not yet complete' },
  Approved: { tone: 'positive', description: 'Review found no blocking issues' },
  Rejected: { tone: 'negative', description: 'Review found blocking issues' },
  Pending: { tone: 'info', description: 'Queued for review' },
};

export const DOCUMENT_STATUSES: StatusVocabulary = LEASE_STATUSES;

export const REGULATION_STATUSES: StatusVocabulary = {
  'STR Allowed': { tone: 'positive', description: 'Short-term rentals are permitted' },
  'STR Not Allowed': { tone: 'negative', description: 'Short-term rentals are prohibited' },
  'STR Allowed with Restrictions': {
    tone: 'caution',
    description: 'Permitted subject to local conditions',
  },
  'STR Pending Approval': { tone: 'info', description: 'Awaiting a determination' },
  // The Django model's *default* is the lowercase string, and the classifier
  // falls back to it when it cannot read the answer — so it reaches the UI
  // even though it is not in `STATUS_CHOICES`. Without this entry it rendered
  // as a bare grey "pending".
  pending: { label: 'Researching', tone: 'info', description: 'RegAdvisor AI is still working' },
  Pending: { label: 'Researching', tone: 'info', description: 'RegAdvisor AI is still working' },
};

export const RENTAL_STATUSES: StatusVocabulary = {
  Approved: { tone: 'positive', description: 'Meets the configured profit threshold' },
  Rejected: { tone: 'negative', description: 'Below the configured profit threshold' },
  Pending: { tone: 'caution', description: 'Still being priced' },
  Error: { tone: 'neutral', description: 'The listing could not be priced' },
};

const FALLBACK: StatusDescriptor = { tone: 'neutral' };

/** Look up a status, tolerating unknown values from the API. */
export const describeStatus = (
  vocabulary: StatusVocabulary,
  value: string | null | undefined
): StatusDescriptor & { label: string } => {
  const raw = value ?? 'Unknown';
  const found = vocabulary[raw] ?? FALLBACK;
  return { ...found, label: found.label ?? raw };
};

/** Tailwind classes per tone. The only place tones become colours. */
export const TONE_CLASSES: Record<Tone, string> = {
  positive: 'bg-positive-bg text-positive-fg ring-positive-line',
  caution: 'bg-caution-bg text-caution-fg ring-caution-line',
  negative: 'bg-negative-bg text-negative-fg ring-negative-line',
  info: 'bg-info-bg text-info-fg ring-info-line',
  neutral: 'bg-neutral-bg text-neutral-fg ring-neutral-line',
};

/** Dot colours, for the small leading indicator inside a badge. */
export const TONE_DOT_CLASSES: Record<Tone, string> = {
  positive: 'bg-positive-fg',
  caution: 'bg-caution-fg',
  negative: 'bg-negative-fg',
  info: 'bg-info-fg',
  neutral: 'bg-neutral-fg',
};
