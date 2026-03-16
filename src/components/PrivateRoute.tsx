import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Guards the signed-in routes.
 *
 * The redirect now carries the attempted path in location state, so signing
 * back in after a session expiry returns the user to where they were instead
 * of always dropping them on the dashboard.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
