import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  IconButton,
  List,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { UserRole } from '@/constants/roles';
import { SIDEBAR_NAV_CONFIG } from './sidebarConfig';
import SidebarNavItem from './SidebarNavItem';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const MOBILE_BREAKPOINT = 768; // px

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
  /** When true, renders loading skeletons instead of nav items (auth loading state). */
  isLoading?: boolean;
}

// ─── Skeleton helpers ──────────────────────────────────────────────────────────

const LogoSkeleton: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: collapsed ? 1.5 : 2,
      py: 2,
      minHeight: 64,
    }}
  >
    <Skeleton variant="circular" width={36} height={36} />
    {!collapsed && <Skeleton variant="text" width={100} height={24} />}
  </Box>
);

const NavItemSkeleton: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      mx: 1,
      mb: 0.5,
      px: collapsed ? 1.5 : 2,
      py: 1,
      borderRadius: 2,
      minHeight: 44,
    }}
  >
    <Skeleton variant="circular" width={24} height={24} />
    {!collapsed && <Skeleton variant="text" width={120} height={20} />}
  </Box>
);

// ─── Sidebar content ───────────────────────────────────────────────────────────

interface SidebarContentProps {
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
  isLoading: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  role,
  collapsed,
  onToggle,
  isLoading,
}) => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const navItems = SIDEBAR_NAV_CONFIG[role];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      {/* ── Logo area ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <LogoSkeleton collapsed={collapsed} />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: collapsed ? 1.5 : 2,
            minHeight: 64,
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.span
                key="abbr"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary"
                  sx={{ letterSpacing: 1 }}
                >
                  SP
                </Typography>
              </motion.span>
            ) : (
              <motion.span
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary"
                  noWrap
                >
                  SaaS Platform
                </Typography>
              </motion.span>
            )}
          </AnimatePresence>

          {/* Collapse toggle — only shown when sidebar is expanded on desktop */}
          {!collapsed && (
            <Tooltip title="Collapse sidebar" placement="right">
              <IconButton onClick={onToggle} size="small">
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* ── Collapse expand button when collapsed ─────────────────────── */}
      {collapsed && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton onClick={onToggle} size="small">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* ── Nav items ─────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pt: 1 }}>
        {isLoading ? (
          <>
            <NavItemSkeleton collapsed={collapsed} />
            <NavItemSkeleton collapsed={collapsed} />
            <NavItemSkeleton collapsed={collapsed} />
          </>
        ) : (
          <List disablePadding>
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.path + item.label}
                item={item}
                collapsed={collapsed}
                active={pathname.startsWith(item.path)}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────

/**
 * Sidebar — role-aware animated sidebar navigation component.
 *
 * - Desktop (≥ 768px): fixed animated panel using Framer Motion width animation.
 * - Mobile (< 768px): MUI Drawer (temporary). Opens when `!collapsed`.
 * - Loading state: shows logo + 3 nav item skeletons when `isLoading` is true.
 *
 * Requirements: 5.1, 5.2, 5.7, 5.8, 23.2
 */
const Sidebar: React.FC<SidebarProps> = ({ role, collapsed, onToggle, isLoading = false }) => {
  const isMobile = useMediaQuery(`(max-width:${MOBILE_BREAKPOINT - 1}px)`);

  if (isMobile) {
    // On mobile: render as a temporary Drawer. Open when sidebar is NOT collapsed.
    return (
      <Drawer
        variant="temporary"
        open={!collapsed}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_EXPANDED_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        <SidebarContent
          role={role}
          collapsed={false}
          onToggle={onToggle}
          isLoading={isLoading}
        />
      </Drawer>
    );
  }

  // Desktop: animated fixed sidebar
  return (
    <motion.div
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        zIndex: 1200,
      }}
    >
      <SidebarContent
        role={role}
        collapsed={collapsed}
        onToggle={onToggle}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default Sidebar;
