# Requirements Document

## Introduction

This document defines the requirements for a complete, modern, enterprise-grade frontend application for a Multi-Tenant SaaS Platform. The platform supports three distinct roles — SUPER_ADMIN, ADMIN, and USER — each with a dedicated, fully-featured portal. The frontend integrates with an existing Spring Boot 3 backend (running at `http://localhost:8080/api/v1`) via REST APIs secured with JWT.

The UI targets a world-class SaaS experience inspired by Stripe, Notion, Shopify, HubSpot, Linear, and Vercel: premium, elegant, fast, minimal, and interactive — built with React 19, TypeScript, Vite, Material UI, React Router v7, Redux Toolkit, React Query, Axios, Framer Motion, and Recharts.

## Glossary

- **Platform**: The entire Multi-Tenant SaaS application.
- **Frontend**: The React 19 + TypeScript single-page application described in this document.
- **SUPER_ADMIN**: The highest-privilege system administrator who manages the entire Platform.
- **ADMIN**: A business owner or tenant administrator who manages a single Tenant.
- **USER**: An end-user who accesses the Tenant Portal assigned to their Tenant.
- **Tenant**: An isolated business instance on the Platform, accessible via a subdomain (e.g., `restaurant.platform.com`) or custom domain.
- **Tenant_Portal**: The USER-facing interface rendered dynamically with the Tenant's branding.
- **Branding_Engine**: The subsystem that applies per-Tenant logo, theme color, and banner to the UI.
- **Auth_Module**: The set of pages handling login, registration, password reset, OTP, and session management.
- **JWT**: JSON Web Token issued by the backend upon successful login, stored in the Frontend and sent as a Bearer token on every protected API request.
- **Theme**: The visual appearance of the UI, toggleable between light and dark modes.
- **Router**: React Router v7, responsible for client-side navigation and role-based route guards.
- **API_Client**: The Axios instance pre-configured with base URL and JWT interceptor.
- **Store**: The Redux Toolkit global state store.
- **Query_Client**: The React Query client managing server state, caching, and background refetch.
- **Sidebar**: The collapsible vertical navigation panel rendered inside authenticated layouts.
- **Topbar**: The horizontal header bar containing search, notifications, theme switcher, and user profile menu.
- **Skeleton**: A loading placeholder component shown while data is being fetched.
- **Toast**: A brief, non-blocking success or error notification rendered in the corner of the screen.
- **Empty_State**: A descriptive placeholder shown when a list or dataset contains no items.
- **Breadcrumb**: A horizontal trail of links showing the user's current location in the navigation hierarchy.
- **AI_Assistant**: An in-app floating widget providing contextual suggestions and insights.
- **Health_Score**: A computed numeric score (0–100) representing Tenant operational health.

## Requirements

---

### Requirement 1: Project Scaffolding and Technology Stack

**User Story:** As a developer, I want the frontend project scaffolded with the approved technology stack, so that the team can build features on a consistent, production-ready foundation.

#### Acceptance Criteria

1. THE Frontend SHALL be bootstrapped with Vite, React 19, and TypeScript with strict mode enabled.
2. THE Frontend SHALL include Material UI (MUI v6+), React Router v7, Redux Toolkit, React Query, Axios, Framer Motion, and Recharts as direct dependencies with pinned versions.
3. THE Frontend SHALL use the directory structure: `src/app`, `src/pages`, `src/routes`, `src/layouts`, `src/components`, `src/features`, `src/services`, `src/hooks`, `src/store`, `src/theme`, `src/assets`, `src/utils`, and `src/constants`.
4. THE Frontend SHALL configure an `API_Client` Axios instance with base URL `http://localhost:8080/api/v1` and a request interceptor that attaches the stored JWT as a Bearer token to every outgoing request.
5. WHEN the backend returns HTTP 401, THE API_Client SHALL clear the stored JWT, update the authentication state in the Store, and redirect the user to the login page.
6. THE Frontend SHALL configure a `Query_Client` with a default stale time of 30 seconds and retry count of 1 for all queries.
7. THE Frontend SHALL configure absolute TypeScript path aliases (`@/app`, `@/pages`, `@/components`, `@/features`, `@/services`, `@/hooks`, `@/store`, `@/theme`, `@/utils`, `@/constants`) in both `tsconfig.json` and `vite.config.ts`.

