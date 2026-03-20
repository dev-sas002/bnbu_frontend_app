import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/ui';

/**
 * The catch-all. Without it an unknown path rendered an empty document, which
 * is indistinguishable from the app having crashed.
 */
const NotFound: React.FC = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
    <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Page not found</h1>
    <p className="mt-2 max-w-md text-sm text-ink-subtle">
      That address does not match anything in the console. It may have been renamed, or the link
      may be out of date.
    </p>
    <Link to="/dashboard" className="mt-6 rounded-md">
      <Button>Back to the dashboard</Button>
    </Link>
  </div>
);

export default NotFound;
