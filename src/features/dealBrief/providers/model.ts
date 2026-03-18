import { formatCurrency } from '@/lib/format';
import type { DealBrief, DealBriefProvider, DealBriefRequest } from '../types';

/**
 * The language-model provider.
 *
 * It talks to a **proxy you deploy**, named by `VITE_AI_PROXY_URL`, and never
 * to a model vendor directly. That is not a stylistic choice: Vite inlines
 * every `VITE_*` value into the JavaScript bundle, so an API key put in one
 * would be readable by anyone who opens devtools. The proxy holds the key and
 * this code holds none.
 *
 * If the variable is unset — which it is by default — `isAvailable()` returns
 * false, the registry hands back the heuristic provider instead, and the
 * feature works exactly as well minus the prose.
 */

const PROXY_URL: string | undefined = import.meta.env.VITE_AI_PROXY_URL;
const MODEL: string = import.meta.env.VITE_AI_MODEL || 'claude-sonnet-4-5';

/** The contract the proxy is expected to honour. */
interface ProxyResponse {
  headline?: string;
  findings?: string[];
  actions?: string[];
  model?: string;
}

const buildPrompt = ({ stats, filterSummary, properties }: DealBriefRequest): string => {
  const sample = properties.slice(0, 25).map((property) => ({
    location: property.location,
    rent: property.rent,
    bedrooms: property.no_of_bedrooms,
    adr: property.adr,
    occupancy: property.occupancy_rate,
    monthly_profit: property.monthly_estimated_profit,
    status: property.property_status,
  }));

  return [
    'You are advising a short-term-rental investor reviewing a batch of listings.',
    `Filters in force: ${filterSummary}.`,
    `Counts: ${stats.total} total, ${stats.approved} approved, ${stats.rejected} rejected, ${stats.unpriced} unpriced.`,
    `Median monthly profit ${formatCurrency(stats.medianProfit)}; aggregate ${formatCurrency(stats.totalMonthlyProfit)}.`,
    `Sample rows: ${JSON.stringify(sample)}`,
    'Reply with JSON: {"headline": string, "findings": string[], "actions": string[]}.',
    'Be specific and quantitative. Do not invent listings that are not in the data.',
  ].join('\n');
};

export const modelProvider: DealBriefProvider = {
  id: 'model',
  label: MODEL,

  isAvailable: () => Boolean(PROXY_URL),

  async generate(request: DealBriefRequest, signal?: AbortSignal): Promise<DealBrief> {
    if (!PROXY_URL) {
      throw new Error('VITE_AI_PROXY_URL is not configured');
    }

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt: buildPrompt(request) }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`AI proxy responded ${response.status}`);
    }

    const payload = (await response.json()) as ProxyResponse;
    if (!payload.headline) {
      throw new Error('AI proxy returned no headline');
    }

    return {
      headline: payload.headline,
      findings: Array.isArray(payload.findings) ? payload.findings : [],
      actions: Array.isArray(payload.actions) ? payload.actions : [],
      source: 'model',
      model: payload.model ?? MODEL,
    };
  },
};
