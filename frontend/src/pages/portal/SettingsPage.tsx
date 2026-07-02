import { Box, Typography, Card, CardContent, Stack, Switch, FormControlLabel, TextField, Button, Divider } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function PortalSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const themeMode = useSelector((state: RootState) => state.ui.themeMode);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Settings</Typography>
      <Stack spacing={3} maxWidth={600}>
        <Card><CardContent>
          <Typography variant="h6" mb={2}>Account Security</Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField fullWidth label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} size="small" sx={{ mb: 2 }} />
          <TextField fullWidth label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} size="small" sx={{ mb: 2 }} />
          <Button variant="contained" size="small">Update Password</Button>
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="h6" mb={2}>Notification Preferences</Typography>
          <Divider sx={{ mb: 2 }} />
          <FormControlLabel control={<Switch checked={emailNotifs} onChange={e => setEmailNotifs(e.target.checked)} />} label="Email notifications" />
          <FormControlLabel control={<Switch checked={pushNotifs} onChange={e => setPushNotifs(e.target.checked)} />} label="Push notifications" />
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="h6" mb={2}>Appearance</Typography>
          <Divider sx={{ mb: 2 }} />
          <FormControlLabel control={<Switch checked={themeMode === 'dark'} onChange={() => dispatch(toggleTheme())} />} label={`${themeMode === 'dark' ? 'Dark' : 'Light'} mode`} />
        </CardContent></Card>
      </Stack>
    </Box>
  );
}
