import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, plainTextPreview } from '@/lib/format';
import type { Regulation } from '@/types/regulationTypes';
import { Column, DataTable, REGULATION_STATUSES, StatusBadge } from '@/ui';

interface RegulationTableProps {
  regulations: Regulation[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onNewSearch?: () => void;
  filtered?: boolean;
}

/** Saved regulation questions and the answer RegAdvisor AI reached. */
const RegulationTable: React.FC<RegulationTableProps> = ({
  regulations,
  loading,
  error,
  onRetry,
  onNewSearch,
  filtered = false,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<Array<Column<Regulation>>>(
    () => [
      {
        key: 'date',
        header: 'Asked',
        sortValue: (regulation) => regulation.date,
        render: (regulation) => formatDate(regulation.date),
      },
      {
        key: 'search',
        header: 'Question',
        sortValue: (regulation) => regulation.search,
        render: (regulation) => (
          <span className="font-medium text-ink">{regulation.search}</span>
        ),
      },
      {
        key: 'summary',
        header: 'Answer',
        secondary: true,
        render: (regulation) => {
          const message = regulation.gpt_response?.message;
          if (!message) return <span className="text-ink-subtle">Not answered yet</span>;
          // One line of the analysis, so the table says something useful
          // without opening every row. The answer is markdown, so the syntax
          // is stripped rather than shown raw.
          const preview = plainTextPreview(message);
          if (!preview) return <span className="text-ink-subtle">Not answered yet</span>;
          return (
            <span className="line-clamp-1 max-w-md text-ink-subtle" title={preview}>
              {preview}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Outcome',
        sortValue: (regulation) => regulation.status,
        render: (regulation) => (
          <StatusBadge vocabulary={REGULATION_STATUSES} value={regulation.status} />
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      caption="Regulation searches"
      columns={columns}
      rows={regulations}
      rowKey={(regulation) => regulation.id}
      onRowClick={(regulation) => navigate(`/regulation/${regulation.id}/chat`)}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={filtered ? 'No searches match those filters' : 'No regulation searches yet'}
      emptyDescription={
        filtered
          ? 'Try a different outcome, or clear the filters.'
          : 'Ask RegAdvisor AI whether an area allows short-term rentals and the answer is saved here.'
      }
      emptyAction={
        !filtered && onNewSearch ? { label: 'Ask a question', onClick: onNewSearch } : undefined
      }
    />
  );
};

export default RegulationTable;
