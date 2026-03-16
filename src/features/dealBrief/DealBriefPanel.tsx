import React, { useCallback } from 'react';
import { Button, Card, CardHeader, Spinner } from '@/ui';
import type { RentalProperty } from '@/types/rentalTypes';
import type { PortfolioStats } from './stats';
import { useDealBrief } from './useDealBrief';

export interface DealBriefPanelProps {
  properties: RentalProperty[];
  stats: PortfolioStats;
  filterSummary: string;
}

const Bullet: React.FC<{ tone: 'finding' | 'action'; children: React.ReactNode }> = ({
  tone,
  children,
}) => (
  <li className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
    <span
      aria-hidden="true"
      className={
        tone === 'action'
          ? 'mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500'
          : 'mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-line-strong'
      }
    />
    <span>{children}</span>
  </li>
);

/**
 * "What am I looking at?" for the filtered batch.
 *
 * The numbers behind it are the same `PortfolioStats` the KPI strip and the
 * histogram use, so the prose can never disagree with the figures next to it.
 */
const DealBriefPanel: React.FC<DealBriefPanelProps> = ({ properties, stats, filterSummary }) => {
  const buildRequest = useCallback(
    () => ({ properties, stats, filterSummary }),
    [properties, stats, filterSummary]
  );

  const { brief, isGenerating, error, provider, generate } = useDealBrief(buildRequest);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Deal brief"
        description="A written read on the properties currently in view."
        actions={
          <Button size="sm" variant="secondary" onClick={generate} loading={isGenerating}>
            {brief ? 'Regenerate' : 'Generate'}
          </Button>
        }
      />

      <div className="mt-4 flex-1">
        {isGenerating && !brief && <Spinner label="Writing the brief…" />}

        {!isGenerating && !brief && (
          <p className="text-sm text-ink-subtle">
            {stats.total === 0
              ? 'Upload a batch or widen the filters, then generate a brief.'
              : `Summarise the ${stats.total} ${stats.total === 1 ? 'property' : 'properties'} in view — the headline figures, what stands out, and what to do next.`}
          </p>
        )}

        {brief && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-ink">{brief.headline}</p>

            {brief.findings.length > 0 && (
              <ul className="space-y-1.5">
                {brief.findings.map((finding) => (
                  <Bullet key={finding} tone="finding">
                    {finding}
                  </Bullet>
                ))}
              </ul>
            )}

            {brief.actions.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Next
                </p>
                <ul className="space-y-1.5">
                  {brief.actions.map((action) => (
                    <Bullet key={action} tone="action">
                      {action}
                    </Bullet>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-caution-bg px-3 py-2 text-xs text-caution-fg">{error}</p>
      )}

      <p className="mt-4 border-t border-line pt-3 text-xs text-ink-subtle">
        {brief
          ? brief.source === 'model'
            ? `Written by ${brief.model}. Check the figures before acting on it.`
            : 'Computed from the rows in view — no model involved.'
          : `Source: ${provider.label}.`}
      </p>
    </Card>
  );
};

export default DealBriefPanel;
