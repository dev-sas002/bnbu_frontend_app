import React, { Suspense, lazy } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import { Spinner } from './ui';

/**
 * The route table.
 *
 * Every signed-in page is `lazy`, so the first load ships the login screen and
 * the shell rather than the whole product — the bundle used to be a single
 * 1.15 MB chunk containing the chart library, the PDF-ish document viewer, the
 * date picker and the markdown renderer, all of which a user sees only after
 * they navigate somewhere specific.
 *
 * `Login` is the one exception, and deliberately so: it is the entry point for
 * every unauthenticated visit, and code-splitting it would add a round trip
 * before the first meaningful paint.
 */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const LeaseManagement = lazy(() => import('./pages/LeaseManagement'));
const LeaseDetail = lazy(() => import('./pages/LeaseDetail'));
const DocumentPreview = lazy(() => import('./pages/DocumentPreview'));
const ViewNotes = lazy(() => import('./pages/ViewNotes'));
const RegulationManagement = lazy(() => import('./pages/RegulationManagement'));
const RegulationDetail = lazy(() => import('./pages/RegulationDetail'));
const ViewRegulationChat = lazy(() => import('./pages/ViewRegulationChat'));
const RentalManagement = lazy(() => import('./pages/RentalManagement'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner label="Loading…" />
  </div>
);

/** Applies the signed-in shell once, around every guarded route. */
const ProtectedShell: React.FC = () => (
  <PrivateRoute>
    <Layout>
      <Outlet />
    </Layout>
  </PrivateRoute>
);

const App: React.FC = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/update-password/:id" element={<UpdatePassword />} />

      <Route element={<ProtectedShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leases" element={<LeaseManagement />} />
        <Route path="/lease/:id" element={<LeaseDetail />} />
        <Route path="/lease/:id/documents/:documentId/notes" element={<ViewNotes />} />
        <Route path="/preview/:documentId" element={<DocumentPreview />} />
        <Route path="/regulations" element={<RegulationManagement />} />
        {/* The "new search" form. It used to live at `/regulation/detail`,
            which only worked because it fell through the `/regulation/:id`
            pattern with the literal string "detail" as the id. */}
        <Route path="/regulations/new" element={<RegulationDetail />} />
        <Route path="/regulation/:regulationId/chat" element={<ViewRegulationChat />} />
        <Route path="/rental-analyzer" element={<RentalManagement />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default App;
