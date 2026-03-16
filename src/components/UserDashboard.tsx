import React from 'react';
import { Link } from 'react-router-dom';
import { useGetUserProfileQuery } from '@/services/api';
import { Card, CardHeader, ErrorState, PageHeader, Skeleton, StatusBadge } from '@/ui';
import { AnalyzerIcon, LeaseIcon, RegulationIcon } from '@/ui/icons';
import type { StatusVocabulary } from '@/ui/statusRegistry';

const ACCOUNT_STATUSES: StatusVocabulary = {
  Active: { tone: 'positive', description: 'Can sign in' },
  Inactive: { tone: 'neutral', description: 'Sign-in disabled' },
};

const SHORTCUTS = [
  {
    to: '/leases',
    icon: LeaseIcon,
    title: 'Review a lease',
    body: 'Upload the PDFs and let LeaseGuard AI read them.',
  },
  {
    to: '/regulations',
    icon: RegulationIcon,
    title: 'Check local rules',
    body: 'Ask whether an area permits short-term rentals.',
  },
  {
    to: '/rental-analyzer',
    icon: AnalyzerIcon,
    title: 'Price a batch',
    body: 'Upload listings and see projected monthly profit.',
  },
];

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 last:border-0">
    <dt className="text-sm text-ink-subtle">{label}</dt>
    <dd className="text-sm font-medium text-ink">{children}</dd>
  </div>
);

/** The non-admin dashboard: who you are, and the three things you can do. */
const UserDashboard: React.FC = () => {
  const { data: user, isLoading, isError, refetch } = useGetUserProfileQuery();

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user?.first_name ? `Welcome back, ${user.first_name}` : 'Dashboard'}
        description="Your account and the tools available to it."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader title="Your account" />
          <dl className="mt-2">
            {isLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <>
                <DetailRow label="Email">{user?.email ?? '—'}</DetailRow>
                <DetailRow label="Name">
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—'}
                </DetailRow>
                <DetailRow label="Role">
                  <span className="capitalize">{user?.user_type ?? '—'}</span>
                </DetailRow>
                <DetailRow label="Status">
                  <StatusBadge
                    vocabulary={ACCOUNT_STATUSES}
                    value={user?.is_active ? 'Active' : 'Inactive'}
                  />
                </DetailRow>
              </>
            )}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Start something" description="The three tools in the console." />
          <ul className="mt-4 space-y-2">
            {SHORTCUTS.map(({ to, icon: Icon, title, body }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-start gap-3 rounded-md border border-line p-3 transition-colors hover:border-line-strong hover:bg-surface-sunken"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon />
                  </span>
                  <span>
                    <span className="block text-base font-medium text-ink">{title}</span>
                    <span className="mt-0.5 block text-sm text-ink-subtle">{body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
