import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LockIcon from '@mui/icons-material/Lock';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import { logoutAction } from '@/store/slices/authSlice';

/**
 * ProfileMenu — Avatar button that opens a user actions menu.
 *
 * Shows user initials derived from firstName + lastName stored in auth state.
 * Logout clears auth state and navigates to /login.
 */
const ProfileMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { firstName, lastName, isLoading, role } = useSelector(
    (state: RootState) => state.auth
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const initials = React.useMemo(() => {
    const f = (firstName ?? '').charAt(0).toUpperCase();
    const l = (lastName ?? '').charAt(0).toUpperCase();
    return f || l ? `${f}${l}` : '?';
  }, [firstName, lastName]);

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logoutAction());
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    handleClose();
    if (role === 'SUPER_ADMIN') navigate('/super-admin/profile');
    else if (role === 'ADMIN') navigate('/admin/profile');
    else navigate('/portal/profile');
  };

  const handleSettings = () => {
    handleClose();
    if (role === 'SUPER_ADMIN') navigate('/super-admin/settings');
    else if (role === 'ADMIN') navigate('/admin/settings');
    else navigate('/portal/settings');
  };

  if (isLoading) {
    return (
      <Skeleton variant="circular" width={36} height={36} sx={{ mx: 0.5 }} />
    );
  }

  return (
    <>
      <Tooltip title="Account settings" arrow>
        <IconButton
          onClick={handleOpen}
          size="small"
          aria-label="Account settings"
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{ p: 0.5 }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.8rem',
              fontWeight: 600,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: '0 0 0 3px rgba(99,102,241,0.3)',
              },
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 16,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >

        <MenuItem onClick={handleProfile} sx={{ gap: 1, py: 1 }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>

        <MenuItem onClick={handleSettings} sx={{ gap: 1, py: 1 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <MenuItem onClick={handleProfile} sx={{ gap: 1, py: 1 }}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          Reset Password
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{ gap: 1, py: 1, color: 'error.main' }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
