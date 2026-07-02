/**
 * ForgotPasswordPage
 *
 * Centered card layout with email input. Submits POST /auth/forgot-password
 * and always shows a success message (fire-and-forget) to prevent email enumeration.
 *
 * Validates: Requirements 3.4, 3.7
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { validateEmail } from '@/utils/validators';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (emailError) setEmailError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side validation
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setLoading(true);
    try {
      // Fire-and-forget: always show success regardless of outcome
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
    } catch {
      // Intentionally swallowed to prevent email enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
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
                <EmailOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
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
              Forgot Password
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3 }}
            >
              Enter your email address and we'll send you a reset link
            </Typography>

            {/* Success state */}
            {submitted ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  If that email exists, a reset link has been sent.
                </Alert>
                <Typography variant="body2" textAlign="center">
                  <Link component={RouterLink} to="/login" underline="hover" fontWeight={500}>
                    ← Back to login
                  </Link>
                </Typography>
              </Box>
            ) : (
              /* Form */
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  error={Boolean(emailError)}
                  helperText={emailError ?? ' '}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  inputProps={{ 'aria-label': 'Email address' }}
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
                    'Send Reset Link'
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
