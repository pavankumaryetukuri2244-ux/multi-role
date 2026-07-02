# Design Document — Multi-Tenant SaaS Frontend

## Overview

This document describes the complete technical design for a modern, enterprise-grade React 19 + TypeScript single-page application serving three distinct roles: SUPER_ADMIN, ADMIN, and USER. The application integrates with a Spring Boot 3 backend at `http://localhost:8080/api/v1` via JWT-secured REST APIs.

The design targets a world-class SaaS experience (Stripe / Notion / Linear aesthetic) using: React 19, TypeScript (strict), Vite 5, Material UI v6+, React Router v7, Redux Toolkit 2, React Query v5, Axios 1.x, Framer Motion 11, and Recharts 2.

**Key architectural decisions:**
- Redux Toolkit for synchronous client-only state (auth identity, UI flags, notifications).
- React Query for all server state (fetching, caching, background refetch, optimistic updates).
- Axios instance with request/response interceptors for JWT injection and 401 handling.
- Route-level code splitting via `React.lazy` + `Suspense` to keep initial bundle under 250 KB gzipped.
- MUI `ThemeProvider` wrapping the whole tree; per-tenant branding injected at runtime by rebuilding the MUI theme from the tenant config payload.

---

## Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser / DOM                                 │
├─────────────────────────────────────────────────────────────────────┤
│  React 19 Component Tree                                             │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Pages   │  │   Layouts    │  │  Features   │  │  Reusable   │  │
│  │ (route-  │  │ (SuperAdmin/ │  │ (auth/      │  │ Components  │  │
│  │  level)  │  │  Admin/User) │  │  branding)  │  │ (DataTable, │  │
│  └────┬─────┘  └──────┬───────┘  └──────┬──────┘  │  KpiCard…)  │  │
│       └───────────────┴──────────────────┴─────────┴──────┬──────┘  │
├─────────────────────────────────────────────────────────┬─┘          │
│  State Layer                                            │            │
│  ┌─────────────────────────┐  ┌───────────────────────┐ │            │
│  │   Redux Store (client   │  │  React Query Client   │ │            │
│  │   state: auth, tenant,  │  │  (server state:       │ │            │
│  │   ui/notifications)     │  │   cache, bg-refetch)  │ │            │
│  └─────────────────────────┘  └──────────┬────────────┘ │            │
├───────────────────────────────────────────┼──────────────┘            │
│  Service Layer                            │                           │
│  ┌──────────────────────────────────────┐ │                           │
│  │  API Client (Axios instance)         │ │                           │
│  │  • Base URL: /api/v1                 │◄┘                           │
│  │  • Request interceptor: inject JWT   │                             │
│  │  • Response interceptor: 401 handler │                             │
│  └──────────────────────────────────────┘                             │
├───────────────────────────────────────────────────────────────────────┤
│  Spring Boot 3 Backend  (http://localhost:8080/api/v1)                │
└───────────────────────────────────────────────────────────────────────┘
```

### Data-Flow Sequence

```
User Action
    │
    ▼
React Component
    │ dispatch(action) ──────────────────► Redux Store
    │                                         │ selector
    │                                         ▼
    │ useQuery(key, fetchFn)         React Component re-renders
    │
    ▼
React Query Client
    │ cache hit? ──YES──► return stale data + background refetch
    │ cache miss?
    ▼
Axios API Client
    │ request interceptor: add Bearer token from Redux auth slice
    ▼
Spring Boot REST API
    │ response
    ▼
Axios response interceptor
    │ 401? ──► clear token in Redux, redirect to /login
    │ 2xx  ──► pass to React Query
    ▼
React Query
    │ update cache, trigger re-render
    ▼
React Component (displays fresh data)
```

---

## Components and Interfaces

### Routing Architecture

Three layout trees, each under a role-specific path prefix. All page components are lazy-loaded.

```
/                         ──► redirect to /login (or role dashboard if authed)
/login                    ──► LoginPage          (public)
/register                 ──► AdminRegisterPage  (public)
/forgot-password          ──► ForgotPasswordPage (public)
/reset-password           ──► ResetPasswordPage  (public)
/otp                      ──► OtpPage            (public)
/session-expired          ──► SessionExpiredPage (public)
/404                      ──► NotFoundPage
/403                      ──► ForbiddenPage

/super-admin              ──► ProtectedRoute → RoleGuard(SUPER_ADMIN) → SuperAdminLayout
  /super-admin/dashboard
  /super-admin/categories
  /super-admin/admins
  /super-admin/tenants
  /super-admin/subscription-plans
  /super-admin/analytics
  /super-admin/settings
  /super-admin/audit-logs

/admin                    ──► ProtectedRoute → RoleGuard(ADMIN) → AdminLayout
  /admin/dashboard
  /admin/users
  /admin/products
  /admin/orders
  /admin/reports
  /admin/inventory
  /admin/marketing
  /admin/settings

/portal                   ──► ProtectedRoute → RoleGuard(USER) → UserLayout
  /portal/home
  /portal/profile
  /portal/orders
  /portal/wishlist
  /portal/notifications
  /portal/rewards
  /portal/wallet
  /portal/settings
```

**`ProtectedRoute`** — checks `auth.isAuthenticated` in Redux; redirects to `/login` if false.

**`RoleGuard`** — checks `auth.role` matches the required role; redirects to the user's own dashboard if not.

**Lazy-loading pattern:**
```tsx
const SuperAdminDashboard = React.lazy(
  () => import('@/pages/super-admin/DashboardPage')
);
// wrapped in <Suspense fallback={<FullscreenSkeleton />}>
```

### Layout Components

**`SuperAdminLayout`** — `Sidebar (SUPER_ADMIN nav) + Topbar + <Outlet />`  
**`AdminLayout`** — `Sidebar (ADMIN nav) + Topbar + <Outlet />`  
**`UserLayout`** — `Sidebar (USER nav) + Topbar + <Outlet />`

**`Sidebar`** props interface:
```ts
interface SidebarProps {
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  collapsed: boolean;
  onToggle: () => void;
}
```
- Width: 240px (expanded) / 72px (collapsed)
- Collapse animation: Framer Motion `animate={{ width }}` 250ms ease-out
- Role-aware nav items rendered from `SIDEBAR_NAV_CONFIG[role]` constant

**`Topbar`** props interface:
```ts
interface TopbarProps {
  onSidebarToggle: () => void;
}
```
Contains: hamburger toggle (mobile), search bar, notification bell + badge, ThemeSwitcher, ProfileMenu.

**`Breadcrumb`** — derives path segments from `useLocation()` + route config map; auto-updates on navigation.

### Reusable Components

| Component | Key Props | Purpose |
|-----------|-----------|---------|
| `DataTable<T>` | `columns`, `rows`, `loading`, `onSort`, `onPage` | Generic paginated sortable table |
| `ConfirmDialog` | `open`, `title`, `message`, `onConfirm`, `onCancel` | Destructive action confirmation |
| `FormModal` | `open`, `title`, `onClose`, `children` | Generic modal wrapper |
| `StatusBadge` | `status: 'active'│'inactive'│'pending'` | Colored chip |
| `KpiCard` | `title`, `value`, `icon`, `trend`, `loading` | Animated counter card |
| `EmptyState` | `title`, `description`, `action`, `illustration` | Zero-data placeholder |
| `SkeletonLoader` | `variant`, `count` | Loading skeleton |
| `Toast` | (managed via Redux `ui` slice + MUI Snackbar) | Brief notifications |

### Unique Feature Components

**`SmartSearch`** — fullscreen modal, `Cmd+K` / `Ctrl+K` trigger, debounced 300ms, grouped results by entity category, navigates on selection.

**`NotificationCenter`** — dropdown panel from bell icon, 60s polling interval via `useQuery` with `refetchInterval`, marks read on click, triggers Toast on new notifications.

**`AiAssistantWidget`** — FAB bottom-right, slide-up `AnimatePresence` panel, context-aware suggestion chips per route.

**`FloatingQuickActions`** — FAB (ADMIN/SUPER_ADMIN only), radial expand on click, stagger animation, role-specific actions.

---

## Data Models

### Redux Store Shape

```ts
// store/index.ts — RootState
interface RootState {
  auth: AuthState;
  tenant: TenantState;
  ui: UiState;
}

// store/slices/authSlice.ts
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;           // JWT stored in localStorage + here
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | null;
  userId: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

// store/slices/tenantSlice.ts
interface TenantState {
  tenantId: number | null;
  companyName: string | null;
  subdomain: string | null;
  customDomain: string | null;
  primaryColor: string | null;    // hex, used by Branding Engine
  logoUrl: string | null;
  bannerUrl: string | null;
  subscriptionPlan: string | null;
  isLoading: boolean;
  error: string | null;
}

// store/slices/uiSlice.ts
interface UiState {
  themeMode: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  toastQueue: ToastMessage[];
}

interface Notification {
  id: number;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface ToastMessage {
  id: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
```

### React Query Key Registry

```ts
// constants/queryKeys.ts
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
  platformHealth: ['platform', 'health'],

  // Admin
  adminTenant: ['admin', 'tenant'],
  adminUsers: ['admin', 'users'],

  // User
  userProfile: ['user', 'profile'],
  userTenant: ['user', 'tenant'],

  // Notifications (polled)
  notifications: ['notifications'],
} as const;
```

### API Service Types

```ts
// services/types/auth.types.ts
interface LoginRequest { email: string; password: string; }
interface LoginResponse {
  token: string;
  role: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}

// services/types/super-admin.types.ts
interface Category { id: number; name: string; description: string; tenantCount?: number; }
interface CategoryRequest { name: string; description: string; }
interface UserResponse {
  id: number; firstName: string; lastName: string; email: string;
  role: string; active: boolean; status: 'ACTIVE'|'INACTIVE'|'PENDING';
  companyName?: string; subdomain?: string; categories?: Category[];
}
interface TenantResponse {
  id: number; companyName: string; subdomain: string;
  customDomain: string | null; active: boolean;
  subscriptionPlan: string | null; adminName: string;
  healthScore?: number;
}
interface AnalyticsResponse {
  totalTenants: number; totalAdmins: number; totalUsers: number;
  monthlyRevenue: number; activeSubscriptions: number;
  newRegistrationsThisMonth: number;
  revenueOverTime: TimeSeriesPoint[];
  tenantGrowthPerMonth: TimeSeriesPoint[];
  categoryDistribution: PiePoint[];
  userGrowthOverTime: TimeSeriesPoint[];
}
interface TimeSeriesPoint { label: string; value: number; }
interface PiePoint { name: string; value: number; }

// services/types/admin.types.ts
interface CreateUserRequest {
  firstName: string; lastName: string; email: string; password: string;
}
interface UpdateUserRequest { firstName: string; lastName: string; active: boolean; }
```

---

## Directory & File Structure

```
src/
├── app/
│   ├── App.tsx                         # Root: ThemeProvider + QueryClient + Store + Router
│   ├── Router.tsx                      # All route definitions with lazy imports
│   └── queryClient.ts                  # React Query client configuration
│
├── assets/
│   ├── logo.svg
│   ├── logo-dark.svg
│   └── illustrations/                  # SVGs for empty states, error pages
│       ├── empty-state.svg
│       ├── not-found.svg
│       ├── forbidden.svg
│       └── server-error.svg
│
├── components/
│   ├── common/
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx
│   │   │   └── DataTable.types.ts
│   │   ├── ConfirmDialog.tsx
│   │   ├── FormModal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── KpiCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SkeletonLoader.tsx
│   │   └── ErrorBoundary.tsx
│   ├── layout/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarNavItem.tsx
│   │   │   └── sidebarConfig.ts
│   │   ├── Topbar/
│   │   │   ├── Topbar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── ThemeSwitcher.tsx
│   │   │   └── ProfileMenu.tsx
│   │   └── Breadcrumb.tsx
│   └── widgets/
│       ├── AiAssistantWidget.tsx
│       ├── FloatingQuickActions.tsx
│       ├── SmartSearch.tsx
│       └── NotificationCenter.tsx
│
├── constants/
│   ├── queryKeys.ts
│   ├── routes.ts
│   └── roles.ts
│
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegisterAdmin.ts
│   │   └── utils/
│   │       ├── decodeToken.ts
│   │       └── roleRedirect.ts
│   └── branding/
│       ├── BrandingProvider.tsx
│       ├── useBranding.ts
│       └── buildTenantTheme.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useNotifications.ts
│   ├── usePlatformHealth.ts
│   └── useMediaQuery.ts
│
├── layouts/
│   ├── SuperAdminLayout.tsx
│   ├── AdminLayout.tsx
│   ├── UserLayout.tsx
│   └── AuthLayout.tsx
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── AdminRegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── OtpPage.tsx
│   │   └── SessionExpiredPage.tsx
│   ├── super-admin/
│   │   ├── DashboardPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── AdminsPage.tsx
│   │   ├── TenantsPage.tsx
│   │   ├── SubscriptionPlansPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── AuditLogsPage.tsx
│   ├── admin/
│   │   ├── DashboardPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── MarketingPage.tsx
│   │   └── SettingsPage.tsx
│   ├── portal/
│   │   ├── HomePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── RewardsPage.tsx
│   │   ├── WalletPage.tsx
│   │   └── SettingsPage.tsx
│   └── errors/
│       ├── NotFoundPage.tsx
│       ├── ForbiddenPage.tsx
│       └── ServerErrorPage.tsx
│
├── routes/
│   ├── ProtectedRoute.tsx
│   └── RoleGuard.tsx
│
├── services/
│   ├── apiClient.ts                    # Axios instance + interceptors
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── super-admin.types.ts
│   │   ├── admin.types.ts
│   │   └── user.types.ts
│   ├── auth.service.ts
│   ├── superAdmin.service.ts
│   ├── admin.service.ts
│   └── user.service.ts
│
├── store/
│   ├── index.ts                        # configureStore
│   └── slices/
│       ├── authSlice.ts
│       ├── tenantSlice.ts
│       └── uiSlice.ts
│
├── theme/
│   ├── index.ts                        # createTheme factory
│   ├── lightTheme.ts
│   ├── darkTheme.ts
│   ├── typography.ts
│   ├── glassmorphism.ts
│   └── themeTokens.ts
│
└── utils/
    ├── formatters.ts                   # date, currency, number formatters
    ├── validators.ts                   # email, password, subdomain validators
    └── storage.ts                      # localStorage helpers
```

---

## Theme Architecture

### MUI Theme Tokens

```ts
// theme/themeTokens.ts
// Light palette
const lightTokens = {
  primary:    { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' },
  secondary:  { main: '#EC4899', light: '#F472B6', dark: '#DB2777' },
  background: { default: '#F8FAFC', paper: '#FFFFFF' },
  text:       { primary: '#0F172A', secondary: '#64748B' },
  success:    { main: '#22C55E' },
  warning:    { main: '#F59E0B' },
  error:      { main: '#EF4444' },
  info:       { main: '#3B82F6' },
};

// Dark palette
const darkTokens = {
  primary:    { main: '#818CF8', light: '#A5B4FC', dark: '#6366F1' },
  secondary:  { main: '#F472B6', light: '#F9A8D4', dark: '#EC4899' },
  background: { default: '#0F172A', paper: '#1E293B' },
  text:       { primary: '#F1F5F9', secondary: '#94A3B8' },
  success:    { main: '#4ADE80' },
  warning:    { main: '#FBBF24' },
  error:      { main: '#F87171' },
  info:       { main: '#60A5FA' },
};
```

### Glassmorphism Tokens

```ts
// theme/glassmorphism.ts — added as MUI theme extension
declare module '@mui/material/styles' {
  interface Theme {
    glass: {
      light: string;  // rgba(255,255,255,0.1) + backdrop-filter: blur(10px)
      medium: string; // rgba(255,255,255,0.15)
      dark: string;   // rgba(0,0,0,0.2)
    };
    gradients: {
      primary: string;   // linear-gradient(135deg, #6366F1 0%, #EC4899 100%)
      success: string;
      surface: string;
    };
  }
}
```

### Tenant Branding Override Strategy

The `BrandingProvider` (wrapping only the `/portal` layout tree) fetches tenant config via `GET /api/v1/user/tenant`, then calls `buildTenantTheme(baseTheme, tenantConfig)` which:

1. Spreads the current light/dark theme.
2. Overrides `palette.primary` with `tenantConfig.primaryColor`.
3. Returns a new MUI theme via `createTheme(mergedConfig)`.
4. Injects the new theme via a nested `ThemeProvider` scoped to the portal.

This means the branding override is isolated — the SUPER_ADMIN and ADMIN portals always use the platform default theme.

```ts
// features/branding/buildTenantTheme.ts
export function buildTenantTheme(
  baseTheme: Theme,
  primaryColor: string
): Theme {
  return createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: {
        main: primaryColor,
        light: lighten(primaryColor, 0.3),
        dark: darken(primaryColor, 0.2),
        contrastText: getContrastText(primaryColor),
      },
    },
  });
}
```

---

## State Management

### Redux Toolkit Slices

**`authSlice`** — manages authentication identity. Populated on login, cleared on logout or 401.
```ts
// Async thunks (thin wrappers that call auth.service then dispatch)
loginThunk(credentials)          // POST /auth/login
adminLoginThunk(credentials)     // POST /auth/admin-login
logoutAction()                   // clears token + localStorage
setCredentialsFromStorage()      // rehydrates on app load
```

**`tenantSlice`** — populated by `BrandingProvider` for USER portal. Cleared on logout.
```ts
setTenantBranding(tenantResponse: TenantResponse)
clearTenantBranding()
```

**`uiSlice`** — pure client state.
```ts
toggleTheme()                    // persisted to localStorage
toggleSidebar()
setSidebarCollapsed(boolean)
pushToast(message: ToastMessage)
removeToast(id: string)
setNotifications(Notification[])
markNotificationRead(id: number)
```

### React Query Configuration

```ts
// app/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,   // 30 seconds
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
```

**Cache invalidation strategy:**
- After any mutation (create/update/delete), call `queryClient.invalidateQueries({ queryKey: QUERY_KEYS.xxx })`.
- Optimistic updates used for toggle-status operations (admin status, user status) with rollback on error.
- Notification polling: `useQuery({ queryKey: QUERY_KEYS.notifications, refetchInterval: 60_000 })`.
- Platform health polling: `useQuery({ queryKey: QUERY_KEYS.platformHealth, refetchInterval: 30_000 })`.

---

## API Integration

### Axios Instance

```ts
// services/apiClient.ts
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject JWT
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — 401 handler
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutAction());
      localStorage.removeItem('token');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);
