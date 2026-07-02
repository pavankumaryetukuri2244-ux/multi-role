/**
 * React Query key registry.
 *
 * Using `as const` keeps every array as a readonly tuple so TypeScript can
 * infer the narrowest possible type for cache invalidation calls.
 */
export const QUERY_KEYS = {
  // Auth
  currentUser: ['currentUser'],

  // Super Admin
  superAdminAnalytics: ['super-admin', 'analytics'],
  categories: ['super-admin', 'categories'],
  admins: ['super-admin', 'admins'],
  tenants: ['super-admin', 'tenants'],
  subscriptionPlans: ['super-admin', 'subscription-plans'],
  platformSettings: ['super-admin', 'settings'],
  auditLogs: ['super-admin', 'audit-logs'],
  platformHealth: ['platform', 'health'],

  // Admin
  adminTenant: ['admin', 'tenant'],
  adminUsers: ['admin', 'users'],

  // User
  userProfile: ['user', 'profile'],
  userTenant: ['user', 'tenant'],
  userOrders: ['user', 'orders'],
  userNotifications: ['user', 'notifications'],

  // Notifications (polled every 60 s)
  notifications: ['notifications'],
} as const;
