import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';
import ProfileMenu from './ProfileMenu';
import NotificationCenter from '@/components/widgets/NotificationCenter';
import SmartSearch from '@/components/widgets/SmartSearch';

interface TopbarProps {
  onSidebarToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSidebarToggle }) => {
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  // ── Smart search modal state ─────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          height: 64,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', height: 64, px: { xs: 1.5, sm: 2 }, gap: 1 }}>
          {/* Sidebar toggle */}
          <IconButton
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
            edge="start"
            size="medium"
            sx={{ color: 'text.secondary', mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          {/* Right-side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Search — opens SmartSearch modal */}
            <SearchBar onSearchOpen={() => setSearchOpen(true)} />

            {/* Notification bell — uses its own built-in popover via NotificationCenter */}
            <NotificationCenter />

            <ThemeSwitcher />

            {isLoading ? (
              <Skeleton variant="circular" width={32} height={32} sx={{ mx: 0.5 }} />
            ) : (
              <ProfileMenu />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Smart Search modal */}
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Topbar;