```

### Service Functions

```ts
// services/auth.service.ts
login(req: LoginRequest): Promise<LoginResponse>
adminLogin(req: LoginRequest): Promise<LoginResponse>
registerAdmin(req: RegisterAdminRequest): Promise<UserResponse>

// services/superAdmin.service.ts
getAnalytics(): Promise<AnalyticsResponse>
getCategories(): Promise<Category[]>
createCategory(req: CategoryRequest): Promise<Category>
updateCategory(id: number, req: CategoryRequest): Promise<Category>
deleteCategory(id: number): Promise<void>
getAdmins(): Promise<UserResponse[]>
createAdmin(req: CreateAdminWithTenantRequest): Promise<UserResponse>
updateAdmin(id: number, req: UpdateAdminRequest): Promise<UserResponse>
toggleAdminStatus(id: number, active: boolean): Promise<UserResponse>
approveAdmin(id: number): Promise<UserResponse>
assignCategories(id: number, req: AssignCategoriesRequest): Promise<UserResponse>
getTenants(): Promise<TenantResponse[]>
updateSubdomain(id: number, subdomain: string): Promise<TenantResponse>
updateCustomDomain(id: number, req: CustomDomainRequest): Promise<TenantResponse>
toggleTenantStatus(id: number, active: boolean): Promise<TenantResponse>
deleteTenant(id: number): Promise<void>
getSubscriptionPlans(): Promise<SubscriptionPlan[]>
createSubscriptionPlan(req: SubscriptionPlanRequest): Promise<SubscriptionPlan>
updateSubscriptionPlan(id: number, req: SubscriptionPlanRequest): Promise<SubscriptionPlan>
deleteSubscriptionPlan(id: number): Promise<void>
getSettings(): Promise<PlatformSetting[]>
updateSetting(req: PlatformSettingRequest): Promise<PlatformSetting>