---

### Requirement 2: Global Theme System

**User Story:** As a user, I want to switch between light and dark themes, so that I can use the application comfortably in different lighting environments.

#### Acceptance Criteria

1. THE Theme SHALL provide both a light variant and a dark variant, each with a complete MUI palette including primary, secondary, error, warning, info, success, background, and text tokens.
2. THE Theme SHALL use the Inter font family as the primary typeface, loaded via `@fontsource/inter`.
3. WHEN the user activates the Theme_Switcher, THE Theme SHALL toggle between light and dark modes and persist the user's preference in `localStorage` under the key `theme-mode`.
4. WHEN the Frontend first loads, THE Theme SHALL read the persisted preference from `localStorage` and apply it before the first render, preventing a flash of the wrong theme.
5. THE Theme SHALL expose gradient backgrounds, glassmorphism surface tokens, and custom shadow levels as MUI theme extension properties.
6. THE Frontend SHALL apply the active Theme globally via MUI's `ThemeProvider` wrapping the entire application.

---

### Requirement 3: Authentication Module

**User Story:** As any platform user (SUPER_ADMIN, ADMIN, or USER), I want a secure, visually premium authentication flow, so that I can access my role-specific portal safely.

#### Acceptance Criteria

1. THE Auth_Module SHALL render a split-screen Login Page with an animated illustration panel on the left and a login form on the right.
2. WHEN the user submits valid credentials to the Login Page, THE Auth_Module SHALL call `POST /api/v1/auth/login`, store the returned JWT in `localStorage`, decode the role claim, update the Store, and redirect to the appropriate role-based dashboard.
3. IF the backend returns an error on login, THEN THE Auth_Module SHALL display the error message inline on the form without clearing the email field.
4. THE Auth_Module SHALL render a Forgot Password page where users enter their email address.
5. THE Auth_Module SHALL render a Reset Password page that accepts a token via URL query parameter and a new password form.
6. THE Auth_Module SHALL render an OTP Verification page with a 6-digit code input.
7. WHEN an authenticated session expires or the JWT is invalidated, THE Auth_Module SHALL render a Session Expired page with a button to return to the Login Page.
8. THE Auth_Module SHALL render all pages fully responsive at 320px, 768px, and 1280px viewport widths.
9. WHEN the user is already authenticated, THE Router SHALL redirect login-page visits to the appropriate role dashboard.
10. THE Auth_Module SHALL implement all form inputs with client-side validation: email format, password minimum 8 characters, and required field checks, before submitting to the backend.

---

### Requirement 4: Role-Based Routing and Access Control

**User Story:** As a platform architect, I want every route protected by the user's role, so that SUPER_ADMINs, ADMINs, and USERs can only access their authorized sections.

#### Acceptance Criteria

1. THE Router SHALL define three separate layout trees: one for SUPER_ADMIN routes, one for ADMIN routes, and one for USER routes, each under a distinct path prefix (`/super-admin`, `/admin`, `/portal`).
2. WHEN an unauthenticated user navigates to any protected route, THE Router SHALL redirect to `/login`.
3. WHEN an authenticated user navigates to a route outside their role's layout tree, THE Router SHALL redirect to their role's default dashboard.
4. THE Router SHALL implement lazy loading via `React.lazy` and `Suspense` for every page-level component, showing a fullscreen Skeleton during the load.
5. THE Router SHALL display a 404 Not Found error page for any path that matches no defined route.
6. THE Router SHALL display a dedicated 403 Forbidden error page when a role-mismatch redirect is not possible.

