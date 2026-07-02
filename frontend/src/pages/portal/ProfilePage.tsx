import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function PortalProfilePage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [firstName, setFirstName] = useState(auth.firstName ?? '');
  const [lastName, setLastName] = useState(auth.lastName ?? '');
  const [saved, setSaved] = useState(false);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Profile</Typography>
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Stack alignItems="center" mb={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32, mb: 1 }}>
              {firstName?.[0]}{lastName?.[0]}
            </Avatar>
            <Typography variant="h6">{firstName} {lastName}</Typography>
            <Typography variant="body2" color="text.secondary">{auth.email}</Typography>
          </Stack>
          <TextField fullWidth label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Email" value={auth.email ?? ''} disabled sx={{ mb: 3 }} />
          <Button variant="contained" onClick={() => setSaved(true)}>{saved ? 'Saved!' : 'Save Changes'}</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