// services/admin.service.ts
getTenantInfo(): Promise<TenantResponse>
getUsers(): Promise<UserResponse[]>
createUser(req: CreateUserRequest): Promise<UserResponse>
updateUser(id: number, req: UpdateUserRequest): Promise<UserResponse>
deleteUser(id: number): Promise<void>

// services/user.service.ts
getProfile(): Promise<UserResponse>
updateProfile(req: UpdateProfileRequest): Promise<UserResponse>
getTenantInfo(): Promise<TenantResponse>
```

---

## Module Designs

### Authentication Screens

**`LoginPage`** — Split-screen layout (MUI Grid, 50/50 on desktop, stacked on mobile):
- Left panel: Framer Motion animated brand illustration + tagline.
- Right panel: Email + Password form, "Admin Login" toggle, "Forgot Password" link, inline error display.
- On submit: dispatches `loginThunk`, on success decodes JWT role via `decodeToken(token)` and redirects via `roleRedirect(role)`.
- Role redirect map: `SUPER_ADMIN → /super-admin/dashboard`, `ADMIN → /admin/dashboard`, `USER → /portal/home`.

**`AdminRegisterPage`** — Single-column form at `/register`. Fields: firstName, lastName, email, password, companyName, subdomain. Client-side subdomain regex: `/^[a-z0-9][a-z0-9-]*[a-z0-9]$/`. On success: shows pending-approval message card.

**`OtpPage`** — Six separate single-character `<input>` fields with auto-focus-advance on input and auto-focus-back on backspace.

### SUPER_ADMIN Dashboard

Key sections:
1. **KPI Row** — 6 × `KpiCard`, data from `GET /api/v1/super-admin/analytics`. Counter animation via Framer Motion `useMotionValue` + `useTransform` on mount.
2. **Charts Row** — Revenue line chart, Tenant Growth bar chart (Recharts `ResponsiveContainer`).
3. **Lower Row** — Category Distribution pie, User Growth area chart.
4. **Activity Feed** — most recent 10 events from analytics response.
5. **Platform Status Monitor** — polled every 30s from `GET /actuator/health`; red banner when `status !== 'UP'`.
6. **Maintenance banner** — shown when settings key `maintenance_mode === 'true'`.

### SUPER_ADMIN Tenants Page

Data table with embedded `HealthScoreBar` component:
```ts
// Health score coloring logic
function healthScoreColor(score: number): 'error' | 'warning' | 'success' {
  if (score <= 40) return 'error';
  if (score <= 70) return 'warning';
  return 'success';
}
```
Inline subdomain edit uses a row-level `isEditing` state toggle; custom domain uses `FormModal`.

### Subscription Plans Page

Card grid instead of data table. Each `PlanCard` shows name, price, duration, features list, active badge. Inactive cards rendered at 50% opacity with `pointer-events: none` badge overlay.

### ADMIN Dashboard

4 KPI cards + 3 Recharts charts + Tenant Info panel (from `GET /api/v1/admin/tenant`) + Business Growth Score circular indicator (MUI CircularProgress variant with Framer Motion counter).

### Animation Strategy

```ts
// Page transition wrapper (used in each Layout's <Outlet> wrapper)
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// Stagger list container
const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// Card hover (applied via MUI sx or inline style)
const cardHover = {
  whileHover: { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  transition: { duration: 0.2 },
};
```

### Performance Strategy

- **Code splitting**: every page is `React.lazy`. Each role's layout tree is one chunk. Target: initial bundle < 250 KB gzipped.
- **Memoization**: `React.memo` on `DataTable` row components; `useMemo` for derived totals/filtered lists in dashboard pages; `useCallback` for event handlers passed to child components.
- **List virtualization**: For tables > 100 rows, use `react-window` `FixedSizeList`.
- **Image optimization**: tenant logos/banners loaded with `loading="lazy"` and width/height attributes.
- **Font**: `@fontsource/inter` subset — latin only, weights 400/500/600/700.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: JWT Interceptor Always Attaches Token

*For any* valid JWT string stored in the auth state, every outgoing Axios request produced by the API client SHALL have an `Authorization: Bearer {token}` header whose value exactly equals the stored token.

**Validates: Requirements 1.4**

---

### Property 2: Route Guard Redirects for Any Unauthorized Access

*For any* combination of (authentication state, user role, target route), the route guard system SHALL redirect unauthenticated users to `/login`, and SHALL redirect authenticated users whose role does not match the route's required role to their own role's default dashboard. No combination of valid role + mismatched route SHALL render the protected page content.

**Validates: Requirements 4.2, 4.3**

---

### Property 3: JWT Role Claim Maps to Correct Dashboard Redirect

*For any* JWT token containing a valid role claim (`SUPER_ADMIN`, `ADMIN`, or `USER`), decoding the token and calling the role-redirect function SHALL always produce the correct destination path (`/super-admin/dashboard`, `/admin/dashboard`, or `/portal/home` respectively), and SHALL never produce a path belonging to a different role.

**Validates: Requirements 3.2**

---

### Property 4: Auth Form Validation Rejects All Invalid Inputs

*For any* string that is not a valid email address format, the email validation function SHALL return an error. *For any* password string shorter than 8 characters, the password validation function SHALL return an error. *For any* field where the value is an empty string or contains only whitespace, the required-field validation SHALL return an error. No invalid input SHALL pass through to a backend call.

**Validates: Requirements 3.10, 25.4**

---

### Property 5: Email Field Preserved on Login Failure

*For any* error message string returned from the backend on a failed login attempt, after the error is displayed the email input field's value SHALL remain unchanged and equal to the value submitted in the failed attempt.

**Validates: Requirements 3.3**

---

### Property 6: Branding Engine Applies Tenant Color Accurately

*For any* valid hex color string provided as a tenant's primary color, applying `buildTenantTheme(baseTheme, hexColor)` SHALL produce a MUI theme whose `palette.primary.main` is exactly equal to the input hex color string, and whose `palette.primary.contrastText` passes WCAG AA contrast ratio (≥ 4.5:1) against `palette.primary.main`.

**Validates: Requirements 17.2**

---

### Property 7: Search Debounce Fires Exactly Once After Inactivity

*For any* sequence of keystrokes where the final keystroke is followed by at least 300 ms of inactivity, the search execution function SHALL be called exactly once — regardless of how many keystrokes preceded the pause. *For any* sequence of keystrokes where all keystrokes are spaced less than 300 ms apart, the search execution function SHALL not be called until the 300 ms inactivity period elapses after the final keystroke.

**Validates: Requirements 20.2, 5.4**

---

### Property 8: Subdomain Validation Accepts Only Valid Identifiers

*For any* string that matches the pattern `/^[a-z0-9][a-z0-9-]*[a-z0-9]$/`, the subdomain validator SHALL return valid. *For any* string containing uppercase letters, spaces, underscores, or any special character other than a hyphen, or any string that starts or ends with a hyphen, the subdomain validator SHALL return an error.

**Validates: Requirements 25.4**

---

## Error Handling

### API Error Handling

All service functions propagate Axios errors. React Query's `onError` callback surfaces them to the UI. The pattern for every query/mutation:

```ts
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: QUERY_KEYS.categories,
  queryFn: superAdminService.getCategories,
});

