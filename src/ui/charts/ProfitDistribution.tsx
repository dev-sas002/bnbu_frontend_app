import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ProfitBucket } from '@/features/dealBrief/stats';
import { AXIS_PROPS, CHART, TOOLTIP_PROPS } from './theme';

export interface ProfitDistributionProps {
  buckets: ProfitBucket[];
  height?: number;
  /**
   * Fill the parent's height instead of using a fixed one. The card this sits
   * in is stretched to match the deal brief beside it, and a fixed-height
   * chart left a band of dead space under the bars.
   */
  fill?: boolean;
}

/**
 * How monthly profit is spread across the filtered set.
 *
 * One measure over ordered bins, so: one hue, no legend (the heading names
 * the series), and direct labels on each bar because there are only six of
 * them. The loss bin is the exception — it carries the reserved negative
 * colour, alongside the word "Loss", so the meaning never rests on colour.
 */
const ProfitDistribution: React.FC<ProfitDistributionProps> = ({
  buckets,
  height = 180,
  fill = false,
}) => {
  const hasData = buckets.some((bucket) => bucket.count > 0);

  if (!hasData) {
    return (
      <p className="flex h-full min-h-[180px] items-center justify-center text-sm text-ink-subtle">
        No priced properties in this selection yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={fill ? '100%' : height}>
      <BarChart data={buckets} margin={{ top: 16, right: 4, bottom: 0, left: -24 }} barCategoryGap="22%">
        <XAxis dataKey="label" {...AXIS_PROPS} interval={0} />
        <YAxis {...AXIS_PROPS} allowDecimals={false} width={44} />
        <Tooltip
          {...TOOLTIP_PROPS}
          formatter={(value: number) => [`${value} ${value === 1 ? 'property' : 'properties'}`, '']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {buckets.map((bucket) => (
            <Cell
              key={bucket.label}
              fill={bucket.label === 'Loss' ? CHART.negative : CHART.series}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProfitDistribution;
