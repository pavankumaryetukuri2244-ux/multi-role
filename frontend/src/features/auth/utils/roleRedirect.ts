import { ROLE_DASHBOARD_MAP, type UserRole } from '@/constants/roles';

/**
 * Returns the default dashboard path for a given role string.
 * Falls back to '/login' if the role is unrecognised.
 */
export function roleRedirect(role: string): string {
  return ROLE_DASHBOARD_MAP[role as UserRole] ?? '/login';
}