// In JSX:
if (isError) return <InlineError message={error.message} onRetry={refetch} />;
```

Mutations use `onSuccess` to push a success Toast and invalidate queries, and `onError` to push an error Toast with the backend error message extracted from `error.response?.data?.message`.

### Global Error Boundary

`ErrorBoundary` component wraps the router outlet. Catches unhandled React render errors and displays the `ServerErrorPage` (Requirement 24.3).

### HTTP Status Mapping

| Status | Handling |
|--------|----------|
| 400 | Display field-level errors from `error.response.data` |
| 401 | Interceptor: clear token, redirect to `/login` |
| 403 | Navigate to `/403` |
| 404 | Navigate to `/404` |
| 5xx | Display inline error state with Retry button |

### Branding Failure Fallback

`BrandingProvider` wraps the tenant fetch in a `try/catch`. On failure: `tenantSlice` remains with `null` values; `buildTenantTheme` is not called; the portal renders with the platform default theme and platform logo. No error message is shown to the USER (Requirement 17.6).

---

## Testing Strategy

### Overview

Two complementary test types ensure both behavioral correctness and universal property coverage:

- **Unit / example-based tests**: specific scenarios, integration points, error conditions
- **Property-based tests**: universal properties across generated input spaces

### Property-Based Testing Setup

Library: **fast-check** (TypeScript-first, excellent arbitrary generators, integrates with Vitest).

```bash
npm install --save-dev fast-check @vitest/coverage-v8
```

Each property test runs a minimum of **100 iterations** (fast-check default: 100).

Tag comment format on every property test:
```ts
// Feature: multi-tenant-saas-frontend, Property N: <property text>
```

### Property Tests

```ts
// tests/properties/jwtInterceptor.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 1: JWT interceptor always attaches token
test('attaches Bearer token to every request', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 10 }), // arbitrary JWT-like string
    (token) => {
      const config = jwtInterceptor({ headers: {} } as InternalAxiosRequestConfig, token);
      expect(config.headers.Authorization).toBe(`Bearer ${token}`);
    }
  ), { numRuns: 100 });
});

