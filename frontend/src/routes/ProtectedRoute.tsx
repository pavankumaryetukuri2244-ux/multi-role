import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

/**
 * ProtectedRoute — checks auth.isAuthenticated in Redux.
 * Redirects unauthenticated users to /login; renders nested routes otherwise.
 *
 * Validates: Requirements 4.2
 */
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
