import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ROLE_DASHBOARD_MAP } from '@/constants/roles';
import type { UserRole } from '@/constants/roles';

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoleGuardProps {
  allowedRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

/**
 * RoleGuard — checks auth.role matches the required allowedRole.
 *
 * - Unauthenticated  → redirect to /login
 * - Wrong role       → redirect to the user's own dashboard
 * - Correct role     → render nested routes via <Outlet />
 *
 * Validates: Requirements 4.3
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRole }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useSelector((state: RootState) => state.auth.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    // role is non-null here because isAuthenticated is true and auth state
    // is always set together; fall back to /login if somehow null.
    const destination = role ? ROLE_DASHBOARD_MAP[role as UserRole] : '/login';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