---

### Requirement 5: Global Shared Layout Components

**User Story:** As any authenticated user, I want consistent navigation, header, and notification components, so that the interface feels cohesive and professional across all sections.

#### Acceptance Criteria

1. THE Sidebar SHALL render role-specific navigation items with icons, labels, and active-state highlights, and SHALL collapse to an icon-only rail on screens narrower than 768px.
2. WHEN the user clicks the collapse toggle, THE Sidebar SHALL animate its width change using Framer Motion with a duration of 250ms.
3. THE Topbar SHALL contain a global search bar, a notification bell icon, a Theme_Switcher toggle, and a user profile avatar menu.
4. WHEN the user activates the search bar, THE Topbar SHALL expand it with a fade-in animation and display results from a debounced query after 300ms of inactivity.
5. THE Breadcrumb component SHALL render the current navigation path derived from the active route and update automatically on navigation.
6. WHEN a new notification arrives, THE Topbar SHALL animate the notification bell with a pulse effect and increment the unread badge count.
7. THE Frontend SHALL render role-specific Sidebar menu items: SUPER_ADMIN sees Dashboard, Categories, Admin Management, Tenant Management, Subscription Plans, Analytics, Domain Management, Platform Settings, and Audit Logs; ADMIN sees Dashboard, Users, Products, Orders, Reports, Inventory, Marketing, and Settings; USER sees Home, Profile, Orders, Wishlist, Notifications, Rewards, Wallet, and Settings.
8. THE Frontend SHALL display loading Skeletons in the Sidebar and Topbar during initial authentication state hydration.

---

### Requirement 6: SUPER_ADMIN Dashboard

**User Story:** As a SUPER_ADMIN, I want a real-time platform overview dashboard, so that I can monitor the health, growth, and financial performance of the entire platform at a glance.

#### Acceptance Criteria

1. THE Frontend SHALL render a SUPER_ADMIN Dashboard page at `/super-admin/dashboard` displaying six animated KPI cards: Total Tenants, Total Admins, Total Users, Monthly Revenue, Active Subscriptions, and New Registrations this month.
2. WHEN the SUPER_ADMIN Dashboard loads, THE Frontend SHALL call `GET /api/v1/super-admin/analytics` and populate all KPI cards and charts with the returned data.
3. THE Frontend SHALL render a Revenue Analytics line chart, a Tenant Growth bar chart, a Category Distribution pie chart, and a User Growth area chart using Recharts.
4. WHEN data is loading, THE Frontend SHALL display Skeleton placeholders for each KPI card and chart with dimensions matching the real content.
5. THE Frontend SHALL render an Activity Feed section showing the 10 most recent platform events (admin created, tenant approved, plan changed) with timestamps.
6. THE Frontend SHALL render a Platform Status Monitor section displaying backend health status polled every 30 seconds from `GET /actuator/health`.
7. WHEN the Platform Status Monitor detects an unhealthy status, THE Frontend SHALL display a red alert banner at the top of the SUPER_ADMIN Dashboard.
8. THE Frontend SHALL animate KPI card counter values from zero to their final value over 1000ms using Framer Motion on initial mount.

---

### Requirement 7: SUPER_ADMIN Category Management

**User Story:** As a SUPER_ADMIN, I want full CRUD control over tenant categories, so that I can organise tenant businesses into meaningful segments.

#### Acceptance Criteria

1. THE Frontend SHALL render a Categories page at `/super-admin/categories` displaying all categories in a data table with columns: Name, Description, Tenants Count, and Actions.
2. WHEN the user clicks "Create Category," THE Frontend SHALL open a modal form and, on submission, call `POST /api/v1/super-admin/categories`.
3. WHEN the user clicks "Edit" on a category row, THE Frontend SHALL open a pre-filled modal form and, on submission, call `PUT /api/v1/super-admin/categories/{id}`.
4. WHEN the user clicks "Delete" on a category row, THE Frontend SHALL display a confirmation dialog and, on confirmation, call `DELETE /api/v1/super-admin/categories/{id}`.
5. IF a create, update, or delete operation succeeds, THEN THE Frontend SHALL display a success Toast and invalidate the categories Query_Client cache to reload the table.
6. IF a create, update, or delete operation fails, THEN THE Frontend SHALL display an error Toast with the backend error message.
7. WHEN the categories list is empty, THE Frontend SHALL render an Empty_State illustration with a "Create your first category" call-to-action button.


