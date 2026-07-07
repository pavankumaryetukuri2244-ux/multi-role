import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Business as BusinessIcon, Person as PersonIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import type { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { getPublicTenants, registerAdmin, registerUser } from '@/services/auth.service';
import type { RegisterAdminRequest, UserRegisterRequest } from '@/services/auth.service';
import type { TenantResponse } from '@/services/types';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validators';

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  subdomain: string;
  tenantId: number | '';
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
  subdomain?: string;
  tenantId?: string;
  general?: string;
}

const INITIAL: FormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  subdomain: '',
  tenantId: '',
};

export default function RegisterPage() {
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadTenants() {
      try {
        setTenants(await getPublicTenants());
      } catch (err) {
        console.error('Failed to load tenants', err);
      }
    }

    loadTenants();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleRoleChange = (_: React.SyntheticEvent, newValue: 'USER' | 'ADMIN') => {
    setRole(newValue);
    setErrors({});
  };

  const validateForm = (v: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};

    const firstNameErr = validateRequired(v.firstName, 'First name');
    if (firstNameErr) nextErrors.firstName = firstNameErr;

    const lastNameErr = validateRequired(v.lastName, 'Last name');
    if (lastNameErr) nextErrors.lastName = lastNameErr;

    const emailErr = v.email.trim() ? validateEmail(v.email) : 'Email is required';
    if (emailErr) nextErrors.email = emailErr;

    const passwordErr = validatePassword(v.password);
    if (passwordErr) nextErrors.password = passwordErr;

    if (!v.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (v.password !== v.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (role === 'ADMIN') {
      const companyErr = validateRequired(v.companyName, 'Company name');
      if (companyErr) nextErrors.companyName = companyErr;

      const subdomainErr = validateRequired(v.subdomain, 'Subdomain');
      if (subdomainErr) nextErrors.subdomain = subdomainErr;
    } else if (v.tenantId === '') {
      nextErrors.tenantId = 'Please select a company to join';
    }

    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (role === 'ADMIN') {
        const payload: RegisterAdminRequest = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
          companyName: values.companyName.trim(),
          subdomain: values.subdomain.trim().toLowerCase(),
          phone: values.phone.trim() || undefined,
        };
        await registerAdmin(payload);
      } else {
        const payload: UserRegisterRequest = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
          tenantId: Number(values.tenantId),
          phone: values.phone.trim() || undefined,
        };
        await registerUser(payload);
      }
      setIsSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<Record<string, string> | { message?: string }>;
      const responseData = axiosErr.response?.data;
      if (axiosErr.response?.status === 400 && responseData && !('message' in responseData)) {
        const fieldErrors: FormErrors = {};
        for (const [key, message] of Object.entries(responseData)) {
          fieldErrors[key as keyof FormErrors] = String(message);
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: responseData && 'message' in responseData ? responseData.message : 'Registration failed. Please try again.' });
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
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography fontWeight={600}>Account created successfully!</Typography>
              {role === 'ADMIN'
                ? "Your business account is pending approval. You'll be notified once it's activated."
                : 'You can now sign in to access your portal and start buying products.'}
            </Alert>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              <MuiLink component={Link} to="/login" underline="hover" fontWeight={600} sx={{ color: '#6366F1' }}>Back to Sign In</MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2, py: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusinessIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>SaaS Platform</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Create Account</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Fill in your details to get started</Typography>

          <Tabs value={role} onChange={handleRoleChange} variant="fullWidth" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Register as Customer" value="USER" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Register as Business" value="ADMIN" icon={<BusinessIcon />} iconPosition="start" />
          </Tabs>

          {errors.general && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errors.general}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="First Name" name="firstName" value={values.firstName} onChange={handleChange} error={Boolean(errors.firstName)} helperText={errors.firstName} required autoFocus autoComplete="given-name" />
                <TextField fullWidth label="Last Name" name="lastName" value={values.lastName} onChange={handleChange} error={Boolean(errors.lastName)} helperText={errors.lastName} required autoComplete="family-name" />
              </Stack>

              <TextField fullWidth label="Phone Number (optional)" name="phone" value={values.phone} onChange={handleChange} type="tel" autoComplete="tel" />

              <TextField fullWidth label="Email Address" name="email" type="email" value={values.email} onChange={handleChange} error={Boolean(errors.email)} helperText={errors.email} required autoComplete="email" />

              {role === 'USER' && (
                <FormControl fullWidth error={Boolean(errors.tenantId)}>
                  <InputLabel id="tenant-select-label">Select Company / Business</InputLabel>
                  <Select
                    labelId="tenant-select-label"
                    name="tenantId"
                    value={values.tenantId}
                    label="Select Company / Business"
                    onChange={e => {
                      setValues(prev => ({ ...prev, tenantId: e.target.value as number }));
                      setErrors(prev => ({ ...prev, tenantId: undefined }));
                    }}
                  >
                    {tenants.map(tenant => (
                      <MenuItem key={tenant.id} value={tenant.id}>{tenant.companyName} ({tenant.subdomain})</MenuItem>
                    ))}
                    {tenants.length === 0 && <MenuItem disabled value="">No active businesses available</MenuItem>}
                  </Select>
                  {errors.tenantId && <FormHelperText>{errors.tenantId}</FormHelperText>}
                </FormControl>
              )}

              {role === 'ADMIN' && (
                <>
                  <TextField fullWidth label="Company Name" name="companyName" value={values.companyName} onChange={handleChange} error={Boolean(errors.companyName)} helperText={errors.companyName} required />
                  <TextField fullWidth label="Subdomain" name="subdomain" value={values.subdomain} onChange={handleChange} error={Boolean(errors.subdomain)} helperText={errors.subdomain ?? 'Your portal URL will be: subdomain.domain.com'} required placeholder="my-business" />
                </>
              )}

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPw ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password ?? 'Minimum 8 characters'}
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(prev => !prev)} edge="end" size="small">
                        {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(prev => !prev)} edge="end" size="small">
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ py: 1.5, fontWeight: 600, background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)' }}>
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
              </Button>

              <Typography variant="body2" textAlign="center" color="text.secondary">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" underline="hover" fontWeight={600} sx={{ color: '#6366F1' }}>Sign In</MuiLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
