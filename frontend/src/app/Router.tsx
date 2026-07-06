import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ROLE_DASHBOARD_MAP } from '@/constants/roles';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleGuard from '@/routes/RoleGuard';
import { SuperAdminLayout, AdminLayout, UserLayout, AuthLayout } from '@/layouts';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// ─── Lazy imports — auth pages ────────────────────────────────────────────────
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const AdminRegisterPage = React.lazy(() => import('@/pages/auth/AdminRegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const OtpPage = React.lazy(() => import('@/pages/auth/OtpPage'));
const SessionExpiredPage = React.lazy(() => import('@/pages/auth/SessionExpiredPage'));

// ─── Lazy imports — error pages ───────────────────────────────────────────────
const NotFoundPage = React.lazy(() => import('@/pages/errors/NotFoundPage'));
const ForbiddenPage = React.lazy(() => import('@/pages/errors/ForbiddenPage'));
const ServerErrorPage = React.lazy(() => import('@/pages/errors/ServerErrorPage'));

// ─── Lazy imports — super-admin pages ────────────────────────────────────────
const SuperAdminDashboard = React.lazy(() => import('@/pages/super-admin/DashboardPage'));
const CategoriesPage = React.lazy(() => import('@/pages/super-admin/CategoriesPage'));
const AdminsPage = React.lazy(() => import('@/pages/super-admin/AdminsPage'));
const TenantsPage = React.lazy(() => import('@/pages/super-admin/TenantsPage'));
const SubscriptionPlansPage = React.lazy(() => import('@/pages/super-admin/SubscriptionPlansPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/super-admin/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('@/pages/super-admin/SettingsPage'));
const AuditLogsPage = React.lazy(() => import('@/pages/super-admin/AuditLogsPage'));

// ─── Lazy imports — admin pages ───────────────────────────────────────────────
const AdminDashboard = React.lazy(() => import('@/pages/admin/DashboardPage'));
const AdminUsersPage = React.lazy(() => import('@/pages/admin/UsersPage'));
const AdminProductsPage = React.lazy(() => import('@/pages/admin/ProductsPage'));
const AdminOrdersPage = React.lazy(() => import('@/pages/admin/OrdersPage'));
const AdminReportsPage = React.lazy(() => import('@/pages/admin/ReportsPage'));
const AdminInventoryPage = React.lazy(() => import('@/pages/admin/InventoryPage'));
const AdminMarketingPage = React.lazy(() => import('@/pages/admin/MarketingPage'));
const AdminSettingsPage = React.lazy(() => import('@/pages/admin/SettingsPage'));

// ─── Lazy imports — user portal pages ────────────────────────────────────────
const PortalHome = React.lazy(() => import('@/pages/portal/HomePage'));
const PortalProfile = React.lazy(() => import('@/pages/portal/ProfilePage'));
const PortalOrders = React.lazy(() => import('@/pages/portal/OrdersPage'));
const PortalWishlist = React.lazy(() => import('@/pages/portal/WishlistPage'));
const PortalNotifications = React.lazy(() => import('@/pages/portal/NotificationsPage'));
const PortalRewards = React.lazy(() => import('@/pages/portal/RewardsPage'));
const PortalWallet = React.lazy(() => import('@/pages/portal/WalletPage'));
const PortalSettings = React.lazy(() => import('@/pages/portal/SettingsPage'));
const CommonProfilePage = React.lazy(() => import('@/pages/common/ProfilePage'));

// ─── Fullscreen lazy-load fallback ───────────────────────────────────────────

function FullscreenLoader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress size={48} />
    </Box>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
//
// Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 3.9, 26.2

export default function Router() {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  return (
    <Suspense fallback={<FullscreenLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated && role ? (
              <Navigate to={ROLE_DASHBOARD_MAP[role]} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Auth routes ─────────────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              isAuthenticated && role ? (
                <Navigate to={ROLE_DASHBOARD_MAP[role]} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          {/* /register — only accessible when NOT logged in, or when logged in as USER.
               ADMIN and SUPER_ADMIN are redirected to their dashboards. */}
          <Route
            path="/register"
            element={
              isAuthenticated && (role === 'SUPER_ADMIN' || role === 'ADMIN') ? (
                <Navigate to={ROLE_DASHBOARD_MAP[role]} replace />
              ) : (
                <AdminRegisterPage />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/session-expired" element={<SessionExpiredPage />} />
        </Route>

        {/* ── Error routes ────────────────────────────────────────────────── */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />

        {/* ── Super Admin routes ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRole="SUPER_ADMIN" />}>
            <Route element={<SuperAdminLayout />}>
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/categories" element={<CategoriesPage />} />
              <Route path="/super-admin/admins" element={<AdminsPage />} />
              <Route path="/super-admin/tenants" element={<TenantsPage />} />
              <Route path="/super-admin/subscription-plans" element={<SubscriptionPlansPage />} />
              <Route path="/super-admin/analytics" element={<AnalyticsPage />} />
              <Route path="/super-admin/settings" element={<SettingsPage />} />
              <Route path="/super-admin/profile" element={<CommonProfilePage />} />
              <Route path="/super-admin/audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Admin routes ────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRole="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/inventory" element={<AdminInventoryPage />} />
              <Route path="/admin/marketing" element={<AdminMarketingPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/profile" element={<CommonProfilePage />} />
            </Route>
          </Route>
        </Route>

        {/* ── User Portal routes ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRole="USER" />}>
            <Route element={<UserLayout />}>
              <Route path="/portal/home" element={<PortalHome />} />
              <Route path="/portal/profile" element={<PortalProfile />} />
              <Route path="/portal/orders" element={<PortalOrders />} />
              <Route path="/portal/wishlist" element={<PortalWishlist />} />
              <Route path="/portal/notifications" element={<PortalNotifications />} />
              <Route path="/portal/rewards" element={<PortalRewards />} />
              <Route path="/portal/wallet" element={<PortalWallet />} />
              <Route path="/portal/settings" element={<PortalSettings />} />
            </Route>
          </Route>
        </Route>

        {/* ── Catch-all → 404 ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
