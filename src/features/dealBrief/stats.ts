import { RentalProperty, RentalPropertyStatus } from '@/types/rentalTypes';

/**
 * Portfolio arithmetic over the rows currently on screen.
 *
 * This is deliberately a pure function of the property list: it is the input
 * to the KPI strip, the profit histogram and the deal brief, and it is the
 * only place any of those three agree on what "median profit" means.
 */

export interface ProfitBucket {
  /** Inclusive lower bound of the bucket, in dollars of monthly profit. */
  from: number;
  /** Exclusive upper bound; `null` for the open-ended top bucket. */
  to: number | null;
  label: string;
  count: number;
}

export interface PortfolioStats {
  total: number;
  /** Rows that actually carry a monthly profit figure. */
  priced: number;
  approved: number;
  rejected: number;
  unpriced: number;
  approvalRate: number | null;
  medianProfit: number | null;
  meanProfit: number | null;
  totalMonthlyProfit: number | null;
  bestDeal: RentalProperty | null;
  worstDeal: RentalProperty | null;
  medianRent: number | null;
  medianAdr: number | null;
  meanOccupancy: number | null;
  buckets: ProfitBucket[];
}

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const mean = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Fixed buckets, so the histogram's shape is comparable between batches. */
const BUCKET_EDGES: Array<[number, number | null, string]> = [
  [Number.NEGATIVE_INFINITY, 0, 'Loss'],
  [0, 500, '$0–500'],
  [500, 1000, '$500–1k'],
  [1000, 2000, '$1k–2k'],
  [2000, 3500, '$2k–3.5k'],
  [3500, null, '$3.5k+'],
];

export const computePortfolioStats = (properties: RentalProperty[]): PortfolioStats => {
  const rows = properties ?? [];
  const profits = rows.map((row) => row.monthly_estimated_profit).filter(isNumber);
  const rents = rows.map((row) => row.rent).filter(isNumber);
  const adrs = rows.map((row) => row.adr).filter(isNumber);
  const occupancies = rows
    .map((row) => row.occupancy_rate)
    .filter(isNumber)
    // Some rows carry a fraction, some a percentage. Normalise to a fraction.
    .map((value) => (value <= 1 ? value : value / 100));

  const approved = rows.filter(
    (row) => row.property_status === RentalPropertyStatus.Approved
  ).length;
  const rejected = rows.filter(
    (row) => row.property_status === RentalPropertyStatus.Rejected
  ).length;

  const withProfit = rows.filter((row) => isNumber(row.monthly_estimated_profit));
  const ranked = [...withProfit].sort(
    (a, b) => (b.monthly_estimated_profit as number) - (a.monthly_estimated_profit as number)
  );

  const buckets: ProfitBucket[] = BUCKET_EDGES.map(([from, to, label]) => ({
    from,
    to,
    label,
    count: profits.filter((value) => value >= from && (to === null || value < to)).length,
  }));

  return {
    total: rows.length,
    priced: profits.length,
    approved,
    rejected,
    unpriced: rows.length - profits.length,
    approvalRate: rows.length ? approved / rows.length : null,
    medianProfit: median(profits),
    meanProfit: mean(profits),
    totalMonthlyProfit: profits.length ? profits.reduce((sum, value) => sum + value, 0) : null,
    bestDeal: ranked[0] ?? null,
    worstDeal: ranked.length > 1 ? ranked[ranked.length - 1] : null,
    medianRent: median(rents),
    medianAdr: median(adrs),
    meanOccupancy: mean(occupancies),
    buckets,
  };
};