---

### Requirement 8: SUPER_ADMIN Admin Account Management

**User Story:** As a SUPER_ADMIN, I want to create, update, approve, and disable ADMIN accounts, so that I can control who operates each Tenant on the Platform.

#### Acceptance Criteria

1. THE Frontend SHALL render an Admin Management page at `/super-admin/admins` displaying all ADMIN accounts in a data table with columns: Name, Email, Company, Status, Categories, and Actions.
2. WHEN the user clicks "Create Admin," THE Frontend SHALL open a modal form with fields for First Name, Last Name, Email, Password, Company Name, and Subdomain, and on submission call `POST /api/v1/super-admin/admins`.
3. WHEN the user clicks "Edit" on an admin row, THE Frontend SHALL open a pre-filled modal and on submission call `PUT /api/v1/super-admin/admins/{id}`.
4. WHEN the user clicks "Assign Categories" on an admin row, THE Frontend SHALL open a multi-select dropdown of all categories and on submission call `PUT /api/v1/super-admin/admins/{id}/categories`.
5. WHEN the user toggles the active status switch on an admin row, THE Frontend SHALL call `PUT /api/v1/super-admin/admins/{id}/status?active={value}` and update the row optimistically.
6. WHEN a self-registered ADMIN is in pending status, THE Frontend SHALL display an "Approve" action button that calls `PUT /api/v1/super-admin/admins/{id}/approve`.
7. THE Frontend SHALL display a status badge chip with distinct colors: green for active, red for inactive, and yellow for pending.

---

### Requirement 9: SUPER_ADMIN Tenant Management

**User Story:** As a SUPER_ADMIN, I want to view and manage all Tenant configurations including subdomains and custom domains, so that each Tenant is correctly reachable on the platform.

#### Acceptance Criteria

1. THE Frontend SHALL render a Tenant Management page at `/super-admin/tenants` displaying all Tenants in a data table with columns: Company Name, Subdomain URL, Custom Domain, Admin, Status, Plan, and Actions.
2. WHEN the user clicks "Edit Subdomain" on a tenant row, THE Frontend SHALL open an inline edit field and on confirmation call `PUT /api/v1/super-admin/tenants/{id}/subdomain`.
3. WHEN the user clicks "Set Custom Domain" on a tenant row, THE Frontend SHALL open a modal form and on submission call `PUT /api/v1/super-admin/tenants/{id}/custom-domain`.
4. THE Frontend SHALL display a Tenant Health_Score indicator (0–100) as a colored progress bar for each tenant row, where 0–40 is red, 41–70 is amber, and 71–100 is green.
5. WHEN the tenants list is empty, THE Frontend SHALL render an Empty_State with a message explaining that tenants are created when admin accounts are registered.

---

### Requirement 10: SUPER_ADMIN Subscription Plan Management

**User Story:** As a SUPER_ADMIN, I want to manage subscription plans, so that Admins can subscribe Tenants to the appropriate tier of service.

#### Acceptance Criteria

