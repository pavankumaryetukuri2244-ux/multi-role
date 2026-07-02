/**
 * ResetPasswordPage
 *
 * Reads a `token` query parameter from the URL. If absent, redirects to /login.
 * Accepts newPassword + confirmPassword, validates them, then POSTs to
 * /auth/reset-password with { token, newPassword }.
 *
 * Validates: Requirements 3.5, 3.8
 */

import { useState } from 'react';
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { validatePassword } from '@/utils/validators';
import apiClient from '@/services/apiClient';

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeInVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

interface FormErrors {
  newPassword: string | null;
  confirmPassword: string | null;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({ newPassword: null, confirmPassword: null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // If there's no token in the URL, redirect to login immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = { newPassword: null, confirmPassword: null };

    const pwError = validatePassword(newPassword);
    if (pwError) newErrors.newPassword = pwError;

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ??
        'Failed to reset password. The link may have expired. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        style={{ width: '100%', maxWidth: 440 }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockResetOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              component="h1"
              fontWeight={700}
              textAlign="center"
              gutterBottom
            >
              Reset Password
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3 }}
            >
              Choose a strong new password for your account
            </Typography>

            {/* Success state */}
            {success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password reset successfully!
                </Alert>
                <Typography variant="body2" textAlign="center">
                  <Link component={RouterLink} to="/login" underline="hover" fontWeight={500}>
                    Go to login →
                  </Link>
                </Typography>
              </Box>
            ) : (
              /* Form */
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {serverError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                  </Alert>
                )}

                {/* New password */}
                <TextField
                  fullWidth
                  label="New password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoFocus
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
                  }}
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword ?? 'Minimum 8 characters'}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Confirm password */}
                <TextField
                  fullWidth
                  label="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword ?? ' '}
                  disabled={loading}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2, py: 1.5, fontWeight: 600 }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <Typography variant="body2" textAlign="center">
                  <Link component={RouterLink} to="/login" underline="hover" fontWeight={500}>
                    ← Back to login
                  </Link>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
