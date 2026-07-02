import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography, TextField, Stack, Chip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getAdmins, createAdmin } from '@/services/superAdmin.service';
import type { UserResponse } from '@/services/types';
import { DataTable, FormModal, StatusBadge, EmptyState } from '@/components/common';
import type { Column } from '@/components/common';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', companyName: '', subdomain: '' };

export default function AdminsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  const { data: admins = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.admins, queryFn: getAdmins });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admins });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenants });
  };

  const toast = (severity: 'success' | 'error', message: string) => dispatch(pushToast({ severity, message }));
  const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed';

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => { toast('success', 'Admin created successfully'); invalidate(); setCreateOpen(false); setForm(EMPTY_FORM); },
    onError: (e) => toast('error', errMsg(e)),
  });

  const validate = () => {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.subdomain.trim()) errs.subdomain = 'Subdomain is required';
    else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(form.subdomain)) errs.subdomain = 'Lowercase letters, numbers and hyphens only';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    createMutation.mutate(form);
  };

  const columns: Column<UserResponse>[] = [
    { id: 'firstName', label: 'Name', render: (_: unknown, row: UserResponse) => `${row.firstName} ${row.lastName}` },
    { id: 'email', label: 'Email' },
    { id: 'tenantName', label: 'Company', render: (_: unknown, row: UserResponse) => (row as { tenantName?: string }).tenantName ?? '—' },
    { id: 'active', label: 'Status', render: (_: unknown, row: UserResponse) => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
    {
      id: 'categories', label: 'Categories',
      render: (_: unknown, row: UserResponse) => (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {(row.categories ?? []).map((c) => (
            <Chip key={typeof c === 'string' ? c : (c as { name: string }).name} label={typeof c === 'string' ? c : (c as { name: string }).name} size="small" />
          ))}
        </Stack>
      ),
    },
  ];

  const field = (name: keyof typeof EMPTY_FORM, label: string, type = 'text') => (
    <TextField
      key={name}
      fullWidth
      label={label}
      type={type}
      value={form[name]}
      onChange={e => { setForm(p => ({ ...p, [name]: e.target.value })); if (errors[name]) setErrors(p => ({ ...p, [name]: undefined })); }}
      error={Boolean(errors[name])}
      helperText={errors[name] ?? (name === 'password' ? 'Minimum 8 characters' : name === 'subdomain' ? 'e.g. restaurant (lowercase, hyphens allowed)' : undefined)}
      sx={{ mb: 2 }}
      required
    />
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Admin Management</Typography>
        <Button variant="contained" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setCreateOpen(true); }}>
          Create Admin
        </Button>
      </Stack>

      <DataTable
        columns={columns}
        rows={admins}
        keyField="id"
        loading={isLoading}
        emptyStateNode={
          <EmptyState
            title="No admins yet"
            description="Create your first admin account. Each admin automatically gets their own tenant."
            action={<Button variant="contained" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setCreateOpen(true); }}>Create Admin</Button>}
          />
        }
      />

      <FormModal open={createOpen} title="Create Admin" onClose={() => setCreateOpen(false)} loading={createMutation.isPending}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={0}>
          <TextField fullWidth label="First Name" value={form.firstName} onChange={e => { setForm(p => ({ ...p, firstName: e.target.value })); if (errors.firstName) setErrors(p => ({ ...p, firstName: undefined })); }} error={Boolean(errors.firstName)} helperText={errors.firstName} required />
          <TextField fullWidth label="Last Name" value={form.lastName} onChange={e => { setForm(p => ({ ...p, lastName: e.target.value })); if (errors.lastName) setErrors(p => ({ ...p, lastName: undefined })); }} error={Boolean(errors.lastName)} helperText={errors.lastName} required />
        </Stack>
        <Box sx={{ mb: 2 }} />
        {field('email', 'Email Address', 'email')}
        {field('password', 'Password', 'password')}
        {field('companyName', 'Company Name')}
        {field('subdomain', 'Subdomain')}
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createMutation.isPending}>
            Create Admin
          </Button>
        </Stack>
      </FormModal>
    </Box>
  );
}