1. THE Frontend SHALL render a Subscription Plans page at `/super-admin/subscription-plans` displaying all plans in styled cards showing Name, Price, Duration, Features, and Active status.
2. WHEN the user clicks "Create Plan," THE Frontend SHALL open a modal form with fields for Name, Price (decimal), Features (multi-line text), Duration Days, and Active toggle, and on submission call `POST /api/v1/super-admin/subscription-plans`.
3. WHEN the user clicks "Edit" on a plan card, THE Frontend SHALL open a pre-filled modal and on submission call `PUT /api/v1/super-admin/subscription-plans/{id}`.
4. WHEN the user clicks "Delete" on a plan card, THE Frontend SHALL display a confirmation dialog and on confirmation call `DELETE /api/v1/super-admin/subscription-plans/{id}`.
5. THE Frontend SHALL visually distinguish active plans from inactive plans using a badge and reduced opacity for inactive cards.

---

### Requirement 11: SUPER_ADMIN Platform Settings

**User Story:** As a SUPER_ADMIN, I want to view and update global platform settings, so that I can control platform-wide behaviour without redeploying the application.

#### Acceptance Criteria

1. THE Frontend SHALL render a Platform Settings page at `/super-admin/settings` displaying all settings as a list of key-value pairs with their descriptions.
2. WHEN the user clicks "Edit" on a setting row, THE Frontend SHALL render the value as an inline editable input field.
3. WHEN the user confirms a setting change, THE Frontend SHALL call `PUT /api/v1/super-admin/settings` with the updated key, value, and description.
4. IF the maintenance mode setting is set to `true`, THEN THE Frontend SHALL display a platform-wide yellow warning banner on the SUPER_ADMIN Dashboard.


---

### Requirement 12: SUPER_ADMIN Analytics

**User Story:** As a SUPER_ADMIN, I want a dedicated analytics page with detailed charts and metrics, so that I can make data-driven decisions about platform growth and revenue.

#### Acceptance Criteria

1. THE Frontend SHALL render an Analytics page at `/super-admin/analytics` populated by data from `GET /api/v1/super-admin/analytics`.
2. THE Frontend SHALL render interactive Recharts charts: a Revenue over Time line chart, a New Tenants per Month bar chart, and a Subscriptions by Plan donut chart, all supporting tooltip hover states.
3. THE Frontend SHALL render a date-range filter control that allows the SUPER_ADMIN to filter analytics data by a custom start and end date.
4. WHEN the Analytics page is loading data, THE Frontend SHALL display Skeleton placeholders matching the chart dimensions.

---

### Requirement 13: ADMIN Dashboard

**User Story:** As an ADMIN, I want a business dashboard showing my tenant's key performance metrics, so that I can monitor sales, orders, revenue, and customer activity in real time.

#### Acceptance Criteria

1. THE Frontend SHALL render an ADMIN Dashboard page at `/admin/dashboard` displaying four animated KPI cards: Sales Today, Orders Today, Revenue (current month), and New Customers.
2. THE Frontend SHALL render a Sales Analytics line chart, a Customer Analytics bar chart, and a Product Performance horizontal bar chart using Recharts.
3. WHEN the ADMIN Dashboard loads, THE Frontend SHALL call `GET /api/v1/admin/tenant` and display the tenant's company name, subdomain URL, and subscription plan in a Tenant Info panel.
4. WHEN data is loading, THE Frontend SHALL display Skeleton placeholders for each KPI card and chart.
5. THE Frontend SHALL render a Business Growth Score widget as an animated circular progress indicator (0–100) using Framer Motion.

---

### Requirement 14: ADMIN User Management

**User Story:** As an ADMIN, I want to create, update, and delete USER accounts within my Tenant, so that I can control who accesses the Tenant Portal.

#### Acceptance Criteria

1. THE Frontend SHALL render a Users page at `/admin/users` displaying all tenant users in a data table with columns: Name, Email, Status, Created Date, and Actions.
2. WHEN the user clicks "Create User," THE Frontend SHALL open a modal form with fields for First Name, Last Name, Email, and Password, and on submission call `POST /api/v1/admin/users`.
3. WHEN the user clicks "Edit" on a user row, THE Frontend SHALL open a pre-filled modal and on submission call `PUT /api/v1/admin/users/{id}`.
4. WHEN the user clicks "Delete" on a user row, THE Frontend SHALL display a confirmation dialog and on confirmation call `DELETE /api/v1/admin/users/{id}`.
5. THE Frontend SHALL display a status badge chip with distinct colors: green for active, red for inactive.
6. WHEN the users list is empty, THE Frontend SHALL render an Empty_State with a "Create your first user" call-to-action.

