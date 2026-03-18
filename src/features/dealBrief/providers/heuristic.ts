import { formatCurrency, formatOccupancy } from '@/lib/format';
import type { DealBrief, DealBriefProvider, DealBriefRequest } from '../types';

/**
 * The always-available provider.
 *
 * It reads the same `PortfolioStats` the KPI strip does and turns them into
 * sentences. No network call, no key, no failure mode — which is exactly why
 * it is the default: the panel is useful on a laptop with no AI configuration
 * at all, and the model provider is an upgrade rather than a prerequisite.
 */
export const heuristicProvider: DealBriefProvider = {
  id: 'heuristic',
  label: 'Computed locally',

  isAvailable: () => true,

  async generate({ stats, filterSummary }: DealBriefRequest): Promise<DealBrief> {
    if (stats.total === 0) {
      return {
        headline: `No properties match ${filterSummary}.`,
        findings: [],
        actions: ['Widen the filters, or upload a spreadsheet to price a new batch.'],
        source: 'heuristic',
      };
    }

    const findings: string[] = [];
    const actions: string[] = [];

    const headline =
      stats.medianProfit === null
        ? `${stats.total} ${stats.total === 1 ? 'property' : 'properties'} match ${filterSummary}, but none of them have been priced yet.`
        : `${stats.total} ${stats.total === 1 ? 'property' : 'properties'} match ${filterSummary}. ` +
          `Median monthly profit is ${formatCurrency(stats.medianProfit)}, ` +
          `and the set clears ${formatCurrency(stats.totalMonthlyProfit)} a month in aggregate.`;

    if (stats.approvalRate !== null) {
      findings.push(
        `${stats.approved} of ${stats.total} cleared the profit threshold (${Math.round(stats.approvalRate * 100)}%); ${stats.rejected} were rejected.`
      );
    }

    if (stats.bestDeal?.location) {
      findings.push(
        `Strongest listing: ${stats.bestDeal.location} at ${formatCurrency(stats.bestDeal.monthly_estimated_profit)} a month.`
      );
    }

    if (stats.medianAdr !== null && stats.meanOccupancy !== null) {
      findings.push(
        `Median ADR is ${formatCurrency(stats.medianAdr)} against ${formatOccupancy(stats.meanOccupancy)} average occupancy.`
      );
    }

    if (stats.medianRent !== null) {
      findings.push(`Median asking rent across the set is ${formatCurrency(stats.medianRent)}.`);
    }

    const losses = stats.buckets.find((bucket) => bucket.label === 'Loss')?.count ?? 0;
    if (losses > 0) {
      findings.push(
        `${losses} ${losses === 1 ? 'listing prices' : 'listings price'} below break-even once rent and utilities are covered.`
      );
      actions.push(`Exclude the ${losses} loss-making listings before sharing this batch.`);
    }

    if (stats.unpriced > 0) {
      findings.push(
        `${stats.unpriced} ${stats.unpriced === 1 ? 'row has' : 'rows have'} no profit figure — the market lookup returned nothing for them.`
      );
      actions.push('Re-upload the unpriced rows; the ADR lookup usually succeeds on a retry.');
    }

    if (stats.bestDeal?.location) {
      actions.push(
        `Run a regulation check on ${stats.bestDeal.location} before committing to it.`
      );
    }

    if (actions.length === 0) {
      actions.push('Export the batch to CSV and circulate it for review.');
    }

    return { headline, findings, actions, source: 'heuristic' };
  },
};
