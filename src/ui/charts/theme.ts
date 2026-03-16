/**
 * Chart tokens.
 *
 * Data ink is deliberately blue rather than the brand crimson: red carries a
 * meaning in this product ("rejected", "loss"), and a chart painted in it
 * would imply that meaning on every bar. The two colours below were checked
 * for colour-vision separation and for 3:1 contrast against the white chart
 * surface before being adopted.
 */
export const CHART = {
  /** The single data hue, used for every ordinary series. */
  series: '#2a78d6',
  /** Reserved for genuinely negative values; always paired with a label. */
  negative: '#b91c1c',
  grid: '#e2e8f0',
  axis: '#94a3b8',
  label: '#475569',
  surface: '#ffffff',
} as const;

/** Recharts axis props shared by every chart, so they recede consistently. */
export const AXIS_PROPS = {
  stroke: CHART.axis,
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART.label, fontSize: 12 },
} as const;

export const TOOLTIP_PROPS = {
  cursor: { fill: 'rgba(15, 23, 42, 0.04)' },
  contentStyle: {
    borderRadius: 8,
    border: `1px solid ${CHART.grid}`,
    boxShadow: '0 4px 12px -2px rgb(15 23 42 / 0.10)',
    fontSize: 12,
    color: '#0f172a',
  },
  labelStyle: { color: '#475569', fontWeight: 500 },
} as const;
