import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import { ROUTES } from '@/constants/routes';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';
import ProfileMenu from './ProfileMenu';
import NotificationCenter from '@/components/widgets/NotificationCenter';
import SmartSearch from '@/components/widgets/SmartSearch';

interface TopbarProps {
  onSidebarToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSidebarToggle }) => {
  const { isLoading, role } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

<<<<<<< HEAD
=======
  // ── Smart search modal state ─────────────────────────────────────────────
>>>>>>> sandeep-feature
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#131921',
          color: '#FFFFFF',
          borderBottom: 'none',
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
            sx={{ color: '#FFFFFF', mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          {/* Right-side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Create Admin button — only visible to SUPER_ADMIN */}
            {role === 'SUPER_ADMIN' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate(`${ROUTES.SUPER_ADMIN.ADMINS}?create=true`)}
                sx={{
                  borderRadius: 1,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  px: 2,
                  bgcolor: '#FFD814',
                  color: '#0F1111',
                  '&:hover': { bgcolor: '#F7CA00' },
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(15,17,17,0.15)',
                }}
              >
                Create Admin
              </Button>
            )}

            {/* Search — opens SmartSearch modal */}
            <SearchBar onSearchOpen={() => setSearchOpen(true)} />

            {/* Notification center */}
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
