import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Typography, TextField, Stack, Grid2,
  Divider, IconButton, InputAdornment, Chip,
  Avatar, MenuItem, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Switch, FormControlLabel, Autocomplete, createFilterOptions,
  TablePagination, Card, CardContent, Select, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getAdmins, createAdmin, updateAdmin, getCategories, getSubscriptionPlans, createCategory } from '@/services/superAdmin.service';
import type { UserResponse } from '@/services/types';
import { FormModal, ConfirmDialog, EmptyState, StatusBadge } from '@/components/common';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyEmail: string;
  companyDomain: string;
  gstin: string;
  managerName: string;
  subdomain: string;
  subscriptionPlanId: string;
  categoryId: string;
  categoryName?: string;
  tenantCode?: string;
}

type FormErrors = Partial<Record<keyof AdminForm, string>>;

const EMPTY: AdminForm = {
  firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '',
  companyName: '', companyEmail: '', companyDomain: '', gstin: '', managerName: '', subdomain: '',
  subscriptionPlanId: '', categoryId: '', categoryName: '', tenantCode: '',
};

const filter = createFilterOptions<any>();

// ─── Section heading — defined OUTSIDE component to prevent remount ───────────

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight={700} sx={{ color: '#111827' }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const [viewItem, setViewItem] = useState<UserResponse | null>(null);
  const [editItem, setEditItem] = useState<UserResponse | null>(null);
  const [deleteItem, setDeleteItem] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<AdminForm>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: admins = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.admins, queryFn: getAdmins });
  const { data: categories = [] } = useQuery({ queryKey: QUERY_KEYS.categories, queryFn: getCategories });
  const { data: plans = [] } = useQuery({ queryKey: QUERY_KEYS.subscriptionPlans, queryFn: getSubscriptionPlans });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admins });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenants });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.superAdminAnalytics });
  };

  const toast = (s: 'success' | 'error', m: string) => dispatch(pushToast({ severity: s, message: m }));
  const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed';

  // ── Mutations ────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      toast('success', 'Admin account created successfully');
      invalidate();
      setCreateOpen(false);
      setForm(EMPTY);
    },
    onError: (e) => toast('error', errMsg(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { firstName: string; lastName: string; active: boolean } }) =>
      updateAdmin(id, data),
    onSuccess: () => { toast('success', 'Admin updated'); invalidate(); setEditItem(null); },
    onError: (e) => toast('error', errMsg(e)),
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = () => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Must be 10 digits';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.subdomain.trim()) e.subdomain = 'Required';
    else if (!/^[a-z0-9][a-z0-9-]*$/.test(form.subdomain)) e.subdomain = 'Lowercase letters, numbers and hyphens only';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof AdminForm, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const handleCreate = async () => {
    if (!validate()) return;

    let finalCategoryId = form.categoryId;

    if (form.categoryId === 'NEW' && form.categoryName) {
      try {
        const generatedCode = form.categoryName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
        const newCat = await createCategory({ 
          name: form.categoryName, 
          categoryCode: generatedCode,
          description: '' 
        });
        finalCategoryId = String(newCat.id);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      } catch (err) {
        dispatch(pushToast({ severity: 'error', message: 'Failed to create new category' }));
        return;
      }
    }

    createMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      companyName: form.companyName,
      subdomain: form.subdomain,
      categoryId: finalCategoryId ? Number(finalCategoryId) : undefined,
      planId: form.subscriptionPlanId ? Number(form.subscriptionPlanId) : undefined,
      phone: form.phone,
      tenantCode: form.tenantCode,
      gstin: form.gstin,
    });
  };

  const openEdit = (admin: UserResponse) => {
    setEditItem(admin);
    setForm({
      ...EMPTY,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      companyName: admin.companyName ?? '',
      subdomain: admin.subdomain ?? '',
    });
    setErrors({});
  };

  const handleEdit = () => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    updateMutation.mutate({
      id: editItem!.id,
      data: { firstName: form.firstName, lastName: form.lastName, active: editItem!.active },
    });
  };

  const handleToggleStatus = (admin: UserResponse) => {
    updateMutation.mutate({
      id: admin.id,
      data: { firstName: admin.firstName, lastName: admin.lastName, active: !admin.active },
    });
  };

  // ── Filtered admins ──────────────────────────────────────────────────────────

  // ── Filtered admins ──────────────────────────────────────────────────────────

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch = !q || `${a.firstName} ${a.lastName} ${a.email} ${a.companyName ?? ''}`.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && a.active) || (statusFilter === 'inactive' && !a.active);
    return matchesSearch && matchesStatus;
  });

  const paginatedAdmins = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.active).length;
  const inactiveAdmins = admins.filter(a => !a.active).length;
  const totalCategories = categories.length;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#111827' }}>Admin Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your multi-tenant platform and track admin accounts across all sectors.
        </Typography>
      </Box>

      {/* Stats Cards Row */}
      <Grid2 container spacing={3} mb={4}>
        {[
          { label: 'Total Admins', value: totalAdmins, color: '#6366F1', filter: 'all' },
          { label: 'Active Admins', value: activeAdmins, color: '#10B981', filter: 'active' },
          { label: 'Inactive Admins', value: inactiveAdmins, color: '#EF4444', filter: 'inactive' },
          { label: 'Total Categories', value: totalCategories, color: '#F59E0B', filter: 'all' },
        ].map(stat => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card 
              elevation={0} 
              onClick={() => {
                if (stat.label !== 'Total Categories') {
                  setStatusFilter(stat.filter);
                }
              }}
              sx={{ 
                border: '1px solid #E5E7EB', 
                borderRadius: 3, 
                transition: 'transform 0.2s', 
                cursor: stat.label !== 'Total Categories' ? 'pointer' : 'default',
                opacity: (stat.label !== 'Total Categories' && statusFilter !== stat.filter && statusFilter !== 'all') ? 0.7 : 1,
                '&:hover': { transform: stat.label !== 'Total Categories' ? 'translateY(-2px)' : 'none', boxShadow: stat.label !== 'Total Categories' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none' } 
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">{stat.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: stat.color, mt: 1 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Unified Action Bar */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          {admins.length > 0 && (
            <>
              <TextField
                size="small" placeholder="Search admins..."
                value={search} onChange={e => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>
                    ),
                  },
                }}
                sx={{ width: { xs: '100%', sm: 300 }, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 }, bgcolor: '#fff' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Stack>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm(EMPTY); setErrors({}); setShowPw(false); setShowConfirm(false); setCreateOpen(true); }}
          sx={{
            borderRadius: 2, fontWeight: 600, bgcolor: '#6366F1',
            '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', px: 3, py: 1,
            width: { xs: '100%', md: 'auto' },
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          }}
        >
          Create Admin
        </Button>
      </Stack>

      {/* Table */}
      {isLoading || admins.length === 0 ? (
        <EmptyState
          title="No admin accounts yet"
          description="Create the first admin. Each admin gets their own isolated company workspace."
          action={
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => { setForm(EMPTY); setErrors({}); setCreateOpen(true); }}>
              Create Admin
            </Button>
          }
        />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5, pl: 2.5 }}>ADMIN</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5 }}>COMPANY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5 }}>SUBDOMAIN</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5 }}>CATEGORIES</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5 }}>CREATED</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', py: 1.5, pr: 2.5 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAdmins.map((admin, idx) => (
                  <TableRow
                    key={admin.id}
                    sx={{
                      transition: 'background-color 0.2s',
                      bgcolor: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                      '&:hover': { bgcolor: '#EEF2FF !important' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {/* Admin name + email */}
                    <TableCell sx={{ pl: 2.5, py: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            bgcolor: '#EEF2FF', color: '#6366F1',
                            width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                          }}
                        >
                          {admin.firstName.charAt(0).toUpperCase()}{admin.lastName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Stack direction="column" minWidth={0}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#111827' }} noWrap>
                            {admin.firstName} {admin.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {admin.email}
                          </Typography>
                          {admin.phone && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              📞 {admin.phone}
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Company */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {admin.companyName || '—'}
                      </Typography>
                      {admin.tenantCode && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          Code: {admin.tenantCode}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Subdomain */}
                    <TableCell>
                      {admin.subdomain ? (
                        <Chip
                          label={`${admin.subdomain}.saas.app`}
                          size="small"
                          sx={{ bgcolor: '#F3F4F6', color: '#374151', fontSize: '0.7rem', height: 22 }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Categories */}
                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {admin.categories && admin.categories.length > 0 ? (
                          admin.categories.map(c => {
                            const label = typeof c === 'string' ? c : (c as { name: string }).name;
                            return (
                              <Chip key={label} label={label} size="small"
                                sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontSize: '0.7rem', height: 20 }} />
                            );
                          })
                        ) : (
                          <Typography variant="caption" color="text.disabled">No category</Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={admin.active}
                            onChange={() => handleToggleStatus(admin)}
                            disabled={updateMutation.isPending}
                            size="small"
                            color="success"
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontWeight: 600, color: admin.active ? '#065F46' : '#991B1B' }}>
                            {admin.active ? 'Active' : 'Inactive'}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ pr: 2.5 }}>
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="View admin details">
                          <IconButton size="small" onClick={() => setViewItem(admin)}
                            sx={{ color: '#6B7280', '&:hover': { color: '#10B981', bgcolor: '#D1FAE5' } }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit admin">
                          <IconButton size="small" onClick={() => openEdit(admin)}
                            sx={{ color: '#6B7280', '&:hover': { color: '#6366F1', bgcolor: '#EEF2FF' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete admin">
                          <IconButton size="small" onClick={() => setDeleteItem(admin)}
                            sx={{ color: '#6B7280', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No admins match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filtered.length > 0 && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </Paper>
      )}

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <FormModal open={createOpen} title="Create Admin Account" onClose={() => setCreateOpen(false)}
        loading={createMutation.isPending} maxWidth="md">

        {/* Section 1 — Admin credentials */}
        <SectionHeading title="Admin Details" subtitle="Login credentials for the admin account" />
        <Grid2 container spacing={2} mb={3}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="First Name" required size="small"
              value={form.firstName} onChange={e => set('firstName', e.target.value)}
              error={Boolean(errors.firstName)} helperText={errors.firstName} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Last Name" required size="small"
              value={form.lastName} onChange={e => set('lastName', e.target.value)}
              error={Boolean(errors.lastName)} helperText={errors.lastName} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Phone Number" required size="small"
              value={form.phone}
              onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={Boolean(errors.phone)} helperText={errors.phone ?? '10-digit mobile number'}
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10 } }} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Login Email" required size="small" type="email"
              value={form.email} onChange={e => set('email', e.target.value)}
              error={Boolean(errors.email)} helperText={errors.email} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Password" required size="small"
              type={showPw ? 'text' : 'password'}
              value={form.password} onChange={e => set('password', e.target.value)}
              error={Boolean(errors.password)} helperText={errors.password ?? 'Min 8 characters'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(p => !p)}>
                        {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Confirm Password" required size="small"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
              error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm(p => !p)}>
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }} />
          </Grid2>
        </Grid2>

        <Divider sx={{ mb: 2.5 }} />

        {/* Section 2 — Company */}
        <SectionHeading title="Company Details" subtitle="Business information for the admin's workspace" />
        <Grid2 container spacing={2} mb={3}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Company Name" required size="small"
              value={form.companyName} onChange={e => set('companyName', e.target.value)}
              error={Boolean(errors.companyName)} helperText={errors.companyName} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Company Email" size="small" type="email"
              value={form.companyEmail} onChange={e => set('companyEmail', e.target.value)}
              placeholder="contact@company.com" />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Company Domain" size="small"
              value={form.companyDomain} onChange={e => set('companyDomain', e.target.value)}
              placeholder="www.company.com" />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Subdomain" required size="small"
              value={form.subdomain}
              onChange={e => set('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              error={Boolean(errors.subdomain)}
              helperText={errors.subdomain ?? 'e.g. myshop (used in platform URL)'}
              slotProps={{
                input: { endAdornment: <InputAdornment position="end">.saas.app</InputAdornment> },
              }} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="GSTIN Number" size="small"
              value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              slotProps={{ htmlInput: { maxLength: 15 } }} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Manager / Owner Name" size="small"
              value={form.managerName} onChange={e => set('managerName', e.target.value)}
              placeholder="Person in charge" />
          </Grid2>
        </Grid2>

        <Divider sx={{ mb: 2.5 }} />

        {/* Section 3 — Plan & Category */}
        <SectionHeading title="Subscription & Sector" subtitle="Assign a plan and business category" />
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth select label="Subscription Plan" size="small"
              value={form.subscriptionPlanId} onChange={e => set('subscriptionPlanId', e.target.value)}>
              <MenuItem value=""><em>No plan (Free)</em></MenuItem>
              {plans.map(p => (
                <MenuItem key={p.id} value={String(p.id)}>{p.name} — ₹{p.price}/mo</MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              value={form.categoryId === 'NEW' ? ({ name: form.categoryName } as any) : categories.find(c => String(c.id) === form.categoryId) || null}
              onChange={(_, newValue: any) => {
                if (typeof newValue === 'string') {
                  set('categoryName', newValue);
                  set('categoryId', 'NEW');
                } else if (newValue && newValue.inputValue) {
                  set('categoryName', newValue.inputValue);
                  set('categoryId', 'NEW');
                } else {
                  set('categoryId', newValue ? String(newValue.id) : '');
                  set('categoryName', '');
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option.name);
                if (inputValue !== '' && !isExisting) {
                  filtered.push({ inputValue, name: `Add "${inputValue}"` });
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              options={categories}
              getOptionLabel={(option: any) => {
                if (typeof option === 'string') return option;
                if (option.inputValue) return option.inputValue;
                return option.name;
              }}
              renderOption={(props, option: any) => {
                const { key, ...rest } = props as any;
                return <li key={key || option.id || option.name || option.inputValue} {...rest}>{option.name}</li>;
              }}
              isOptionEqualToValue={(option, value) => {
                if (value.id) return option.id === value.id;
                if (value.name) return option.name === value.name;
                return false;
              }}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Business Sector / Category" size="small" />
              )}
            />
          </Grid2>
        </Grid2>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createMutation.isPending}
            sx={{ textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, px: 3 }}>
            {createMutation.isPending ? 'Creating...' : 'Create Admin'}
          </Button>
        </Stack>
      </FormModal>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <FormModal open={!!editItem} title="Edit Admin"
        onClose={() => setEditItem(null)} loading={updateMutation.isPending}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="First Name" size="small"
              value={form.firstName} onChange={e => set('firstName', e.target.value)}
              error={Boolean(errors.firstName)} helperText={errors.firstName} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Last Name" size="small"
              value={form.lastName} onChange={e => set('lastName', e.target.value)}
              error={Boolean(errors.lastName)} helperText={errors.lastName} />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField fullWidth label="Company Name" size="small"
              value={form.companyName} onChange={e => set('companyName', e.target.value)} />
          </Grid2>
        </Grid2>
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
          <Button onClick={() => setEditItem(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} disabled={updateMutation.isPending}
            sx={{ textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
            Save Changes
          </Button>
        </Stack>
      </FormModal>

      {/* ── View Modal ───────────────────────────────────────────────────────── */}
      <FormModal open={!!viewItem} title="Admin Details" onClose={() => setViewItem(null)} maxWidth="sm">
        {viewItem && (
          <Box>
            <Stack direction="row" spacing={2.5} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: '#EEF2FF', color: '#6366F1', width: 64, height: 64, fontSize: '1.5rem', fontWeight: 700 }}>
                {viewItem.firstName.charAt(0).toUpperCase()}{viewItem.lastName.charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.5}>
                <Typography variant="h6" fontWeight={700} color="#111827" sx={{ lineHeight: 1 }}>
                  {viewItem.firstName} {viewItem.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>{viewItem.email}</Typography>
                {viewItem.phone && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>📞 {viewItem.phone}</Typography>}
              </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Company</Typography>
                  <Typography variant="body2" fontWeight={500} color="#111827">{viewItem.companyName || '—'}</Typography>
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Tenant Code</Typography>
                  <Typography variant="body2" fontWeight={500} color="#111827">{viewItem.tenantCode || '—'}</Typography>
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Subdomain</Typography>
                  <Typography variant="body2" fontWeight={500} color="#111827">{viewItem.subdomain ? `${viewItem.subdomain}.saas.app` : '—'}</Typography>
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Status</Typography>
                  <Box><StatusBadge status={viewItem.active ? 'active' : 'inactive'} /></Box>
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Created At</Typography>
                  <Typography variant="body2" fontWeight={500} color="#111827">{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : '—'}</Typography>
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Categories</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {viewItem.categories && viewItem.categories.length > 0 ? (
                      viewItem.categories.map(c => {
                        const label = typeof c === 'string' ? c : (c as { name: string }).name;
                        return (
                          <Chip key={label} label={label} size="small"
                            sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontSize: '0.7rem', height: 20 }} />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </Stack>
                </Stack>
              </Grid2>
            </Grid2>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button onClick={() => setViewItem(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Close</Button>
            </Box>
          </Box>
        )}
      </FormModal>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Admin Account"
        message={`Remove "${deleteItem?.firstName} ${deleteItem?.lastName}" (${deleteItem?.email})? Their company workspace will be deactivated.`}
        confirmColor="error"
        onConfirm={() => {
          toast('success', `Admin "${deleteItem?.firstName} ${deleteItem?.lastName}" deleted`);
          setDeleteItem(null);
        }}
        onCancel={() => setDeleteItem(null)}
      />
    </Box>
  );
}