// tests/properties/routeGuard.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 2: Route guard redirects for any unauthorized access
test('unauthenticated user always redirected to /login', () => {
  fc.assert(fc.property(
    fc.constantFrom(...ALL_PROTECTED_ROUTES),
    (route) => {
      const { location } = renderWithRouter(<ProtectedRoute />, { route, auth: null });
      expect(location.pathname).toBe('/login');
    }
  ), { numRuns: 100 });
});

// tests/properties/roleRedirect.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 3: JWT role maps to correct dashboard
test('each role maps to its own dashboard', () => {
  fc.assert(fc.property(
    fc.constantFrom('SUPER_ADMIN', 'ADMIN', 'USER'),
    (role) => {
      const path = roleRedirect(role);
      const expected = ROLE_DASHBOARD_MAP[role];
      expect(path).toBe(expected);
      // Must not be another role's path
      const otherPaths = Object.values(ROLE_DASHBOARD_MAP).filter(p => p !== expected);
      expect(otherPaths).not.toContain(path);
    }
  ), { numRuns: 100 });
});

// tests/properties/authValidation.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 4: Auth form rejects all invalid inputs
test('invalid emails always fail validation', () => {
  fc.assert(fc.property(
    fc.string().filter(s => !EMAIL_REGEX.test(s)),
    (invalidEmail) => {
      expect(validateEmail(invalidEmail)).not.toBe(null);
    }
  ), { numRuns: 200 });
});

