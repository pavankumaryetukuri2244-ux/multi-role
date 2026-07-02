import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NotificationBellProps {
  /** Called when the bell is clicked — opens the NotificationCenter panel */
  onOpen: () => void;
}

// ─── Pulse keyframe (injected once via sx globalStyles workaround) ─────────────

const pulseAnimation = {
  '@keyframes bellPulse': {
    '0%':   { transform: 'scale(1)', opacity: 1 },
    '50%':  { transform: 'scale(1.35)', opacity: 0.7 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
};

/**
 * NotificationBell — shows unread notification count badge.
 *
 * - Badge is hidden when count is 0
 * - When unread count > 0, the badge pulses via a CSS keyframe animation
 * - Clicking fires the `onOpen` prop to open the NotificationCenter panel
 *
 * Requirements: 5.6, 19.1
 */
const NotificationBell: React.FC<NotificationBellProps> = ({ onOpen }) => {
  const unreadCount = useSelector(
    (state: RootState) => state.ui.unreadNotificationCount
  );

  const hasBadge = unreadCount > 0;

  return (
    <Tooltip title="Notifications" arrow>
      <IconButton
        onClick={onOpen}
        aria-label={
          hasBadge
            ? `Notifications — ${unreadCount} unread`
            : 'Notifications'
        }
        size="medium"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'action.hover',
          },
          transition: 'color 0.2s, background-color 0.2s',
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          invisible={!hasBadge}
          max={99}
          sx={
            hasBadge
              ? {
                  ...pulseAnimation,
                  '& .MuiBadge-badge': {
                    animation: 'bellPulse 1.8s ease-in-out infinite',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                  },
                }
              : undefined
          }
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
