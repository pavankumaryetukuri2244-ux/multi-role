/**
 * Application route path constants.
 *
 * Centralising every path string here prevents typos and makes
 * global find-and-replace straightforward when paths change.
 */
export const ROUTES = {
  // ── Auth ──────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    OTP: '/otp',
    SESSION_EXPIRED: '/session-expired',
  },

  // ── Super Admin ───────────────────────────────────────────────────────
  SUPER_ADMIN: {
    DASHBOARD: '/super-admin/dashboard',
    CATEGORIES: '/super-admin/categories',
    ADMINS: '/super-admin/admins',
    TENANTS: '/super-admin/tenants',
    SUBSCRIPTION_PLANS: '/super-admin/subscription-plans',
    ANALYTICS: '/super-admin/analytics',
    SETTINGS: '/super-admin/settings',
    AUDIT_LOGS: '/super-admin/audit-logs',
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    REPORTS: '/admin/reports',
    INVENTORY: '/admin/inventory',
    MARKETING: '/admin/marketing',
    SETTINGS: '/admin/settings',
  },

  // ── User Portal ───────────────────────────────────────────────────────
  PORTAL: {
    HOME: '/portal/home',
    PROFILE: '/portal/profile',
    ORDERS: '/portal/orders',
    WISHLIST: '/portal/wishlist',
    NOTIFICATIONS: '/portal/notifications',
    REWARDS: '/portal/rewards',
    WALLET: '/portal/wallet',
    SETTINGS: '/portal/settings',
  },

  // ── Errors ────────────────────────────────────────────────────────────
  ERRORS: {
    NOT_FOUND: '/404',
    FORBIDDEN: '/403',
  },
} as const;