---

### Requirement 15: ADMIN Products, Orders, Reports, Inventory, and Marketing Pages

**User Story:** As an ADMIN, I want dedicated pages for managing products, orders, reports, inventory, and marketing, so that I can run my business operations from a single interface.

#### Acceptance Criteria

1. THE Frontend SHALL render a Products page at `/admin/products` with a data table and full CRUD modals (data served from mock state until backend endpoints are available).
2. THE Frontend SHALL render an Orders page at `/admin/orders` with a searchable, filterable data table and an order detail drawer.
3. THE Frontend SHALL render a Reports page at `/admin/reports` with exportable summary charts (PDF and CSV export buttons present in UI).
4. THE Frontend SHALL render an Inventory page at `/admin/inventory` with a stock level table and a low-stock alert badge.
5. THE Frontend SHALL render a Marketing page at `/admin/marketing` with campaign cards and a "Create Campaign" modal.
6. WHEN backend endpoints for these pages are not yet available, THE Frontend SHALL render realistic mock data and display a "Demo Data" badge in the page header.


---

### Requirement 16: USER Portal

**User Story:** As a USER, I want a personalised portal home page with relevant widgets and recommendations, so that I can quickly access the services and information most relevant to me.

#### Acceptance Criteria

1. THE Frontend SHALL render a USER Portal Home page at `/portal/home` with a personalised greeting banner, a Recommendations section, and a Recent Activity feed.
2. THE Frontend SHALL render a Profile page at `/portal/profile` where the USER can view and update their personal information.
3. THE Frontend SHALL render an Orders page at `/portal/orders` displaying the user's order history in a searchable list.
4. THE Frontend SHALL render a Wishlist page at `/portal/wishlist` displaying saved items as a card grid.
5. THE Frontend SHALL render a Notifications page at `/portal/notifications` listing all user notifications with read/unread states.
6. THE Frontend SHALL render a Rewards page at `/portal/rewards` showing a Loyalty Points balance, membership tier badge, and a referral code widget.
7. THE Frontend SHALL render a Wallet page at `/portal/wallet` showing available balance, transaction history, and a top-up call-to-action.
8. THE Frontend SHALL render a Settings page at `/portal/settings` with sections for account security, notification preferences, and appearance.

---

### Requirement 17: Multi-Tenant Branding Engine

**User Story:** As a USER, I want the Tenant Portal to display my tenant's custom branding, so that the experience feels tailored to the specific business I am engaging with.

#### Acceptance Criteria

1. WHEN the Tenant_Portal loads, THE Branding_Engine SHALL read the active tenant identifier from the subdomain or a URL path parameter.
2. WHEN tenant branding data is available, THE Branding_Engine SHALL apply the tenant's primary theme color to the MUI palette's primary token, replacing the Platform default color.
3. THE Branding_Engine SHALL display the tenant's logo in the Sidebar header, replacing the Platform logo.
4. THE Branding_Engine SHALL display the tenant's banner image in the Tenant_Portal Home page hero section.
5. WHILE the Branding_Engine is loading tenant configuration, THE Frontend SHALL display a Skeleton in the Sidebar logo area and hero section.
6. IF tenant branding data cannot be loaded, THEN THE Branding_Engine SHALL fall back to the Platform default theme and logo without displaying an error to the USER.

---

### Requirement 18: Global UI Interaction and Animation Standards

**User Story:** As any user, I want smooth, consistent animations and micro-interactions throughout the interface, so that the application feels premium and responsive to my actions.

#### Acceptance Criteria

