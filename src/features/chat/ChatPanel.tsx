import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDateTime } from '@/lib/format';
import { Button, Card, CardHeader, EmptyState, ErrorState, Input, cn } from '@/ui';
import { SparkIcon } from '@/ui/icons';
import type { ChatMessage } from './messages';

export interface ChatPanelProps {
  /** e.g. "LeaseGuard AI" — used in the placeholder and the typing indicator. */
  assistantName: string;
  messages: ChatMessage[];
  /** The one-off analysis the backend produced when the item was created. */
  analysis?: string | null;
  analysisTimestamp?: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  isTyping: boolean;
  hasError: boolean;
  onRetry?: () => void;
  /** Disables the composer, e.g. when there is no document to chat about. */
  disabled?: boolean;
}

const markdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-2 last:mb-0" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="font-medium text-brand-700 underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
};

/**
 * The conversation surface, shared by the lease and regulation chats.
 *
 * Those two components were 250 lines each and differed only in which
 * endpoints they called and what the assistant was called. Everything visual
 * — the bubbles, the analysis card, the composer, the typing state — lives
 * here once.
 *
 * Messages run oldest-first with the newest at the bottom, which is what a
 * conversation looks like. The previous version paired messages up two at a
 * time and reversed the pairs, so a thread read bottom-to-top in blocks of
 * two and a question could appear below its own answer.
 */
const ChatPanel: React.FC<ChatPanelProps> = ({
  assistantName,
  messages,
  analysis,
  analysisTimestamp,
  input,
  onInputChange,
  onSend,
  isSending,
  isTyping,
  hasError,
  onRetry,
  disabled = false,
}) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // jsdom does not implement scrollIntoView, so the optional call keeps the
    // component renderable under test without a global stub.
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length, isTyping]);

  if (hasError) {
    return (
      <ErrorState
        title="Error loading chat history"
        description={`The API did not return the conversation with ${assistantName}.`}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <Card className="flex flex-col">
        <CardHeader
          title="Initial analysis"
          description={
            analysisTimestamp ? `Produced ${formatDateTime(analysisTimestamp)}` : undefined
          }
        />
        <div className="mt-4 max-h-[26rem] overflow-y-auto pr-1 text-sm leading-relaxed text-ink-muted">
          {analysis ? (
            <ReactMarkdown components={markdownComponents}>{analysis}</ReactMarkdown>
          ) : (
            <p className="flex items-center gap-2 text-ink-subtle">
              <SparkIcon className="h-4 w-4 shrink-0" />
              {assistantName} has not produced an analysis for this item yet.
            </p>
          )}
        </div>
      </Card>

      <Card flush className="flex h-full flex-col">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-lg font-semibold text-ink">Ask {assistantName}</h3>
          <p className="mt-0.5 text-sm text-ink-subtle">
            Follow-up questions are answered against this item only.
          </p>
        </div>

        <div className="flex max-h-[24rem] min-h-[14rem] flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && !isTyping && (
            <EmptyState
              className="py-8"
              icon={<SparkIcon className="h-5 w-5" />}
              title="No questions yet"
              description={`Ask ${assistantName} about a clause, a date or an obligation.`}
            />
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.rawTimestamp}-${index}`}
              className={cn('flex', message.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed',
                  message.sender === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-sunken text-ink-muted ring-1 ring-inset ring-line'
                )}
              >
                {message.sender === 'user' ? (
                  <p>{message.text}</p>
                ) : (
                  <ReactMarkdown components={markdownComponents}>{message.text}</ReactMarkdown>
                )}
                {message.timestamp && (
                  <p
                    className={cn(
                      'mt-1.5 text-[0.6875rem]',
                      message.sender === 'user' ? 'text-white/70' : 'text-ink-subtle'
                    )}
                  >
                    {message.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <p className="text-sm italic text-ink-subtle">{assistantName} is typing…</p>
          )}

          <div ref={endRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t border-line px-5 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Message {assistantName}
          </label>
          <Input
            id="chat-input"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={`Message ${assistantName}…`}
            disabled={disabled}
            autoComplete="off"
          />
          <Button type="submit" loading={isSending} disabled={disabled || !input.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChatPanel;
