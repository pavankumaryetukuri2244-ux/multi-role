import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, VisibilityOff, Business as BusinessIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginThunk } from '@/store/slices/authSlice';
import { roleRedirect } from '@/features/auth/utils/roleRedirect';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validators';
import type { AppDispatch, RootState } from '@/store';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, role } = useSelector((state: RootState) => state.auth);

  // ADMIN and SUPER_ADMIN should never see "Create Account"
  const canRegister = !role || role === 'USER';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValidation = validateRequired(email, 'Email') ?? validateEmail(email);
    const passwordValidation = validateRequired(password, 'Password') ?? validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    if (emailValidation || passwordValidation) return;

    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      navigate(roleRedirect(result.payload.role), { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusinessIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              SaaS Platform
            </Typography>
          </Box>

          {/* Heading */}
          <Typography variant="h4" fontWeight={700} mb={0.75}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to your account to continue
          </Typography>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email address"
              type="email"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
              error={Boolean(emailError)}
              helperText={emailError ?? ''}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1' }, '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' } }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              fullWidth
              value={password}
              onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(null); }}
              error={Boolean(passwordError)}
              helperText={passwordError ?? ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1' }, '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' } }}
            />

            {/* Remember me + Forgot password */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -1 }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} size="small" sx={{ '&.Mui-checked': { color: '#6366F1' } }} />}
                label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
              />
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate('/forgot-password')}
                underline="hover"
                sx={{ color: '#6366F1', fontWeight: 500, cursor: 'pointer' }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Sign In button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.45)' },
              }}
            >
              {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>

            {/* Create account — only for non-admin visitors */}
            {canRegister && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" component="span" color="text.secondary">
                  Don&apos;t have an account?{' '}
                </Typography>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  underline="hover"
                  sx={{ color: '#6366F1', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Account
                </Link>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
