import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegulationSearchBar, { RegulationSearchFilters } from '@/components/RegulationSearchBar';
import RegulationTable from '@/components/RegulationTable';
import useDocumentVisible from '@/hooks/useDocumentVisible';
import { useGetRegulationsQuery, useSearchRegulationsQuery } from '@/services/api';
import { isAwaitingAnswer } from '@/types/regulationTypes';
import { Button, PageHeader, Pagination, StatTile } from '@/ui';
import { SearchIcon } from '@/ui/icons';

/** How often the list is re-read while a row on it is still being researched. */
const POLL_MS = 10_000;

const NO_FILTERS: RegulationSearchFilters = { query: '', status: '' };

const hasFilters = (filters: RegulationSearchFilters): boolean =>
  Boolean(filters.query || filters.status || filters.startDate || filters.endDate);

/** Saved "can I run a short-term rental here?" questions. */
const RegulationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RegulationSearchFilters>(NO_FILTERS);

  const visible = useDocumentVisible();

  const filtered = hasFilters(filters);
  const searchArgs = { ...filters, page };
  const listQuery = useGetRegulationsQuery(page, { skip: filtered });
  const searchQuery = useSearchRegulationsQuery(searchArgs, { skip: !filtered });
  const active = filtered ? searchQuery : listQuery;

  const regulations = useMemo(() => active.data?.results ?? [], [active.data]);

  // A new search or a re-analysis can come back 202 and be finished by a
  // worker later. While any row on this page is still owed an answer, a
  // second subscription to the same cache entry polls it; RTK Query shares
  // the entry, so the table above refreshes, and polling stops by itself.
  const awaiting = regulations.some(isAwaitingAnswer);
  const pollingInterval = visible ? POLL_MS : 0;
  useGetRegulationsQuery(page, { skip: filtered || !awaiting, pollingInterval });
  useSearchRegulationsQuery(searchArgs, { skip: !filtered || !awaiting, pollingInterval });

  const outcomes = useMemo(() => {
    const allowed = regulations.filter((row) => row.status === 'STR Allowed').length;
    const restricted = regulations.filter(
      (row) => row.status === 'STR Allowed with Restrictions'
    ).length;
    const blocked = regulations.filter((row) => row.status === 'STR Not Allowed').length;
    return { allowed, restricted, blocked };
  }, [regulations]);

  const newSearch = () => navigate('/regulations/new');

  return (
    <div className="space-y-5">
      <PageHeader
        title="Regulation searches"
        description="What RegAdvisor AI found about short-term rentals in each area you asked about."
        breadcrumbs={[{ name: 'Home', path: '/dashboard' }, { name: 'Regulations' }]}
        actions={
          <Button onClick={newSearch} icon={<SearchIcon className="h-4 w-4" />}>
            New search
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Saved searches"
          value={active.data?.count ?? '—'}
          caption="Across every page"
          loading={active.isLoading}
        />
        <StatTile
          label="Allowed"
          value={outcomes.allowed}
          caption="On this page"
          loading={active.isLoading}
        />
        <StatTile
          label="With restrictions"
          value={outcomes.restricted}
          caption="On this page"
          loading={active.isLoading}
        />
        <StatTile
          label="Not allowed"
          value={outcomes.blocked}
          caption="On this page"
          loading={active.isLoading}
        />
      </div>

      <RegulationSearchBar
        onSearch={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <RegulationTable
          regulations={regulations}
          loading={active.isLoading}
          error={active.isError}
          onRetry={active.refetch}
          onNewSearch={newSearch}
          filtered={filtered}
        />
        <Pagination
          page={page}
          onPageChange={setPage}
          hasNext={Boolean(active.data?.next)}
          count={active.data?.count}
          pageSize={10}
          disabled={active.isFetching}
        />
      </div>
    </div>
  );
};

export default RegulationManagement;
