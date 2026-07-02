import { Box, Typography, List, ListItem, ListItemText, Popover, Badge, IconButton, Divider, Button, Stack } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { markNotificationRead } from '@/store/slices/uiSlice';
import { formatRelativeTime } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadNotificationCount } = useSelector((state: RootState) => state.ui);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotifClick = (id: number, link: string | null) => {
    dispatch(markNotificationRead(id));
    if (link) { navigate(link); handleClose(); }
  };

  const recent = notifications.slice(0, 20);

  return (
    <>
      <IconButton onClick={handleClick} size="medium">
        <Badge badgeContent={unreadNotificationCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          {unreadNotificationCount > 0 && <Typography variant="caption" color="primary">{unreadNotificationCount} unread</Typography>}
        </Stack>
        <Divider />
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {recent.length === 0
            ? <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">No notifications</Typography></Box>
            : <List dense>
                {recent.map(n => (
                  <ListItem key={n.id} button onClick={() => handleNotifClick(n.id, n.link)}
                    sx={{ bgcolor: n.read ? 'transparent' : 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
                    <ListItemText primary={n.message} secondary={formatRelativeTime(n.createdAt)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: n.read ? 400 : 600 }} />
                  </ListItem>
                ))}
              </List>}
        </Box>
      </Popover>
    </>
  );
}
