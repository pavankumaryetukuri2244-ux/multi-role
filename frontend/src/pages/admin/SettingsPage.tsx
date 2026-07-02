import { Box, Typography, Card, CardContent, Divider, Switch, FormControlLabel, TextField, Button, Stack } from '@mui/material';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Settings</Typography>
      <Stack spacing={3}>
        <Card><CardContent>
          <Typography variant="h6" mb={2}>Account Security</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2} maxWidth={400}>
            <TextField label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} size="small" />
            <TextField label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} size="small" />
            <Button variant="contained" size="small" sx={{ alignSelf: 'flex-start' }}>Update Password</Button>
          </Stack>
        </CardContent></Card>
        <Card><CardContent>
          <Typography variant="h6" mb={2}>Notification Preferences</Typography>
          <Divider sx={{ mb: 2 }} />
          <FormControlLabel control={<Switch checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} />} label="Email notifications" />
          <FormControlLabel control={<Switch checked={notifPush} onChange={e => setNotifPush(e.target.checked)} />} label="Push notifications" />
        </CardContent></Card>
        <Card><CardContent>
          <Typography variant="h6" mb={2}>Appearance</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">Theme is controlled from the top navigation bar.</Typography>
        </CardContent></Card>
      </Stack>
    </Box>
  );
}
