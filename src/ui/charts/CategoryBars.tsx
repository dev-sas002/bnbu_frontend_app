import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_PROPS, CHART, TOOLTIP_PROPS } from './theme';

export interface CategoryDatum {
  name: string;
  value: number;
}

export interface CategoryBarsProps {
  data: CategoryDatum[];
  height?: number;
  emptyMessage?: string;
}

/**
 * Counts across a handful of named categories.
 *
 * This replaced a pie chart of the same data. A pie asks the reader to compare
 * angles; five horizontal bars sharing a baseline are read at a glance, and
 * the category names sit next to their bars instead of in a legend the eye has
 * to bounce to. One measure means one hue — colouring each bar differently
 * would imply a distinction the data does not carry.
 */
const CategoryBars: React.FC<CategoryBarsProps> = ({
  data,
  height = 220,
  emptyMessage = 'Nothing to chart yet.',
}) => {
  if (data.length === 0) {
    return (
      <p className="flex h-[220px] items-center justify-center text-sm text-ink-subtle">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(height, data.length * 44 + 24)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid horizontal={false} stroke={CHART.grid} />
        <XAxis type="number" {...AXIS_PROPS} allowDecimals={false} />
        <YAxis type="category" dataKey="name" {...AXIS_PROPS} width={96} />
        <Tooltip
          {...TOOLTIP_PROPS}
          formatter={(value: number) => [`${value} ${value === 1 ? 'user' : 'users'}`, '']}
        />
        <Bar
          dataKey="value"
          fill={CHART.series}
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
          maxBarSize={22}
        >
          <LabelList
            dataKey="value"
            position="right"
            style={{ fill: CHART.label, fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryBars;