1. THE Frontend SHALL implement page transition animations using Framer Motion's `AnimatePresence` with a 300ms fade-and-slide effect on every route change.
2. THE Frontend SHALL apply hover effects to all clickable cards: a subtle upward translate of 4px and box-shadow increase over 200ms.
3. THE Frontend SHALL animate all dashboard KPI counter values from zero to their final value over 1000ms using a spring easing on mount.
4. THE Frontend SHALL display fullscreen loading animations using a branded spinner on initial application load before authentication state is confirmed.
5. THE Frontend SHALL implement Framer Motion stagger animations for list items and card grids, with each item entering with a 50ms delay after the previous one.
6. THE Sidebar SHALL animate its expand and collapse transitions using Framer Motion with a 250ms ease-out curve.
7. THE Frontend SHALL use CSS transitions (200ms ease) for all button hover states, focus rings, and input field border color changes.

---

### Requirement 19: Notification Center

**User Story:** As any authenticated user, I want a real-time notification center, so that I am immediately informed of important platform events relevant to my role.

#### Acceptance Criteria

1. THE Frontend SHALL render a notification bell icon in the Topbar displaying an unread count badge when unread notifications exist.
2. WHEN the user clicks the notification bell, THE Frontend SHALL render a dropdown panel listing the 20 most recent notifications with timestamp, message, and read/unread state.
3. WHEN the user clicks a notification item, THE Frontend SHALL mark it as read and navigate to the relevant page if a link is associated.
4. THE Frontend SHALL poll for new notifications every 60 seconds while the user is authenticated and update the unread count accordingly.
5. WHEN a new notification is detected on polling, THE Frontend SHALL animate the notification bell with a brief pulse animation and display a Toast with the notification summary.


---

### Requirement 20: Search System

**User Story:** As any authenticated user, I want a global smart search that surfaces relevant results quickly, so that I can navigate to any entity or page without browsing the full menu.

#### Acceptance Criteria

