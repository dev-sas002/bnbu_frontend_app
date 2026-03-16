import React from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import RegulationChatBox from '@/components/RegulationChatBox';
import useDocumentVisible from '@/hooks/useDocumentVisible';
import { formatDate } from '@/lib/format';
import { useGetRegulationByIdQuery, useReanalyzeRegulationMutation } from '@/services/api';
import { isAwaitingAnswer } from '@/types/regulationTypes';
import {
  Button,
  ErrorState,
  PageHeader,
  REGULATION_STATUSES,
  Spinner,
  StatTile,
  StatusBadge,
} from '@/ui';
import { SparkIcon } from '@/ui/icons';

const POLL_MS = 8_000;

/** One saved regulation question: the answer, and the chat over it. */
const ViewRegulationChat: React.FC = () => {
  const { regulationId } = useParams<{ regulationId: string }>();
  const visible = useDocumentVisible();

  const {
    data: regulation,
    isLoading,
    isError,
    refetch,
  } = useGetRegulationByIdQuery(regulationId, { skip: !regulationId });

  // A second subscription to the same cache entry, alive only while a worker
  // owes this row an answer. RTK Query shares the entry, so its polls refresh
  // the data above, and polling stops by itself once the answer lands.
  const awaiting = regulation ? isAwaitingAnswer(regulation) : false;
  useGetRegulationByIdQuery(regulationId, {
    skip: !regulationId || !awaiting,
    pollingInterval: visible ? POLL_MS : 0,
  });

  const [reanalyze, { isLoading: isReanalyzing }] = useReanalyzeRegulationMutation();

  const handleReanalyze = async () => {
    if (!regulation) return;
    try {
      const updated = await reanalyze(regulation.id).unwrap();
      // 200 means it was answered inline; 202 means it was queued like a new
      // search. The body's analysis_state says which without the status code.
      if (isAwaitingAnswer(updated)) {
        toast.info('RegAdvisor AI is looking this up again. The current answer stays until it is done.');
      } else {
        toast.success('Answer refreshed.');
      }
    } catch {
      toast.error('The search could not be re-run. Try again in a moment.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading the answer…" />
      </div>
    );
  }

  if (isError || !regulation) {
    return (
      <ErrorState
        title="Could not load this search"
        description="It may have been deleted, or the API is unreachable."
        onRetry={refetch}
      />
    );
  }


  return (
    <div className="space-y-5">
      <PageHeader
        title={regulation.search}
        description="What RegAdvisor AI found, and anything you have asked since."
        breadcrumbs={[
          { name: 'Home', path: '/dashboard' },
          { name: 'Regulations', path: '/regulations' },
          { name: regulation.search },
        ]}
        actions={
          <Button
            variant="secondary"
            onClick={handleReanalyze}
            loading={isReanalyzing}
            disabled={awaiting}
            icon={<SparkIcon className="h-4 w-4" />}
          >
            Look again
          </Button>
        }
      />

      {awaiting && (
        <p role="status" className="rounded-md bg-info-bg px-3 py-2.5 text-sm text-info-fg">
          RegAdvisor AI is researching this search. This page updates when the answer lands
          {regulation.gpt_response?.message ? '; the previous answer is shown until then.' : '.'}
        </p>
      )}
      {regulation.analysis_state === 'failed' && (
        <p role="alert" className="rounded-md bg-negative-bg px-3 py-2.5 text-sm text-negative-fg">
          The last lookup failed. Use “Look again” to retry it.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Outcome"
          value={<StatusBadge vocabulary={REGULATION_STATUSES} value={regulation.status} />}
          caption="As classified by RegAdvisor AI"
        />
        <StatTile label="Asked" value={formatDate(regulation.date)} caption="Search date" />
        <StatTile
          label="Follow-ups"
          value={regulation.chat_history?.length ?? 0}
          caption="Turns in the conversation"
        />
      </div>

      <RegulationChatBox regulation={regulation} />
    </div>
  );
};

export default ViewRegulationChat;
