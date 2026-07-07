import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { Sidebar, Topbar } from '@/components/layout';

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Page transition variants ─────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── SuperAdminLayout ─────────────────────────────────────────────────────────
//
// Renders the shell for all SUPER_ADMIN routes:
//   Sidebar (role="SUPER_ADMIN")  +  Box (main) → Topbar + <Outlet />
//
// Requirements: 4.1, 18.1

const SuperAdminLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sidebarCollapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const location = useLocation();

  const handleToggle = () => {
    dispatch(toggleSidebar());
  };

  // const sidebarWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        role="SUPER_ADMIN"
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <Topbar onSidebarToggle={handleToggle} />

        {/* Animated page outlet */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, p: 3, mt: '64px' }}>
              <Outlet />
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;
