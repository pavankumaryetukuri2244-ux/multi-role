import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  Grid2,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState, AppDispatch } from '@/store';
import { updateProfile, changePassword } from '@/services/user.service';
import { pushToast } from '@/store/slices/uiSlice';
import { setCredentials } from '@/store/slices/authSlice';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

export default function ProfilePage() {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  // Profile Form State
  const [firstName, setFirstName] = useState(auth.firstName ?? '');
  const [lastName, setLastName] = useState(auth.lastName ?? '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const initials = (
    (auth.firstName?.[0] ?? '') + (auth.lastName?.[0] ?? '')
  ).toUpperCase() || '?';

  const updateProfileMutation = useMutation({
    mutationFn: () => updateProfile({ firstName, lastName }),
    onSuccess: (updatedUser) => {
      dispatch(pushToast({ severity: 'success', message: 'Profile updated successfully' }));
      // Update auth state so the avatar/name reflects immediately across the app
      dispatch(setCredentials({
        token: auth.token!, // token hasn't changed
        role: auth.role!,
        userId: auth.userId!,
        email: auth.email!,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      }));
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: () => {
      dispatch(pushToast({ severity: 'error', message: 'Failed to update profile' }));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      dispatch(pushToast({ severity: 'success', message: 'Password changed successfully' }));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to change password';
      dispatch(pushToast({ severity: 'error', message: msg }));
    },
  });

  const handleSaveProfile = () => {
    if (!firstName.trim() || !lastName.trim()) {
      dispatch(pushToast({ severity: 'error', message: 'First and Last name are required' }));
      return;
    }
    updateProfileMutation.mutate();
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    changePasswordMutation.mutate();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        My Profile
      </Typography>

      <Grid2 container spacing={4}>
        {/* Left Column: Personal Information */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, h: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Personal Details</Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              <Stack alignItems="center" mb={4}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#EEF2FF', color: '#6366F1', fontSize: 32, fontWeight: 700, mb: 1 }}>
                  {initials}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {auth.firstName} {auth.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {auth.email}
                </Typography>
              </Stack>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Email (Read Only)"
                  value={auth.email ?? ''}
                  disabled
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  sx={{ mt: 2, alignSelf: 'flex-start', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}
                >
                  Save Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Right Column: Security / Password */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, h: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <LockIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Security</Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="body2" color="text.secondary" mb={3}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  size="small"
                  error={!!passwordError}
                  helperText={passwordError}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSavePassword}
                  disabled={changePasswordMutation.isPending}
                  sx={{ mt: 2, alignSelf: 'flex-start', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                >
                  Update Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