1. THE Frontend SHALL render a search bar in the Topbar that accepts keyboard shortcut `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS) to open a fullscreen search modal.
2. WHEN the user types in the search field, THE Frontend SHALL debounce input by 300ms before executing a search against locally cached data from the Query_Client.
3. THE Frontend SHALL display search results grouped by category (Pages, Tenants, Admins, Users) with icons and a short description for each result.
4. WHEN the user selects a search result, THE Frontend SHALL navigate to the relevant page and close the search modal.
5. WHEN the search query returns no results, THE Frontend SHALL display an Empty_State with the message "No results found for '{query}'".

---

### Requirement 21: AI Assistant Widget

**User Story:** As any authenticated user, I want an AI Assistant widget, so that I can get contextual help, insights, and suggestions without leaving the current page.

#### Acceptance Criteria

1. THE Frontend SHALL render a floating AI_Assistant button (bottom-right of the screen) visible on all authenticated pages.
2. WHEN the user clicks the AI_Assistant button, THE Frontend SHALL expand a chat-style panel using a slide-up Framer Motion animation.
3. THE Frontend SHALL display contextual AI insights in the AI_Assistant panel based on the current page context (e.g., revenue suggestions on the ADMIN dashboard, tenant health tips on the SUPER_ADMIN dashboard).
4. THE AI_Assistant SHALL display pre-populated suggestion chips relevant to the current role and page context.
5. WHEN the user closes the AI_Assistant panel, THE Frontend SHALL collapse it using a slide-down Framer Motion animation.

---

### Requirement 22: Floating Quick Actions

**User Story:** As an authenticated ADMIN or SUPER_ADMIN, I want a floating quick-actions button, so that I can perform common operations from any page without navigating away.

#### Acceptance Criteria

1. THE Frontend SHALL render a floating action button (FAB) on all authenticated ADMIN and SUPER_ADMIN pages.
2. WHEN the user clicks the FAB, THE Frontend SHALL expand a radial menu of role-specific quick actions using a stagger animation: SUPER_ADMIN sees "Create Admin," "Create Category," "View Analytics"; ADMIN sees "Create User," "New Order," "View Reports."
3. WHEN the user selects a quick action, THE Frontend SHALL navigate to the relevant page or open the relevant modal.

---

### Requirement 23: Responsive Design and Mobile-First Layout

**User Story:** As a user on any device, I want the interface to be fully usable on mobile, tablet, and desktop, so that I am not restricted to a single device type.

#### Acceptance Criteria

1. THE Frontend SHALL implement a mobile-first responsive layout using MUI's breakpoint system with defined behavior at `xs` (0–599px), `sm` (600–899px), `md` (900–1199px), `lg` (1200–1535px), and `xl` (1536px+) breakpoints.
2. WHILE the viewport width is below 768px, THE Sidebar SHALL be hidden by default and accessible via a hamburger menu button in the Topbar.
3. WHILE the viewport width is below 768px, THE Frontend SHALL collapse data tables into card-based list views for readability.
4. THE Frontend SHALL render touch-friendly tap targets with a minimum size of 44×44px on all interactive elements.
5. THE Frontend SHALL pass Google Lighthouse mobile accessibility audit with a score of 90 or above.

---

### Requirement 24: Error Handling and Empty States

**User Story:** As any user, I want informative error pages and empty states, so that I always understand what happened and what I can do next.

#### Acceptance Criteria

1. THE Frontend SHALL render a custom 404 Not Found page with an illustration, a descriptive message, and a "Return to Dashboard" button.
2. THE Frontend SHALL render a custom 403 Forbidden page with an illustration, a descriptive message, and a "Go Back" button.
3. THE Frontend SHALL render a custom 500 Server Error page displayed when a React error boundary catches an unhandled exception.
4. WHEN a React Query data fetch fails, THE Frontend SHALL display an inline error state within the affected component with a "Retry" button that re-triggers the query.
5. WHEN any list page contains zero items, THE Frontend SHALL render a role-appropriate Empty_State with an illustration, a descriptive message, and a primary call-to-action button.

---

### Requirement 25: Admin Self-Registration Flow

**User Story:** As a prospective ADMIN, I want to self-register my business account, so that I can start using the platform without waiting for direct SUPER_ADMIN creation.

#### Acceptance Criteria

1. THE Auth_Module SHALL render an Admin Registration page at `/register` with fields for First Name, Last Name, Email, Password, Company Name, and Subdomain.
2. WHEN the user submits the registration form, THE Auth_Module SHALL call `POST /api/v1/auth/register-admin` and display a success message explaining that the account is pending SUPER_ADMIN approval.
3. IF the backend returns a validation error, THEN THE Auth_Module SHALL display the specific field-level error messages inline on the form.
4. THE Auth_Module SHALL validate the subdomain field client-side to allow only lowercase alphanumeric characters and hyphens before submission.

---

### Requirement 26: Performance and Code Quality Standards

**User Story:** As a developer and end user, I want the frontend to load fast and be maintainable, so that users get a snappy experience and the codebase scales cleanly.

#### Acceptance Criteria

1. THE Frontend SHALL achieve a Lighthouse performance score of 85 or above on desktop for the login page and SUPER_ADMIN Dashboard.
2. THE Frontend SHALL implement route-based code splitting so that no initial JavaScript bundle exceeds 250KB gzipped.
3. THE Frontend SHALL define TypeScript interfaces or types for all API request and response shapes in `src/services/types`.
4. THE Frontend SHALL configure ESLint with the `@typescript-eslint` plugin and Prettier for consistent code formatting, and the project SHALL have zero ESLint errors on a clean build.
5. THE Frontend SHALL memoize expensive derived computations using `useMemo` and prevent unnecessary re-renders of list items using `React.memo` or `useCallback` where profiling indicates benefit.
6. WHEN the application is built for production via `vite build`, THE Frontend SHALL produce no TypeScript compiler errors.