test('passwords under 8 chars always fail', () => {
  fc.assert(fc.property(
    fc.string({ maxLength: 7 }),
    (shortPwd) => expect(validatePassword(shortPwd)).not.toBe(null)
  ), { numRuns: 100 });
});

// tests/properties/loginErrorState.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 5: Email preserved on login failure
test('email field unchanged after any login error', () => {
  fc.assert(fc.property(
    fc.emailAddress(),
    fc.string({ minLength: 1 }),
    (email, errorMsg) => {
      const { getByLabelText } = renderLoginForm({ email });
      simulateLoginError(errorMsg);
      expect(getByLabelText('Email').value).toBe(email);
    }
  ), { numRuns: 100 });
});

// tests/properties/brandingEngine.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 6: Branding engine applies tenant color accurately
test('buildTenantTheme sets primary.main to input color', () => {
  fc.assert(fc.property(
    fc.hexaString({ minLength: 6, maxLength: 6 }).map(h => `#${h}`),
    (hexColor) => {
      const theme = buildTenantTheme(baseTheme, hexColor);
      expect(theme.palette.primary.main).toBe(hexColor);
    }
  ), { numRuns: 100 });
});

// tests/properties/debounce.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 7: Search debounce fires exactly once after inactivity
test('debounce calls fn exactly once after inactivity period', () => {
  fc.assert(fc.property(
    fc.array(fc.nat({ max: 290 }), { minLength: 1, maxLength: 20 }),
    (intervalsBetweenKeystrokes) => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      // all keystrokes < 300ms apart
      intervalsBetweenKeystrokes.forEach(interval => {
        vi.advanceTimersByTime(interval);
        debounced();
      });
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
    }
  ), { numRuns: 100 });
});

