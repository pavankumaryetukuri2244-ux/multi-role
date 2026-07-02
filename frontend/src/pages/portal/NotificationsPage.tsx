import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, IconButton, Chip, Stack } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatRelativeTime } from '@/utils/formatters';

interface Notif { id: number; message: string; read: boolean; createdAt: string; }
const INITIAL: Notif[] = [
  { id: 1, message: 'Your order ORD-101 has been delivered', read: false, createdAt: new Date(Date.now()-3600000).toISOString() },
  { id: 2, message: 'New reward points added to your account', read: false, createdAt: new Date(Date.now()-7200000).toISOString() },
  { id: 3, message: 'Flash sale! 20% off electronics today only', read: true, createdAt: new Date(Date.now()-86400000).toISOString() },
  { id: 4, message: 'Your profile was updated successfully', read: true, createdAt: new Date(Date.now()-172800000).toISOString() },
];

export default function PortalNotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h4" fontWeight={700}>Notifications</Typography>
        {unreadCount > 0 && <Chip label={`${unreadCount} unread`} color="primary" size="small" />}
      </Stack>
      <List>
        {notifs.map(n => (
          <ListItem key={n.id} divider sx={{ bgcolor: n.read ? 'transparent' : 'action.hover', borderRadius: 1, mb: 0.5 }}>
            <ListItemIcon><NotificationsIcon color={n.read ? 'disabled' : 'primary'} /></ListItemIcon>
            <ListItemText primary={n.message} secondary={formatRelativeTime(n.createdAt)} />
            {!n.read && <IconButton size="small" onClick={() => markRead(n.id)} title="Mark as read"><CheckCircleIcon color="success" /></IconButton>}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
