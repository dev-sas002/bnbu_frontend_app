/**
 * The design system.
 *
 * Everything visual in the app is assembled from these. Pages import from
 * `@/ui`; nothing outside this folder writes a colour, a radius or a shadow.
 */
export { cn } from './cn';
export { default as Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';
export { default as Card, CardHeader } from './Card';
export { default as DataTable } from './DataTable';
export type { Column, DataTableProps, SortDirection } from './DataTable';
export { Field, Input, Select } from './Field';
export { controlClassName, useFieldControlId } from './fieldContext';
export { default as DateRangePicker } from './DateRangePicker';
export { default as Dropzone } from './Dropzone';
export { default as FilterBar } from './FilterBar';
export { default as Modal } from './Modal';
export { default as PageHeader } from './PageHeader';
export type { Crumb } from './PageHeader';
export { default as Pagination } from './Pagination';
export { default as StatTile } from './StatTile';
export { default as StatusBadge } from './StatusBadge';
export { EmptyState, ErrorState, Skeleton, Spinner, TableSkeleton } from './feedback';
export {
  DOCUMENT_STATUSES,
  LEASE_STATUSES,
  REGULATION_STATUSES,
  RENTAL_STATUSES,
  describeStatus,
} from './statusRegistry';
export type { StatusDescriptor, StatusVocabulary, Tone } from './statusRegistry';
