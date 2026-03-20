import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import RentalSearchBar, { RentalSearchFilters } from '@/components/RentalSearchBar';
import RentalTable from '@/components/RentalTable';
import UploadRentalModal from '@/components/UploadRentalModal';
import DealBriefPanel from '@/features/dealBrief/DealBriefPanel';
import { computePortfolioStats } from '@/features/dealBrief/stats';
import useDocumentVisible from '@/hooks/useDocumentVisible';
import { formatCurrency, formatOccupancy } from '@/lib/format';
import {
  api,
  useDownloadCsvQuery,
  useFilteredListQuery,
  useTaskProgressQuery,
  useUploadPropertiesMutation,
} from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { taskSettled, taskStarted, uploadStarted } from '@/store/slices/rentalTaskSlice';
import { Button, Card, CardHeader, PageHeader, Pagination, StatTile } from '@/ui';
import ProfitDistribution from '@/ui/charts/ProfitDistribution';
import { DownloadIcon, UploadIcon } from '@/ui/icons';

/** How often the background pricing task is asked for its progress. */
const TASK_POLL_MS = 4_000;

const describeFilters = (filters: RentalSearchFilters): string => {
  const parts: string[] = [];
  if (filters.batch_id) parts.push(`batch ${filters.batch_id}`);
  if (filters.status) parts.push(String(filters.status).toLowerCase());
  if (filters.min_profit) parts.push(`profit over ${formatCurrency(Number(filters.min_profit))}`);
  if (filters.max_profit) parts.push(`profit under ${formatCurrency(Number(filters.max_profit))}`);
  if (filters.start_date) parts.push(`from ${filters.start_date}`);
  if (filters.end_date) parts.push(`to ${filters.end_date}`);
  return parts.length > 0 ? `the current filters (${parts.join(', ')})` : 'every priced listing';
};

/**
 * The Rental Analyzer.
 *
 * Two things changed structurally here. The page used to run its own
 * `setInterval` polling `task-result/` *alongside* an RTK Query
 * `pollingInterval` on `task-progress/` — two requests every five seconds for
 * the same job, with the manual one leaking its interval whenever the effect
 * re-ran. It also subscribed to `filteredList({})` purely to read the batch id
 * list, which the search bar independently subscribed to as well; with caching
 * switched back on, one query serves both.
 */
const RentalManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { taskId, polling, isUploading, progress } = useAppSelector((state) => state.rentalTask);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<RentalSearchFilters>({});
  const [isUploadOpen, setUploadOpen] = useState(false);

  const listQuery = useFilteredListQuery({ ...filters, page, pageSize });
  const { data: csvData } = useDownloadCsvQuery(filters);
  const [uploadProperties] = useUploadPropertiesMutation();

  const visible = useDocumentVisible();
  const { data: taskProgress } = useTaskProgressQuery(taskId, {
    skip: !taskId,
    pollingInterval: visible ? TASK_POLL_MS : 0,
  });

  const properties = useMemo(
    () => listQuery.data?.results.properties ?? [],
    [listQuery.data]
  );
  const batchIds = listQuery.data?.results.all_batch_ids ?? [];
  const stats = useMemo(() => computePortfolioStats(properties), [properties]);
  const filterSummary = useMemo(() => describeFilters(filters), [filters]);

  // One place decides the task is over. `taskSettled` clears the id, which
  // stops the poll, and invalidating the tag refreshes whatever list is on
  // screen without this component knowing which query that is.
  useEffect(() => {
    if (!taskId || !taskProgress) return;

    if (taskProgress.state === 'SUCCESS') {
      dispatch(taskSettled());
      dispatch(api.util.invalidateTags([{ type: 'RentalProperty', id: 'LIST' }]));
      toast.success(taskProgress.message ?? 'Pricing finished.');
    } else if (taskProgress.state === 'FAILURE') {
      dispatch(taskSettled());
      dispatch(api.util.invalidateTags([{ type: 'RentalProperty', id: 'LIST' }]));
      toast.error(taskProgress.error ?? 'Pricing failed.');
    }
  }, [taskId, taskProgress, dispatch]);

  const handleUpload = async (formData: FormData) => {
    dispatch(uploadStarted());
    try {
      const response = await uploadProperties(formData).unwrap();
      setUploadOpen(false);

      if (response.task_id) {
        dispatch(taskStarted(response.task_id));
        toast.info('Pricing started. The table updates when it finishes.');
      } else {
        dispatch(taskSettled());
      }

      if (response.batch_id) {
        setFilters((current) => ({ ...current, batch_id: response.batch_id }));
        setPage(1);
      }
    } catch {
      dispatch(taskSettled());
      toast.error('Failed to upload the spreadsheet.');
    }
  };

  const handleDownloadCsv = useCallback(() => {
    if (!csvData) {
      toast.error('No CSV is available for these filters yet.');
      return;
    }
    const url = URL.createObjectURL(new Blob([csvData], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rental_properties_report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    // The blob stayed pinned in memory without this.
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded.');
  }, [csvData]);

  const busy = polling || isUploading;
  const reportedProgress = taskProgress?.progress ?? progress;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rental analyzer"
        description="Listings priced against market ADR and occupancy."
        breadcrumbs={[{ name: 'Home', path: '/dashboard' }, { name: 'Rental analyzer' }]}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleDownloadCsv}
              disabled={busy || !csvData}
              icon={<DownloadIcon className="h-4 w-4" />}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setUploadOpen(true)}
              disabled={busy}
              icon={<UploadIcon className="h-4 w-4" />}
            >
              Upload listings
            </Button>
          </>
        }
      />

      {busy && (
        <Card className="border-brand-200 bg-brand-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-medium text-brand-900">
                {isUploading ? 'Uploading the spreadsheet…' : 'Pricing listings…'}
              </p>
              <p className="mt-0.5 text-sm text-brand-700">
                {taskProgress?.message ?? 'You can keep working; the table refreshes when it finishes.'}
              </p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-brand-900">
              {reportedProgress}%
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={reportedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Pricing progress"
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-200"
          >
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
              style={{ width: `${reportedProgress}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Listings"
          value={listQuery.data?.count ?? 0}
          caption={`${stats.priced} priced on this page`}
          loading={listQuery.isLoading}
        />
        <StatTile
          label="Median monthly profit"
          value={formatCurrency(stats.medianProfit)}
          caption="Across the listings in view"
          loading={listQuery.isLoading}
        />
        <StatTile
          label="Approval rate"
          value={stats.approvalRate === null ? '—' : `${Math.round(stats.approvalRate * 100)}%`}
          caption={`${stats.approved} approved, ${stats.rejected} rejected`}
          loading={listQuery.isLoading}
        />
        <StatTile
          label="Median ADR"
          value={formatCurrency(stats.medianAdr)}
          caption={
            stats.meanOccupancy === null
              ? 'No occupancy data'
              : `at ${formatOccupancy(stats.meanOccupancy)} occupancy`
          }
          loading={listQuery.isLoading}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
        <Card className="flex flex-col">
          <CardHeader
            title="Monthly profit distribution"
            description="How the listings in view are spread across profit bands."
          />
          {/* flex-1 so the chart grows into the height the stretched grid row
              gives this card, rather than leaving dead space beneath it. */}
          <div className="mt-4 min-h-[180px] flex-1">
            <ProfitDistribution buckets={stats.buckets} fill />
          </div>
        </Card>

        <DealBriefPanel properties={properties} stats={stats} filterSummary={filterSummary} />
      </div>

      <RentalSearchBar
        batchIds={batchIds}
        onSearch={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <RentalTable
          rentals={properties}
          loading={listQuery.isLoading}
          error={listQuery.isError}
          onRetry={listQuery.refetch}
          onUpload={() => setUploadOpen(true)}
          filtered={Object.keys(filters).length > 0}
        />
        <Pagination
          page={page}
          onPageChange={setPage}
          hasNext={Boolean(listQuery.data?.next)}
          count={listQuery.data?.count}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          disabled={busy || listQuery.isFetching}
        />
      </div>

      <UploadRentalModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        submitting={isUploading}
      />
    </div>
  );
};

export default RentalManagement;
