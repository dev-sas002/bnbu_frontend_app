import { formatDateTime } from '@/lib/format';
import type { ChatTurn } from '@/types/api';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'assistant';
  /** Already formatted for display; empty when the API sent no timestamp. */
  timestamp: string;
  /** Raw value, for sorting and keys. */
  rawTimestamp: string;
}

/**
 * Turn the API's history rows into renderable messages.
 *
 * Rows written before a turn completed carry no `content`; they are dropped
 * rather than rendered as an empty bubble. A missing timestamp is left blank
 * instead of being passed to dayjs, which would fall back to "now" and label
 * an old message with the current time.
 */
export const mapChatHistory = (history: ChatTurn[] | undefined): ChatMessage[] => {
  if (!Array.isArray(history)) return [];

  return history.reduce<ChatMessage[]>((accumulator, turn) => {
    if (!turn?.content) return accumulator;
    accumulator.push({
      text: turn.content,
      sender: turn.role === 'user' ? 'user' : 'assistant',
      timestamp: turn.timestamp ? formatDateTime(turn.timestamp) : '',
      rawTimestamp: turn.timestamp ?? '',
    });
    return accumulator;
  }, []);
};
