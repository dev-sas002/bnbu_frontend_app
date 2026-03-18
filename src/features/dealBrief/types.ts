import type { RentalProperty } from '@/types/rentalTypes';
import type { PortfolioStats } from './stats';

export interface DealBriefRequest {
  properties: RentalProperty[];
  stats: PortfolioStats;
  /** A human description of the filters in force, for the narrative. */
  filterSummary: string;
}

export interface DealBrief {
  /** Two or three sentences a reviewer would read first. */
  headline: string;
  /** Short, concrete observations. */
  findings: string[];
  /** What to do next — kept separate so the UI can style them differently. */
  actions: string[];
  /** Which provider produced this, shown in the panel so it is never implied
   *  that a heuristic summary came from a model. */
  source: 'heuristic' | 'model';
  /** Only set by the model provider. */
  model?: string;
}

/**
 * The seam.
 *
 * A deal brief is "turn these rows into a paragraph an investor can act on".
 * There are two honest ways to do that — compute it, or ask a language model —
 * and which one is available depends on deployment, not on the component. So
 * the component asks the registry for a provider and renders whatever comes
 * back, and adding a third provider (a different vendor, an on-prem model, a
 * canned brief for a demo) is a new file plus one line in `providers/index.ts`.
 */
export interface DealBriefProvider {
  readonly id: string;
  /** Human-readable, shown in the panel footer. */
  readonly label: string;
  /** False when the provider is not configured for this deployment. */
  isAvailable(): boolean;
  generate(request: DealBriefRequest, signal?: AbortSignal): Promise<DealBrief>;
}
