
`+-# Implementation Plan: Multi-Tenant SaaS Frontend

## Overview

This plan breaks the enterprise-grade React 19 + TypeScript frontend into discrete, dependency-ordered coding tasks. Each task builds on the previous ones — scaffolding first, then shared infrastructure, then role-specific features, then unique/advanced widgets, then property-based and unit tests. All tasks reference the specific acceptance-criteria clauses they satisfy.

---

## Tasks

- [x] 1. Scaffold project and configure toolchain
  - Bootstrap Vite + React 19 + TypeScript (strict mode) project
  - Install and pin all dependencies: MUI v6+, React Router v7, Redux Toolkit 2, React Query v5, Axios 1.x, Framer Motion 11, Recharts 2, `@fontsource/inter`, fast-check, Vitest, jsdom
  - Create the full `src/` directory tree: `app`, `pages`, `routes`, `layouts`, `components`, `features`, `services`, `hooks`, `store`, `theme`, `assets`, `utils`, `constants`
  - Configure TypeScript path aliases (`@/app`, `@/pages`, etc.) in `tsconfig.json` and `vite.config.ts`
  - Configure ESLint (`@typescript-eslint`) + Prettier; ensure zero errors on clean build
  - Configure Vitest with `globals: true`, `environment: jsdom`, `setupFiles`, and v8 coverage threshold (80%)
  - _Requirements: 1.1, 1.2, 1.3, 1.7, 26.3, 26.4, 26.6_

- [x] 2. Implement core utilities and constants
  -524 [x] 2.1 Create utility modules
    - Write `src/utils/formatters.ts` — date, currency, and number formatters
    - Write `src/utils/validators.ts` — `validateEmail`, `validatePassword`, `validateSubdomain`, `validateRequired`
    - Write `src/utils/storage.ts` — typed `localStorage` get/set/remove helpers
    - _Requirements: 3.10, 25.4_
  - [x] 2.2 Create constants modules
    - Write `src/constants/queryKeys.ts` with the full `QUERY_KEYS` registry
    - Write `src/constants/routes.ts` with all route path strings
    - Write `src/constants/roles.ts` with role enum and `ROLE_DASHBOARD_MAP`
    - _Requirements: 1.3, 4.1_

- [x] 3. Implement API client and service layer
  - [x] 3.1 Create Axios API client with interceptors
    - Write `src/services/apiClient.ts` — Axios instance with `baseURL: 'http://localhost:8080/api/v1'`
    - Implement request interceptor: read `auth.token` from Redux store and attach `Authorization: Bearer {token}` header
    - Implement response interceptor: on 401 dispatch `logoutAction()`, clear `localStorage`, redirect to `/login`
    - _Requirements: 1.4, 1.5_
  - [x] 3.2 Create TypeScript service type definitions
    - Write `src/services/types/auth.types.ts` — `LoginRequest`, `LoginResponse`, `RegisterAdminRequest`
    - Write `src/services/types/super-admin.types.ts` — `Category`, `CategoryRequest`, `UserResponse`, `TenantResponse`, `AnalyticsResponse`, `SubscriptionPlan`, `PlatformSetting`, `TimeSeriesPoint`, `PiePoint`
    - Write `src/services/types/admin.types.ts` — `CreateUserRequest`, `UpdateUserRequest`
    - Write `src/services/types/user.types.ts` — `UpdateProfileRequest`
    - _Requirements: 26.3_
  - [x] 3.3 Implement service modules
    - Write `src/services/auth.service.ts` — `login`, `adminLogin`, `registerAdmin`
    - Write `src/services/superAdmin.service.ts` — all super-admin service functions (analytics, categories, admins, tenants, plans, settings)
    - Write `src/services/admin.service.ts` — `getTenantInfo`, `getUsers`, `createUser`, `updateUser`, `deleteUser`
    - Write `src/services/user.service.ts` — `getProfile`, `updateProfile`, `getTenantInfo`
    - _Requirements: 1.4, 6.2, 7.2, 8.2, 9.2, 10.2, 11.3, 13.3, 14.2, 16.2_

- [x] 4. Implement Redux store and slices
  - [x] 4.1 Configure Redux store and slices
    - Write `src/store/slices/authSlice.ts` — `AuthState`, `loginThunk`, `logoutAction`, `setCredentialsFromStorage`
    - Write `src/store/slices/tenantSlice.ts` — `TenantState`, `setTenantBranding`, `clearTenantBranding`
    - Write `src/store/slices/uiSlice.ts` — `UiState`, `toggleTheme`, `toggleSidebar`, `setSidebarCollapsed`, `pushToast`, `removeToast`, `setNotifications`, `markNotificationRead`
    - Write `src/store/index.ts` — `configureStore` wiring all three slices
    - _Requirements: 1.5, 2.3, 2.4, 5.2, 19.4_

- [x] 5. Implement React Query client and app root
  - [x] 5.1 Configure React Query client
    - Write `src/app/queryClient.ts` — `QueryClient` with `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: true`
    - _Requirements: 1.6_
  - [x] 5.2 Wire application root
    - Write `src/app/App.tsx` — compose `ThemeProvider`, `QueryClientProvider`, Redux `Provider`, `BrowserRouter`, and `Router`
    - _Requirements: 2.6, 1.6_

- [x] 6. Implement global theme system
  - [x] 6.1 Create MUI theme files
    - Write `src/theme/themeTokens.ts` — `lightTokens` and `darkTokens` palette objects
    - Write `src/theme/typography.ts` — Inter font family config, weight scale 400/500/600/700
    - Write `src/theme/glassmorphism.ts` — MUI theme module augmentation for `glass` and `gradients` tokens
    - Write `src/theme/lightTheme.ts` and `src/theme/darkTheme.ts` — full MUI theme objects
    - Write `src/theme/index.ts` — `createAppTheme(mode)` factory function
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

- [x] 7. Implement shared reusable components
  - [x] 7.1 Implement DataTable component
    - Write `src/components/common/DataTable/DataTable.types.ts` — `Column<T>`, `DataTableProps<T>` interfaces
    - Write `src/components/common/DataTable/DataTable.tsx` — generic paginated sortable table with loading skeleton, empty state slot, and mobile card-list fallback below 768px
    - _Requirements: 7.1, 8.1, 9.1, 14.1, 23.3_
  - [x] 7.2 Implement common utility components
    - Write `src/components/common/ConfirmDialog.tsx` — MUI Dialog with confirm/cancel callbacks
    - Write `src/components/common/FormModal.tsx` — generic modal wrapper with title and close button
    - Write `src/components/common/StatusBadge.tsx` — colored MUI Chip for `active` / `inactive` / `pending` states
    - Write `src/components/common/KpiCard.tsx` — animated counter card using Framer Motion `useMotionValue` + `useTransform`, 1000ms spring on mount, hover lift effect
    - Write `src/components/common/EmptyState.tsx` — illustration + title + description + optional CTA button
    - Write `src/components/common/SkeletonLoader.tsx` — variant and count props
    - Write `src/components/common/ErrorBoundary.tsx` — React error boundary that renders `ServerErrorPage`
    - _Requirements: 6.4, 7.7, 8.7, 9.5, 14.6, 18.2, 18.3, 24.3, 24.5_

- [x] 8. Implement layout components (Sidebar, Topbar, Breadcrumb)
  - [x] 8.1 Implement Sidebar component
    - Write `src/components/layout/Sidebar/sidebarConfig.ts` — `SIDEBAR_NAV_CONFIG` for all three roles (SUPER_ADMIN: Dashboard, Categories, Admin Management, Tenant Management, Subscription Plans, Analytics, Domain Management, Platform Settings, Audit Logs; ADMIN: Dashboard, Users, Products, Orders, Reports, Inventory, Marketing, Settings; USER: Home, Profile, Orders, Wishlist, Notifications, Rewards, Wallet, Settings)
    - Write `src/components/layout/Sidebar/SidebarNavItem.tsx` — nav item with icon, label, active-state highlight
    - Write `src/components/layout/Sidebar/Sidebar.tsx` — 240px expanded / 72px collapsed, Framer Motion `animate={{ width }}` 250ms ease-out, hidden by default on <768px, loading skeleton during auth hydration
    - _Requirements: 5.1, 5.2, 5.7, 5.8, 23.2_
  - [x] 8.2 Implement Topbar component
    - Write `src/components/layout/Topbar/ThemeSwitcher.tsx` — toggle that dispatches `toggleTheme()` and persists to `localStorage`
    - Write `src/components/layout/Topbar/ProfileMenu.tsx` — avatar dropdown with logout action
    - Write `src/components/layout/Topbar/NotificationBell.tsx` — bell icon with unread badge, pulse animation on new notification
    - Write `src/components/layout/Topbar/SearchBar.tsx` — expandable bar with fade-in animation and 300ms debounce
    - Write `src/components/layout/Topbar/Topbar.tsx` — assembles hamburger + SearchBar + NotificationBell + ThemeSwitcher + ProfileMenu
    - _Requirements: 5.3, 5.4, 5.6, 5.8_
  - [x] 8.3 Implement Breadcrumb component
    - Write `src/components/layout/Breadcrumb.tsx` — derives path segments from `useLocation()` + route config map, auto-updates on navigation
    - _Requirements: 5.5_

- [x] 9. Implement route guards and role-based routing
  - [x] 9.1 Create route guard components
    - Write `src/routes/ProtectedRoute.tsx` — checks `auth.isAuthenticated`; redirects to `/login` if false
    - Write `src/routes/RoleGuard.tsx` — checks `auth.role` matches required role; redirects to user's own dashboard if not
    - _Requirements: 4.2, 4.3_
  - [x] 9.2 Create layout files
    - Write `src/layouts/AuthLayout.tsx` — minimal wrapper for public auth pages
    - Write `src/layouts/SuperAdminLayout.tsx` — `Sidebar (SUPER_ADMIN) + Topbar + AnimatePresence <Outlet />`
    - Write `src/layouts/AdminLayout.tsx` — `Sidebar (ADMIN) + Topbar + AnimatePresence <Outlet />`
    - Write `src/layouts/UserLayout.tsx` — `Sidebar (USER) + Topbar + AnimatePresence <Outlet />`
    - Each layout wraps the outlet in page transition variants (300ms fade-and-slide)
    - _Requirements: 4.1, 18.1_
  - [x] 9.3 Define all application routes with lazy loading
    - Write `src/app/Router.tsx` — all route definitions with `React.lazy` imports for every page-level component, wrapped in `<Suspense fallback={<FullscreenSkeleton />}>`
    - Define `/super-admin/*`, `/admin/*`, `/portal/*` trees behind `ProtectedRoute` + `RoleGuard`
    - Define public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/otp`, `/session-expired`
    - Define `/404` and `/403` error routes; catch-all `*` → 404
    - Redirect authenticated users away from `/login` to their role dashboard
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 3.9, 26.2_

- [ ] 10. Checkpoint — Core infrastructure complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement authentication module pages
  - [x] 11.1 Implement LoginPage
    - Write `src/pages/auth/LoginPage.tsx` — split-screen layout (50/50 desktop, stacked mobile), Framer Motion animated illustration panel on left, email + password form on right
    - Dispatch `loginThunk` on submit; decode JWT role via `decodeToken(token)`; redirect via `roleRedirect(role)`
    - Display inline error on failure; preserve email field value on error
    - Client-side validation: email format, password ≥ 8 chars, required fields — no backend call on invalid input
    - _Requirements: 3.1, 3.2, 3.3, 3.8, 3.9, 3.10_
  - [x] 11.2 Implement Admin Registration and OTP pages
    - Write `src/pages/auth/AdminRegisterPage.tsx` — single-column form (firstName, lastName, email, password, companyName, subdomain); call `POST /api/v1/auth/register-admin`; show pending-approval card on success; display field-level errors on 400
    - Write `src/pages/auth/OtpPage.tsx` — six single-character inputs with auto-focus-advance on input and auto-focus-back on backspace
    - _Requirements: 3.6, 25.1, 25.2, 25.3, 25.4_
  - [x] 11.3 Implement password-reset and session pages
    - Write `src/pages/auth/ForgotPasswordPage.tsx` — email input form
    - Write `src/pages/auth/ResetPasswordPage.tsx` — reads token from URL query param; new password + confirm form
    - Write `src/pages/auth/SessionExpiredPage.tsx` — expired session message with "Return to Login" button
    - _Requirements: 3.4, 3.5, 3.7, 3.8_

- [x] 12. Implement custom hooks
  - [x] 12.1 Write shared hooks
    - Write `src/hooks/useAuth.ts` — reads `auth` slice from Redux, exposes `isAuthenticated`, `role`, `user`
    - Write `src/hooks/useDebounce.ts` — debounce hook with configurable delay
    - Write `src/hooks/useNotifications.ts` — `useQuery` with `refetchInterval: 60_000`; dispatches `setNotifications` and pushes Toast on new items
    - Write `src/hooks/usePlatformHealth.ts` — `useQuery` with `refetchInterval: 30_000` polling `/actuator/health`
    - Write `src/hooks/useMediaQuery.ts` — MUI breakpoint-aware boolean hook
    - _Requirements: 1.5, 5.4, 6.6, 19.4, 23.1_

- [ ] 13. Implement SUPER_ADMIN pages
  - [x] 13.1 Implement SUPER_ADMIN Dashboard page
    - Write `src/pages/super-admin/DashboardPage.tsx`
    - 6 × `KpiCard` (Total Tenants, Total Admins, Total Users, Monthly Revenue, Active Subscriptions, New Registrations) fed from `GET /api/v1/super-admin/analytics`
    - Recharts: Revenue line chart, Tenant Growth bar chart, Category Distribution pie chart, User Growth area chart
    - Activity Feed (10 most recent events), Platform Status Monitor (`usePlatformHealth` hook — red banner on unhealthy), maintenance mode yellow banner (when `maintenance_mode === 'true'`)
    - Skeleton placeholders for all cards and charts during loading
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 11.4_
  - [x] 13.2 Implement SUPER_ADMIN Categories page
    - Write `src/pages/super-admin/CategoriesPage.tsx`
    - DataTable with columns: Name, Description, Tenants Count, Actions
    - Create/Edit `FormModal`, Delete `ConfirmDialog`; API calls: `POST`, `PUT`, `DELETE /api/v1/super-admin/categories`
    - Success/error Toast + query cache invalidation on mutation; `EmptyState` when list is empty
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [x] 13.3 Implement SUPER_ADMIN Admin Management page
    - Write `src/pages/super-admin/AdminsPage.tsx`
    - DataTable with columns: Name, Email, Company, Status, Categories, Actions
    - Create modal (`POST /api/v1/super-admin/admins`), Edit modal (`PUT /api/v1/super-admin/admins/{id}`)
    - Assign Categories multi-select (`PUT /api/v1/super-admin/admins/{id}/categories`)
    - Toggle active status switch with optimistic update (`PUT /api/v1/super-admin/admins/{id}/status`)
    - Approve button for pending admins (`PUT /api/v1/super-admin/admins/{id}/approve`)
    - `StatusBadge` with green/red/yellow colors
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [x] 13.4 Implement SUPER_ADMIN Tenant Management page
    - Write `src/pages/super-admin/TenantsPage.tsx`
    - DataTable with columns: Company Name, Subdomain URL, Custom Domain, Admin, Status, Plan, Actions
    - Inline subdomain edit (row-level `isEditing` state), Custom Domain `FormModal`
    - `HealthScoreBar` component: 0–40 red, 41–70 amber, 71–100 green MUI LinearProgress
    - `EmptyState` for empty list
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 13.5 Implement SUPER_ADMIN Subscription Plans page
    - Write `src/pages/super-admin/SubscriptionPlansPage.tsx`
    - Card grid layout (`PlanCard` component): Name, Price, Duration, Features, Active badge
    - Create/Edit modal, Delete `ConfirmDialog`; API calls: `POST`, `PUT`, `DELETE /api/v1/super-admin/subscription-plans`
    - Inactive cards at 50% opacity with `pointer-events: none` overlay
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 13.6 Implement SUPER_ADMIN Analytics page
    - Write `src/pages/super-admin/AnalyticsPage.tsx`
    - Revenue over Time line chart, New Tenants per Month bar chart, Subscriptions by Plan donut chart — all with tooltip hover states
    - Date-range filter control for custom start/end date
    - Skeleton placeholders during loading
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [x] 13.7 Implement SUPER_ADMIN Platform Settings and Audit Logs pages
    - Write `src/pages/super-admin/SettingsPage.tsx` — key-value list; inline editable input on "Edit" click; `PUT /api/v1/super-admin/settings` on confirm
    - Write `src/pages/super-admin/AuditLogsPage.tsx` — read-only data table of audit events
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 14. Implement ADMIN pages
  - [ ] 14.1 Implement ADMIN Dashboard page
    - Write `src/pages/admin/DashboardPage.tsx`
    - 4 × `KpiCard` (Sales Today, Orders Today, Revenue, New Customers)
    - Recharts: Sales Analytics line chart, Customer Analytics bar chart, Product Performance horizontal bar chart
    - Tenant Info panel from `GET /api/v1/admin/tenant` (company name, subdomain, subscription plan)
    - Business Growth Score — Framer Motion animated circular progress (0–100)
    - Skeleton placeholders during loading
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - [ ] 14.2 Implement ADMIN User Management page
    - Write `src/pages/admin/UsersPage.tsx`
    - DataTable: Name, Email, Status, Created Date, Actions
    - Create/Edit modal; Delete `ConfirmDialog`; API calls: `POST`, `PUT`, `DELETE /api/v1/admin/users`
    - `StatusBadge` green/red; `EmptyState` when empty
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  - [ ] 14.3 Implement ADMIN Products, Orders, Reports, Inventory, and Marketing pages
    - Write `src/pages/admin/ProductsPage.tsx` — DataTable + CRUD modals (mock state); "Demo Data" badge
    - Write `src/pages/admin/OrdersPage.tsx` — searchable/filterable table + order detail drawer; "Demo Data" badge
    - Write `src/pages/admin/ReportsPage.tsx` — exportable summary charts with PDF/CSV export buttons; "Demo Data" badge
    - Write `src/pages/admin/InventoryPage.tsx` — stock level table with low-stock alert badge; "Demo Data" badge
    - Write `src/pages/admin/MarketingPage.tsx` — campaign cards + "Create Campaign" modal; "Demo Data" badge
    - Write `src/pages/admin/SettingsPage.tsx` — account + notification preferences sections
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 15. Implement multi-tenant Branding Engine and USER Portal
  - [ ] 15.1 Implement Branding Engine
    - Write `src/features/branding/buildTenantTheme.ts` — `buildTenantTheme(baseTheme, primaryColor)` using MUI `createTheme`, `lighten`, `darken`, `getContrastText`
    - Write `src/features/branding/useBranding.ts` — custom hook that fetches `GET /api/v1/user/tenant`, dispatches `setTenantBranding`, and exposes branding state
    - Write `src/features/branding/BrandingProvider.tsx` — fetches tenant config, calls `buildTenantTheme`, injects result via nested `ThemeProvider` scoped to portal; skeleton in sidebar logo + hero during load; falls back to platform defaults silently on error
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_
  - [ ] 15.2 Implement USER Portal pages
    - Write `src/pages/portal/HomePage.tsx` — personalised greeting banner, Recommendations section, Recent Activity feed
    - Write `src/pages/portal/ProfilePage.tsx` — view/update personal info form (`GET`/`PUT /api/v1/user/profile`)
    - Write `src/pages/portal/OrdersPage.tsx` — searchable order history list
    - Write `src/pages/portal/WishlistPage.tsx` — saved items card grid
    - Write `src/pages/portal/NotificationsPage.tsx` — notifications list with read/unread states
    - Write `src/pages/portal/RewardsPage.tsx` — Loyalty Points balance, membership tier badge, referral code widget
    - Write `src/pages/portal/WalletPage.tsx` — balance display, transaction history, top-up CTA
    - Write `src/pages/portal/SettingsPage.tsx` — account security, notification preferences, appearance
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 16. Implement error pages and global Toast system
  - [ ] 16.1 Implement error pages
    - Write `src/pages/errors/NotFoundPage.tsx` — illustration + message + "Return to Dashboard" button
    - Write `src/pages/errors/ForbiddenPage.tsx` — illustration + message + "Go Back" button
    - Write `src/pages/errors/ServerErrorPage.tsx` — error boundary fallback page
    - _Requirements: 4.5, 4.6, 24.1, 24.2, 24.3_
  - [ ] 16.2 Implement global Toast notification system
    - Wire `uiSlice.toastQueue` to a MUI `Snackbar` + `Alert` renderer in `App.tsx`
    - Auto-dismiss success toasts after 4s; keep error toasts until dismissed
    - _Requirements: 7.5, 7.6, 8.2, 9.2, 10.2_

- [ ] 17. Implement advanced widget components
  - [ ] 17.1 Implement Smart Search widget
    - Write `src/components/widgets/SmartSearch.tsx` — fullscreen modal triggered by `Cmd+K` / `Ctrl+K`, debounced 300ms search against React Query cache, results grouped by category (Pages, Tenants, Admins, Users) with icons, navigate on selection, `EmptyState` for no results
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  - [ ] 17.2 Implement Notification Center widget
    - Write `src/components/widgets/NotificationCenter.tsx` — dropdown panel (20 most recent), timestamp + message + read/unread state; mark read on click, navigate if link present; feeds `useNotifications` hook polling every 60s; Toast on new notifications
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  - [ ] 17.3 Implement AI Assistant widget
    - Write `src/components/widgets/AiAssistantWidget.tsx` — FAB bottom-right on all authenticated pages; slide-up `AnimatePresence` panel; context-aware suggestion chips per route/role; slide-down collapse
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_
  - [ ] 17.4 Implement Floating Quick Actions widget
    - Write `src/components/widgets/FloatingQuickActions.tsx` — FAB for ADMIN and SUPER_ADMIN only; radial expand with stagger animation on click; SUPER_ADMIN actions: Create Admin, Create Category, View Analytics; ADMIN actions: Create User, New Order, View Reports; navigate or open modal on selection
    - _Requirements: 22.1, 22.2, 22.3_

- [ ] 18. Checkpoint — Feature pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement animation and responsive polish
  - [ ] 19.1 Apply page transition and stagger animations
    - Apply `AnimatePresence` with `pageVariants` (300ms fade-and-slide) around each layout's `<Outlet>`
    - Apply `containerVariants` + `itemVariants` stagger (50ms delay) to all list/card-grid renders
    - Apply `cardHover` (y: -4, 200ms) to all clickable cards
    - Apply 200ms CSS transitions to all button hover states, focus rings, and input border changes
    - _Requirements: 18.1, 18.2, 18.4, 18.5, 18.7_
  - [ ] 19.2 Apply responsive layout rules
    - Ensure DataTable → card-list conversion below 768px across all pages
    - Ensure Sidebar hidden by default on <768px, accessible via hamburger
    - Ensure all tap targets ≥ 44×44px on interactive elements
    - Verify layouts render correctly at 320px, 768px, and 1280px
    - _Requirements: 3.8, 23.1, 23.2, 23.3, 23.4_
  - [ ] 19.3 Apply performance optimizations
    - Add `React.memo` to `DataTable` row components
    - Add `useMemo` for derived totals/filtered lists in dashboard pages
    - Add `useCallback` for event handlers passed to child components
    - Add `react-window` `FixedSizeList` for tables exceeding 100 rows
    - Add `loading="lazy"` + explicit width/height to tenant logo/banner images
    - _Requirements: 26.1, 26.2, 26.5_

- [ ] 20. Write property-based tests (fast-check)
  - [ ] 20.1 Property 1 — JWT interceptor always attaches token
    - Write `src/tests/properties/jwtInterceptor.property.test.ts`
    - Use `fc.string({ minLength: 10 })` to generate arbitrary token strings; assert `config.headers.Authorization === 'Bearer ' + token` for every generated value
    - Tag comment: `// Feature: multi-tenant-saas-frontend, Property 1: JWT interceptor always attaches token`
    - Run minimum 100 iterations
    - **Property 1: JWT Interceptor Always Attaches Token**
    - **Validates: Requirements 1.4**
  - [ ] 20.2 Property 2 — Route guard redirects for any unauthorized access
    - Write `src/tests/properties/routeGuard.property.test.ts`
    - Use `fc.constantFrom(...ALL_PROTECTED_ROUTES)` to generate routes; assert unauthenticated users redirect to `/login`; assert role-mismatch redirects to own dashboard; assert no protected content renders
    - **Property 2: Route Guard Redirects for Any Unauthorized Access**
    - **Validates: Requirements 4.2, 4.3**
  - [ ] 20.3 Property 3 — JWT role claim maps to correct dashboard redirect
    - Write `src/tests/properties/roleRedirect.property.test.ts`
    - Use `fc.constantFrom('SUPER_ADMIN', 'ADMIN', 'USER')`; assert `roleRedirect(role) === ROLE_DASHBOARD_MAP[role]`; assert result is never another role's path
    - **Property 3: JWT Role Claim Maps to Correct Dashboard Redirect**
    - **Validates: Requirements 3.2**
  - [ ] 20.4 Property 4 — Auth form validation rejects all invalid inputs
    - Write `src/tests/properties/authValidation.property.test.ts`
    - Test 1: `fc.string().filter(s => !EMAIL_REGEX.test(s))` — assert `validateEmail` returns non-null
    - Test 2: `fc.string({ maxLength: 7 })` — assert `validatePassword` returns non-null
    - Test 3: `fc.string().filter(s => s.trim() === '')` — assert `validateRequired` returns non-null
    - Run 200 iterations for email test, 100 for others
    - **Property 4: Auth Form Validation Rejects All Invalid Inputs**
    - **Validates: Requirements 3.10, 25.4**
  - [ ] 20.5 Property 5 — Email field preserved on login failure
    - Write `src/tests/properties/loginErrorState.property.test.ts`
    - Use `fc.emailAddress()` + `fc.string({ minLength: 1 })` for error message; render `LoginPage`, simulate login failure, assert email input value unchanged
    - **Property 5: Email Field Preserved on Login Failure**
    - **Validates: Requirements 3.3**
  - [ ] 20.6 Property 6 — Branding engine applies tenant color accurately
    - Write `src/tests/properties/brandingEngine.property.test.ts`
    - Use `fc.hexaString({ minLength: 6, maxLength: 6 }).map(h => '#' + h)`; assert `buildTenantTheme(baseTheme, hexColor).palette.primary.main === hexColor`; assert contrast ratio ≥ 4.5:1 for `contrastText` vs `main`
    - **Property 6: Branding Engine Applies Tenant Color Accurately**
    - **Validates: Requirements 17.2**
  - [ ] 20.7 Property 7 — Search debounce fires exactly once after inactivity
    - Write `src/tests/properties/debounce.property.test.ts`
    - Use `fc.array(fc.nat({ max: 290 }), { minLength: 1, maxLength: 20 })` for keystroke intervals; assert callback not called while all intervals < 300ms; assert called exactly once after `vi.advanceTimersByTime(300)`
    - **Property 7: Search Debounce Fires Exactly Once After Inactivity**
    - **Validates: Requirements 20.2, 5.4**
  - [ ] 20.8 Property 8 — Subdomain validation accepts only valid identifiers
    - Write `src/tests/properties/subdomainValidation.property.test.ts`
    - Test 1: `fc.stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)` — assert `validateSubdomain` returns null
    - Test 2: `fc.string().filter(s => /[A-Z\s_!@#$%^&*]/.test(s))` — assert `validateSubdomain` returns non-null
    - **Property 8: Subdomain Validation Accepts Only Valid Identifiers**
    - **Validates: Requirements 25.4**

- [ ] 21. Write unit and integration tests
  - [ ]* 21.1 Write unit tests for auth module
    - Test: 401 response clears token and redirects to `/login`
    - Test: Successful login dispatches correct Redux state shape
    - Test: Branding fallback to default theme on fetch failure
    - _Requirements: 1.5, 3.2, 17.6_
  - [ ]* 21.2 Write unit tests for UI components and data layer
    - Test: `StatusBadge` renders correct color chip for each status value
    - Test: `KpiCard` counter animates from 0 to target value
    - Test: Create/edit/delete mutations correctly invalidate React Query cache
    - Test: Notification bell badge increments on new notification
    - Test: Search empty state renders correct message with query text
    - Test: 404 page renders for unknown path; 403 page renders for role mismatch
    - _Requirements: 4.5, 4.6, 7.5, 8.7, 19.1, 20.5_
  - [ ]* 21.3 Write integration tests
    - Test: Axios instance sends request to mock server with correct Bearer token header
    - Test: Platform health polling correctly shows red banner when status is not `UP`
    - _Requirements: 1.4, 6.6, 6.7_

- [ ] 22. Final checkpoint — Production build verification
  - Run `vite build` and confirm zero TypeScript compiler errors
  - Run ESLint and confirm zero errors
  - Run all tests with coverage; confirm ≥ 80% line coverage
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 26.4, 26.6_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Every task references specific requirement acceptance-criteria clauses for traceability
- Tasks 1–10 (scaffolding through checkpoint) must be completed before any feature page tasks
- Property tests (task 20) validate universal correctness properties using fast-check with minimum 100 iterations each
- Unit tests (task 21) validate specific examples, edge cases, and integration points
- Mock data with "Demo Data" badge covers ADMIN sub-pages (Products, Orders, Reports, Inventory, Marketing) until backend endpoints are available
- `react-window` virtualization applies to tables with > 100 rows to maintain Lighthouse performance score ≥ 85
- All 8 correctness properties from design.md are covered: tasks 20.1–20.8

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.2", "4.1"] },
    { "id": 3, "tasks": ["3.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["7.1", "7.2", "9.1"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3", "9.2", "12.1"] },
    { "id": 7, "tasks": ["9.3"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 9, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5", "13.6", "13.7"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3", "15.1"] },
    { "id": 11, "tasks": ["15.2", "16.1", "16.2"] },
    { "id": 12, "tasks": ["17.1", "17.2", "17.3", "17.4"] },
    { "id": 13, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 14, "tasks": ["20.1", "20.2", "20.3", "20.4", "20.5", "20.6", "20.7", "20.8"] },
    { "id": 15, "tasks": ["21.1", "21.2", "21.3"] }
  ]
}
```
