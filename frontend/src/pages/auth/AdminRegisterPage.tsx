import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Link as MuiLink, IconButton,
  InputAdornment, Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, Business as BusinessIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { registerAdmin } from '@/services/auth.service';
import type { RegisterAdminRequest } from '@/services/auth.service';
import { validateRequired, validateEmail, validatePassword } from '@/utils/validators';
import type { AxiosError } from 'axios';

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const INITIAL: FormValues = {
  firstName: '', lastName: '', phone: '',
  email: '', password: '', confirmPassword: '',
};

function validateForm(v: FormValues): FormErrors {
  const errors: FormErrors = {};

  const firstNameErr = validateRequired(v.firstName, 'First name');
  if (firstNameErr) errors.firstName = firstNameErr;

  const lastNameErr = validateRequired(v.lastName, 'Last name');
  if (lastNameErr) errors.lastName = lastNameErr;

  // email is optional — only validate format if provided
  if (v.email.trim()) {
    const emailErr = validateEmail(v.email);
    if (emailErr) errors.email = emailErr;
  }

  const pwErr = validatePassword(v.password);
  if (pwErr) errors.password = pwErr;

  if (!v.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (v.password !== v.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export default function AdminRegisterPage() {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(p => ({ ...p, [name]: value }));
    // Only clear error if this field has an error slot in FormErrors
    const validErrorKeys: (keyof FormErrors)[] = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'general'];
    const errorKey = name as keyof FormErrors;
    if (validErrorKeys.includes(errorKey)) setErrors(p => ({ ...p, [errorKey]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsLoading(true);
    setErrors({});

    try {
      const payload: RegisterAdminRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        companyName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        subdomain: values.firstName.trim().toLowerCase(),
      };
      await registerAdmin(payload);
      setIsSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<Record<string, string>>;
      if (axiosErr.response?.status === 400 && axiosErr.response.data) {
        const data = axiosErr.response.data;
        const fieldErrors: FormErrors = {};
        const formErrorKeys: (keyof FormErrors)[] = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'general'];
        for (const [key, message] of Object.entries(data)) {
          if (formErrorKeys.includes(key as keyof FormErrors)) {
            fieldErrors[key as keyof FormErrors] = String(message);
          } else {
            fieldErrors.general = String(message);
          }
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: axiosErr.response?.data?.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
        <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>Account created!</Typography>
              Your account is pending approval. You'll be notified once it's activated.
            </Alert>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              <MuiLink component={Link} to="/login" underline="hover" fontWeight={600}>Back to Sign In</MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2, py: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusinessIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>SaaS Platform</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Create Account</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Fill in your details to get started
          </Typography>

          {errors.general && <Alert severity="error" sx={{ mb: 2 }}>{errors.general}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {/* First Name + Last Name */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="First Name" name="firstName" value={values.firstName}
                  onChange={handleChange} error={Boolean(errors.firstName)} helperText={errors.firstName}
                  required autoFocus autoComplete="given-name" />
                <TextField fullWidth label="Last Name" name="lastName" value={values.lastName}
                  onChange={handleChange} error={Boolean(errors.lastName)} helperText={errors.lastName}
                  required autoComplete="family-name" />
              </Stack>

              {/* Phone number */}
              <TextField fullWidth label="Phone Number" name="phone" value={values.phone}
                onChange={handleChange} type="tel" autoComplete="tel"
                inputProps={{ pattern: '[0-9+\\-\\s]*' }} />

              {/* Email (optional) */}
              <TextField fullWidth label="Email Address (optional)" name="email" type="email"
                value={values.email} onChange={handleChange} error={Boolean(errors.email)}
                helperText={errors.email ?? 'Optional — used for login and notifications'}
                autoComplete="email" />

              {/* Password */}
              <TextField fullWidth label="Password" name="password"
                type={showPw ? 'text' : 'password'} value={values.password}
                onChange={handleChange} error={Boolean(errors.password)}
                helperText={errors.password ?? 'Minimum 8 characters'}
                required autoComplete="new-password"
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(p => !p)} edge="end" size="small">
                      {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )}} />

              {/* Confirm Password */}
              <TextField fullWidth label="Confirm Password" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'} value={values.confirmPassword}
                onChange={handleChange} error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                required autoComplete="new-password"
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(p => !p)} edge="end" size="small">
                      {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )}} />

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading}
                sx={{ py: 1.5, fontWeight: 600, background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)' }}>
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
              </Button>

              <Typography variant="body2" textAlign="center" color="text.secondary">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" underline="hover" fontWeight={600} color="primary.main">
                  Sign In
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
