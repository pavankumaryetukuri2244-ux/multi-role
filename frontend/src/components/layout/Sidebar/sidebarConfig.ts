import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import DomainIcon from '@mui/icons-material/Domain';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ListAltIcon from '@mui/icons-material/ListAlt';
import type { UserRole } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

// ─── NavItem ──────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Role-aware sidebar navigation configuration.
 * Maps each UserRole to its ordered list of nav items with MUI icon elements.
 *
 * Requirements: 5.1, 5.2
 */
export const SIDEBAR_NAV_CONFIG: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard',      path: ROUTES.SUPER_ADMIN.DASHBOARD,          icon: React.createElement(DashboardIcon) },
    { label: 'Admin Details',  path: ROUTES.SUPER_ADMIN.ADMINS,             icon: React.createElement(PeopleIcon)    },
    { label: 'Categories',     path: ROUTES.SUPER_ADMIN.CATEGORIES,         icon: React.createElement(CategoryIcon)  },
    { label: 'Tenants',        path: ROUTES.SUPER_ADMIN.TENANTS,            icon: React.createElement(DomainIcon)    },
    { label: 'Subscriptions',  path: ROUTES.SUPER_ADMIN.SUBSCRIPTION_PLANS, icon: React.createElement(SubscriptionsIcon) },
    { label: 'Analytics',      path: ROUTES.SUPER_ADMIN.ANALYTICS,          icon: React.createElement(AssessmentIcon) },
    { label: 'Audit Logs',     path: ROUTES.SUPER_ADMIN.AUDIT_LOGS,         icon: React.createElement(ListAltIcon)   },
    { label: 'Settings',       path: ROUTES.SUPER_ADMIN.SETTINGS,           icon: React.createElement(SettingsIcon)  },
  ],

  ADMIN: [
    { label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD,  icon: React.createElement(DashboardIcon)     },
    { label: 'Users',     path: ROUTES.ADMIN.USERS,      icon: React.createElement(PeopleIcon)        },
    { label: 'Products',  path: ROUTES.ADMIN.PRODUCTS,   icon: React.createElement(InventoryIcon)     },
    { label: 'Orders',    path: ROUTES.ADMIN.ORDERS,     icon: React.createElement(LocalShippingIcon) },
    { label: 'Reports',   path: ROUTES.ADMIN.REPORTS,    icon: React.createElement(AssessmentIcon)    },
    { label: 'Inventory', path: ROUTES.ADMIN.INVENTORY,  icon: React.createElement(InventoryIcon)     },
    { label: 'Marketing', path: ROUTES.ADMIN.MARKETING,  icon: React.createElement(CampaignIcon)      },
    { label: 'Settings',  path: ROUTES.ADMIN.SETTINGS,   icon: React.createElement(SettingsIcon)      },
  ],

  USER: [
    { label: 'Home',          path: ROUTES.PORTAL.HOME,          icon: React.createElement(HomeIcon)                   },
    { label: 'Profile',       path: ROUTES.PORTAL.PROFILE,       icon: React.createElement(PersonIcon)                 },
    { label: 'Orders',        path: ROUTES.PORTAL.ORDERS,        icon: React.createElement(ShoppingCartIcon)           },
    { label: 'Wishlist',      path: ROUTES.PORTAL.WISHLIST,      icon: React.createElement(FavoriteIcon)               },
    { label: 'Notifications', path: ROUTES.PORTAL.NOTIFICATIONS, icon: React.createElement(NotificationsIcon)          },
    { label: 'Rewards',       path: ROUTES.PORTAL.REWARDS,       icon: React.createElement(StarIcon)                   },
    { label: 'Wallet',        path: ROUTES.PORTAL.WALLET,        icon: React.createElement(AccountBalanceWalletIcon)   },
    { label: 'Settings',      path: ROUTES.PORTAL.SETTINGS,      icon: React.createElement(SettingsIcon)               },
  ],
};
