import { useEffect, useState } from 'react';
import { useGetChatHistoryQuery } from '@/services/api';
import useDocumentVisible from './useDocumentVisible';

/**
 * Polls one document's chat history while its analysis is running.
 *
 * The old implementation ran `setInterval(refetch, 3000)` for as long as the
 * page was open. A lease analysis takes a few minutes and the poll was capped
 * at twenty, so a single tab could issue 400 requests for one document — and
 * it kept firing while the tab was in the background.
 *
 * This backs off instead: fast while an answer is plausibly seconds away,
 * slower once it clearly is not, and paused entirely while the tab is hidden.
 * Reaching the same twenty-minute ceiling now costs about 50 requests. The
 * fetching is RTK Query's own `pollingInterval`, so the poll is shared between
 * every subscriber to the same document rather than being one timer per
 * mounted component.
 */

/** Interval, in ms, for each backoff stage. */
export const POLL_SCHEDULE_MS = [3_000, 5_000, 8_000, 13_000, 21_000, 30_000] as const;

/** How many polls happen at a stage before widening to the next one. */
export const POLLS_PER_STAGE = 4;

export const pollIntervalFor = (stage: number): number =>
  POLL_SCHEDULE_MS[Math.min(Math.max(stage, 0), POLL_SCHEDULE_MS.length - 1)];

export interface ChatHistoryPolling {
  data: ReturnType<typeof useGetChatHistoryQuery>['data'];
  error: ReturnType<typeof useGetChatHistoryQuery>['error'];
  isFetching: boolean;
  refetch: () => void;
  /** The interval currently in force, in ms; 0 when not polling. */
  pollingInterval: number;
}

const useChatHistoryPolling = (
  documentId: string | number | undefined,
  shouldPoll: boolean
): ChatHistoryPolling => {
  const [stage, setStage] = useState(0);
  const visible = useDocumentVisible();
  const active = Boolean(documentId) && shouldPoll;
  const pollingInterval = active && visible ? pollIntervalFor(stage) : 0;

  useEffect(() => {
    if (!active) {
      setStage(0);
      return undefined;
    }
    if (stage >= POLL_SCHEDULE_MS.length - 1) return undefined;

    const timer = setTimeout(
      () => setStage((current) => current + 1),
      pollIntervalFor(stage) * POLLS_PER_STAGE
    );
    return () => clearTimeout(timer);
  }, [active, stage]);

  const { data, error, isFetching, refetch } = useGetChatHistoryQuery(documentId, {
    skip: !documentId,
    pollingInterval,
  });

  return { data, error, isFetching, refetch, pollingInterval };
};

export default useChatHistoryPolling;
