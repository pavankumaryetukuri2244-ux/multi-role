import { ROUTES } from './routes';

/**
 * Union type for all platform roles.
 * Matches the role strings returned by the Spring Boot JWT claims.
 */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

/**
 * Platform role constants object.
 * Use these instead of raw strings to avoid typos.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const satisfies Record<string, UserRole>;

/**
 * Maps every role to its default landing dashboard path.
 *
 * Used by the login success handler and the RoleGuard redirect.
 * Typed as `Record<UserRole, string>` so TypeScript enforces exhaustiveness —
 * adding a new role without updating this map is a compile error.
 */
export const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  SUPER_ADMIN: ROUTES.SUPER_ADMIN.DASHBOARD,
  ADMIN: ROUTES.ADMIN.DASHBOARD,
  USER: ROUTES.PORTAL.HOME,
};

/**
 * @deprecated Use `ROLES` constant and `UserRole` type instead.
 * Kept for backward compatibility while the codebase is migrated.
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}
