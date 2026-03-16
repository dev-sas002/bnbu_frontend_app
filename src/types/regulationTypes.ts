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

export interface Regulation {
  id: number;
  date: string;
  search: string;
  status: RegulationStatus | string;
  gpt_response: GptAnalysis | null;
  chat_history: ChatTurn[];
}

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
