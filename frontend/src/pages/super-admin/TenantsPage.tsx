import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography, TextField, Stack, Switch, LinearProgress, Chip, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getTenants, createTenant, updateSubdomain, updateCustomDomain, toggleTenantStatus, assignCategoriesToTenant, getCategories } from '@/services/superAdmin.service';
import type { TenantResponse, Category } from '@/services/types';
import { DataTable, FormModal, StatusBadge, EmptyState } from '@/components/common';
import type { Column } from '@/components/common';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';

function HealthScoreBar({ score }: { score?: number }) {
  const val = score ?? 0;
  const color = val <= 40 ? 'error' : val <= 70 ? 'warning' : 'success';
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 100 }}>
      <LinearProgress variant="determinate" value={val} color={color} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
      <Typography variant="caption">{val}</Typography>
    </Stack>
  );
}

export default function TenantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', subdomain: '', customDomain: '' });
  const [editingSubdomain, setEditingSubdomain] = useState<{ id: number; value: string } | null>(null);
  const [customDomainItem, setCustomDomainItem] = useState<TenantResponse | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [assignItem, setAssignItem] = useState<TenantResponse | null>(null);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);

  const { data: tenants = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.tenants, queryFn: getTenants });
  const { data: categories = [] } = useQuery({ queryKey: QUERY_KEYS.categories, queryFn: getCategories });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenants });
  const toast = (severity: 'success'|'error', message: string) => dispatch(pushToast({ severity, message }));
  const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed';

  const createMutation = useMutation({ mutationFn: createTenant, onSuccess: () => { toast('success', 'Tenant created'); invalidate(); setCreateOpen(false); }, onError: (e) => toast('error', errMsg(e)) });
  const subdomainMutation = useMutation({ mutationFn: ({ id, sub }: { id: number; sub: string }) => updateSubdomain(id, sub), onSuccess: () => { toast('success', 'Subdomain updated'); invalidate(); setEditingSubdomain(null); }, onError: (e) => toast('error', errMsg(e)) });
  const customDomainMutation = useMutation({ mutationFn: ({ id, d }: { id: number; d: string }) => updateCustomDomain(id, { customDomain: d }), onSuccess: () => { toast('success', 'Custom domain updated'); invalidate(); setCustomDomainItem(null); }, onError: (e) => toast('error', errMsg(e)) });
  const toggleMutation = useMutation({ mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleTenantStatus(id, active), onSuccess: () => { toast('success', 'Status updated'); invalidate(); }, onError: (e) => toast('error', errMsg(e)) });
  const assignMutation = useMutation({ mutationFn: ({ id, categoryIds }: { id: number; categoryIds: number[] }) => assignCategoriesToTenant(id, { categoryIds }), onSuccess: () => { toast('success', 'Categories assigned'); invalidate(); setAssignItem(null); }, onError: (e) => toast('error', errMsg(e)) });

  const columns: Column<TenantResponse>[] = [
    { id: 'companyName', label: 'Company Name', sortable: true },
    {
      id: 'subdomain', label: 'Subdomain',
      render: (_: unknown, row: TenantResponse) => editingSubdomain?.id === row.id
        ? <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" value={editingSubdomain.value} onChange={e => setEditingSubdomain({ id: row.id, value: e.target.value })} sx={{ width: 150 }} />
            <Button size="small" onClick={() => subdomainMutation.mutate({ id: row.id, sub: editingSubdomain.value })}>Save</Button>
            <Button size="small" onClick={() => setEditingSubdomain(null)}>Cancel</Button>
          </Stack>
        : <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{row.subdomain}</Typography>
            <Button size="small" onClick={() => setEditingSubdomain({ id: row.id, value: row.subdomain })}>Edit</Button>
          </Stack>,
    },
    { id: 'customDomain', label: 'Custom Domain', render: (_: unknown, row: TenantResponse) => row.customDomain ?? '—' },
    { id: 'adminName', label: 'Admin' },
    {
      id: 'categories', label: 'Categories',
      render: (_: unknown, row: TenantResponse) => (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {(row.categories ?? []).map((cName: string) => (
            <Chip key={cName} label={cName} size="small" />
          ))}
        </Stack>
      )
    },
    { id: 'active', label: 'Status', render: (_: unknown, row: TenantResponse) => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
    { id: 'subscriptionPlan', label: 'Plan', render: (_: unknown, row: TenantResponse) => row.subscriptionPlan ?? 'None' },
    { id: 'healthScore', label: 'Health Score', render: (_: unknown, row: TenantResponse) => <HealthScoreBar score={row.healthScore} /> },
    {
      id: 'actions', label: 'Actions',
      render: (_: unknown, row: TenantResponse) => (
        <Stack direction="row" spacing={1}>
          <Switch size="small" checked={row.active} onChange={e => toggleMutation.mutate({ id: row.id, active: e.target.checked })} />
          <Button size="small" onClick={() => { setCustomDomainItem(row); setCustomDomain(row.customDomain ?? ''); }}>Custom Domain</Button>
          <Button size="small" onClick={() => {
            setAssignItem(row);
            const ids = categories
              .filter((c: Category) => row.categories?.includes(c.name))
              .map((c: Category) => c.id);
            setSelectedCatIds(ids);
          }}>Categories</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Tenant Management</Typography>
        <Button variant="contained" onClick={() => { setCreateForm({ name: '', subdomain: '', customDomain: '' }); setCreateOpen(true); }}>Create Tenant</Button>
      </Stack>
      
      <DataTable columns={columns} rows={tenants} keyField="id" loading={isLoading}
        emptyStateNode={<EmptyState title="No tenants yet" description="Create your first tenant to organize your SaaS platform" />} />

      <FormModal open={createOpen} title="Create Tenant" onClose={() => setCreateOpen(false)} loading={createMutation.isPending}>
        <TextField fullWidth label="Company Name" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Subdomain" value={createForm.subdomain} onChange={e => setCreateForm(p => ({ ...p, subdomain: e.target.value }))} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Custom Domain (Optional)" value={createForm.customDomain} onChange={e => setCreateForm(p => ({ ...p, customDomain: e.target.value }))} sx={{ mb: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate(createForm)} disabled={!createForm.name.trim() || !createForm.subdomain.trim()}>Create</Button>
        </Stack>
      </FormModal>

      <FormModal open={!!customDomainItem} title="Set Custom Domain" onClose={() => setCustomDomainItem(null)} loading={customDomainMutation.isPending}>
        <TextField fullWidth label="Custom Domain" value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="e.g. restaurant.mycompany.com" sx={{ mb: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCustomDomainItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => customDomainItem && customDomainMutation.mutate({ id: customDomainItem.id, d: customDomain })}>Save</Button>
        </Stack>
      </FormModal>

      <FormModal open={!!assignItem} title="Assign Categories to Tenant" onClose={() => setAssignItem(null)} loading={assignMutation.isPending}>
        <FormGroup>
          {categories.map((c: Category) => (
            <FormControlLabel key={c.id} control={<Checkbox checked={selectedCatIds.includes(c.id)} onChange={e => setSelectedCatIds(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id))} />} label={c.name} />
          ))}
        </FormGroup>
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
          <Button onClick={() => setAssignItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => assignItem && assignMutation.mutate({ id: assignItem.id, categoryIds: selectedCatIds })}>Save</Button>
        </Stack>
      </FormModal>
    </Box>
  );
}