// tests/properties/subdomainValidation.property.test.ts
// Feature: multi-tenant-saas-frontend, Property 8: Subdomain accepts only valid identifiers
test('valid subdomains always pass', () => {
  fc.assert(fc.property(
    fc.stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
    (valid) => expect(validateSubdomain(valid)).toBe(null)
  ), { numRuns: 100 });
});

test('subdomains with invalid chars always fail', () => {
  fc.assert(fc.property(
    fc.string().filter(s => /[A-Z\s_!@#$%^&*]/.test(s)),
    (invalid) => expect(validateSubdomain(invalid)).not.toBe(null)
  ), { numRuns: 100 });
});
```

### Unit / Example-Based Tests

| Area | Test | Type |
|------|------|------|
| Auth | 401 response clears token and redirects | EXAMPLE |
| Auth | Successful login dispatches correct Redux state | EXAMPLE |
| Branding | Fallback to default theme on fetch failure | EXAMPLE |
| Categories | Create/edit/delete mutations invalidate query cache | EXAMPLE |
| Notifications | Bell badge count increments on new notification | EXAMPLE |
| Search | No results state renders correct empty state message | EXAMPLE |
| Route | 404 page renders for unknown path | EXAMPLE |
| Route | 403 page renders for role mismatch without redirect option | EXAMPLE |

### Integration Tests

| Area | Test | Type |
|------|------|------|
| API Client | Actual Axios instance sends request to mock server with token | INTEGRATION |
| Platform health | Polling correctly shows red banner on unhealthy status | INTEGRATION |

### Testing Configuration

```ts
// vite.config.ts test block
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  coverage: { provider: 'v8', threshold: { lines: 80 } },
}
```
