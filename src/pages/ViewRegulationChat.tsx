import React from 'react';
import { useParams } from 'react-router-dom';
import RegulationChatBox from '@/components/RegulationChatBox';
import { formatDate } from '@/lib/format';
import { useGetRegulationByIdQuery } from '@/services/api';
import {
  ErrorState,
  PageHeader,
  REGULATION_STATUSES,
  Spinner,
  StatTile,
  StatusBadge,
} from '@/ui';

/** One saved regulation question: the answer, and the chat over it. */
const ViewRegulationChat: React.FC = () => {
  const { regulationId } = useParams<{ regulationId: string }>();
  const {
    data: regulation,
    isLoading,
    isError,
    refetch,
  } = useGetRegulationByIdQuery(regulationId, { skip: !regulationId });

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
      />

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
