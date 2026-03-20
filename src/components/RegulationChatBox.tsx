import React, { useEffect, useMemo, useState } from 'react';
import ChatPanel from '@/features/chat/ChatPanel';
import { mapChatHistory, type ChatMessage } from '@/features/chat/messages';
import useDocumentVisible from '@/hooks/useDocumentVisible';
import { formatDateTime } from '@/lib/format';
import {
  useChatWithRegulationMutation,
  useGetRegulationChatHistoryQuery,
} from '@/services/api';
import type { Regulation } from '@/types/regulationTypes';

interface RegulationChatBoxProps {
  regulation: Regulation;
}

const ASSISTANT_NAME = 'RegAdvisor AI';

/** Statuses that mean the backend is still working on an answer. */
const IN_PROGRESS = new Set(['pending', 'Pending', 'STR Pending Approval']);

/**
 * The regulation conversation. A thin adapter over `ChatPanel`, exactly like
 * `ChatBox` — the two used to be near-identical 250-line files.
 */
const RegulationChatBox: React.FC<RegulationChatBoxProps> = ({ regulation }) => {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setTyping] = useState(false);

  // Research runs server-side after the question is created, so poll while the
  // status says it is still going and stop as soon as it is not.
  const visible = useDocumentVisible();
  const isResearching = IN_PROGRESS.has(regulation.status);

  const { data, error, refetch } = useGetRegulationChatHistoryQuery(regulation.id, {
    skip: !regulation.id,
    pollingInterval: isResearching && visible ? 8_000 : 0,
  });

  const [chatWithRegulation, { isLoading: isSending }] = useChatWithRegulationMutation();

  const historyMessages = useMemo(() => mapChatHistory(data?.chat_history), [data?.chat_history]);
  const messages = useMemo(
    () => [...historyMessages, ...localMessages],
    [historyMessages, localMessages]
  );

  useEffect(() => {
    if (historyMessages.length === 0) return;
    setLocalMessages((pending) =>
      pending.filter((message) => !historyMessages.some((known) => known.text === message.text))
    );
  }, [historyMessages]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || !regulation.id) return;

    const now = new Date().toISOString();
    setLocalMessages((pending) => [
      ...pending,
      { text: message, sender: 'user', timestamp: formatDateTime(now), rawTimestamp: now },
    ]);
    setInput('');
    setTyping(true);

    try {
      const reply = await chatWithRegulation({ regulationId: regulation.id, message }).unwrap();
      const replyTimestamp = reply.chat_history?.slice(-1)[0]?.timestamp ?? new Date().toISOString();
      setLocalMessages((pending) => [
        ...pending,
        {
          text: reply.response,
          sender: 'assistant',
          timestamp: formatDateTime(replyTimestamp),
          rawTimestamp: replyTimestamp,
        },
      ]);
      refetch();
    } catch (cause) {
      console.error('Error chatting with the regulation assistant:', cause);
    } finally {
      setTyping(false);
    }
  };

  const analysis = data?.gpt_response?.message ?? regulation.gpt_response?.message ?? null;
  const analysisTimestamp =
    data?.gpt_response?.timestamp ??
    regulation.gpt_response?.created_time ??
    regulation.gpt_response?.timestamp ??
    null;

  return (
    <ChatPanel
      assistantName={ASSISTANT_NAME}
      messages={messages}
      analysis={analysis}
      analysisTimestamp={analysisTimestamp}
      input={input}
      onInputChange={setInput}
      onSend={handleSend}
      isSending={isSending}
      isTyping={isTyping}
      hasError={Boolean(error)}
      onRetry={refetch}
    />
  );
};

export default RegulationChatBox;
