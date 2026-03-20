import React from 'react';
import { cn } from './cn';
import {
  describeStatus,
  StatusVocabulary,
  TONE_CLASSES,
  TONE_DOT_CLASSES,
} from './statusRegistry';

export interface StatusBadgeProps {
  /** The vocabulary this status belongs to — see src/ui/statusRegistry.ts. */
  vocabulary: StatusVocabulary;
  value: string | null | undefined;
  className?: string;
}

/**
 * Renders one status. Reads its colour from the registry, so an unrecognised
 * value degrades to a neutral badge showing the raw string rather than
 * silently rendering an unstyled span.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ vocabulary, value, className }) => {
  const { label, tone, description } = describeStatus(vocabulary, value);

  return (
    <span
      title={description ?? label}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', TONE_DOT_CLASSES[tone])} />
      {label}
    </span>
  );
};

export default StatusBadge;
