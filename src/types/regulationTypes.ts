import type { ChatTurn, GptAnalysis } from './api';

/**
 * The four values in `Regulations.STATUS_CHOICES`, plus the lowercase
 * `'pending'` the model actually defaults to and the classifier falls back to.
 * It is not in the choices list, but it is what the API returns, so it is
 * declared here and carried by the status registry.
 */
export type RegulationStatus =
  | 'STR Allowed'
  | 'STR Not Allowed'
  | 'STR Allowed with Restrictions'
  | 'STR Pending Approval'
  | 'pending';

/** Re-exported for the components that were importing it from here. */
export type GptResponse = GptAnalysis;
export type { ChatTurn as ChatMessage };

/**
 * Where the lookup is, separate from what it concluded. A create or a
 * re-analysis that needs the model comes back 202 with `pending`; a worker
 * moves it to `running` and then `complete` or `failed`.
 */
export type AnalysisState = 'pending' | 'running' | 'complete' | 'failed';

export interface Regulation {
  id: number;
  date: string;
  search: string;
  status: RegulationStatus | string;
  gpt_response: GptAnalysis | null;
  chat_history: ChatTurn[];
  analysis_state?: AnalysisState | string;
  /** Which source answered: the curated table, the model, or empty. */
  source?: string;
}

/**
 * True while a worker still owes this row an answer. Rows from an API that
 * predates `analysis_state` fall back to the lowercase `pending` status.
 * `status` alone is not enough: the classifier also leaves `pending` on an
 * answer it could not read, and that row will never change.
 */
export const isAwaitingAnswer = (regulation: Pick<Regulation, 'status' | 'analysis_state'>) =>
  regulation.analysis_state
    ? regulation.analysis_state === 'pending' || regulation.analysis_state === 'running'
    : regulation.status === 'pending' || regulation.status === 'Pending';

export interface RegulationCreate {
  search: string;
}

export interface RegulationSearchParams {
  page?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}
