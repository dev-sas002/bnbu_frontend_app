import React, { useEffect, useMemo, useState } from 'react';
import ChatPanel from '@/features/chat/ChatPanel';
import { mapChatHistory, type ChatMessage } from '@/features/chat/messages';
import useChatHistoryPolling from '@/hooks/useChatHistoryPolling';
import { formatDateTime } from '@/lib/format';
import { useChatWithGptMutation } from '@/services/api';
import type { Lease } from '@/types/leaseTypes';

interface ChatBoxProps {
  documentId: string | undefined;
  lease: Lease | null;
}

/** Give up on waiting for an analysis after this long. */
const POLL_MAX_AGE_SECONDS = 20 * 60;

const ASSISTANT_NAME = 'LeaseGuard AI';

/**
 * The lease-document conversation.
 *
 * All the presentation lives in `ChatPanel`; this component owns the two
 * things that are specific to documents — which endpoints to call, and when
 * to stop polling for the initial analysis.
 */
const ChatBox: React.FC<ChatBoxProps> = ({ documentId }) => {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setTyping] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(true);

  const { data, error, refetch } = useChatHistoryPolling(documentId, shouldPoll);
  const [chatWithGpt, { isLoading: isSending }] = useChatWithGptMutation();

  const historyMessages = useMemo(() => mapChatHistory(data?.chat_history), [data?.chat_history]);

  // Server history is the source of truth; optimistic turns are appended only
  // until the next poll returns them.
  const messages = useMemo(
    () => [...historyMessages, ...localMessages],
    [historyMessages, localMessages]
  );

  useEffect(() => {
    // Anything the server now reports can be dropped from the optimistic list.
    if (historyMessages.length === 0) return;
    setLocalMessages((pending) =>
      pending.filter(
        (message) => !historyMessages.some((known) => known.text === message.text)
      )
    );
  }, [historyMessages]);

  // Stop polling once the analysis has left "Pending", or once the document is
  // old enough that it is never going to arrive.
  useEffect(() => {
    const status = data?.gpt_response?.status;
    if (status && status !== 'Pending') {
      setShouldPoll(false);
      return;
    }

    // The API field is `document_uploaded_at`; this used to read
    // `documnet_uploaded_at`, so the value was always undefined, the
    // difference was NaN, and the age check never fired.
    const uploadedAt = data?.document_uploaded_at;
    if (!uploadedAt) return;

    const uploadedAtMs = new Date(uploadedAt).getTime();
    if (Number.isNaN(uploadedAtMs)) return;

    if ((Date.now() - uploadedAtMs) / 1000 > POLL_MAX_AGE_SECONDS) {
      setShouldPoll(false);
    }
  }, [data]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || !documentId) return;

    const now = new Date().toISOString();
    setLocalMessages((pending) => [
      ...pending,
      { text: message, sender: 'user', timestamp: formatDateTime(now), rawTimestamp: now },
    ]);
    setInput('');
    setTyping(true);

    try {
      const reply = await chatWithGpt({ documentId, message }).unwrap();
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
      // The mutation invalidates DocumentChat, but an explicit refetch keeps
      // the transcript current even when the tag misses (an aborted poll).
      refetch();
    } catch (cause) {
      console.error('Error chatting with the lease assistant:', cause);
    } finally {
      setTyping(false);
    }
  };

  const analysis = data?.gpt_response?.message ?? null;
  const analysisTimestamp = data?.gpt_response?.timestamp ?? data?.gpt_response?.created_time ?? null;

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
      disabled={!documentId}
    />
  );
};

export default ChatBox;
