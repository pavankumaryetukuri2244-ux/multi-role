import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography, TextField, Stack, Grid2, Card, CardContent, Chip, Switch, FormControlLabel, List, ListItem, ListItemText } from '@mui/material';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/services/superAdmin.service';
import type { SubscriptionPlan, SubscriptionPlanRequest } from '@/services/types';
import { FormModal, ConfirmDialog, EmptyState } from '@/components/common';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';

const EMPTY_FORM: SubscriptionPlanRequest = { name: '', price: 0, features: '', durationDays: 30, active: true };

export default function SubscriptionPlansPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubscriptionPlan | null>(null);
  const [deleteItem, setDeleteItem] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<SubscriptionPlanRequest>(EMPTY_FORM);

  const { data: plans = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.subscriptionPlans, queryFn: getSubscriptionPlans });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptionPlans });
  const toast = (severity: 'success'|'error', message: string) => dispatch(pushToast({ severity, message }));
  const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed';

  const createMutation = useMutation({ mutationFn: createSubscriptionPlan, onSuccess: () => { toast('success', 'Plan created'); invalidate(); setCreateOpen(false); }, onError: (e) => toast('error', errMsg(e)) });
  const updateMutation = useMutation({ mutationFn: ({ id, req }: { id: number; req: SubscriptionPlanRequest }) => updateSubscriptionPlan(id, req), onSuccess: () => { toast('success', 'Plan updated'); invalidate(); setEditItem(null); }, onError: (e) => toast('error', errMsg(e)) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteSubscriptionPlan(id), onSuccess: () => { toast('success', 'Plan deleted'); invalidate(); setDeleteItem(null); }, onError: (e) => toast('error', errMsg(e)) });

  const PlanForm = () => (
    <Stack spacing={2}>
      <TextField fullWidth label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
      <TextField fullWidth label="Price ($)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
      <TextField fullWidth label="Duration (days)" type="number" value={form.durationDays} onChange={e => setForm(p => ({ ...p, durationDays: parseInt(e.target.value) || 0 }))} />
      <TextField fullWidth label="Features (one per line)" multiline rows={4} value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} />
      <FormControlLabel control={<Switch checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />} label="Active" />
    </Stack>
  );

  if (!isLoading && plans.length === 0) return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Subscription Plans</Typography>
        <Button variant="contained" onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}>Create Plan</Button>
      </Stack>
      <EmptyState title="No plans yet" description="Create subscription plans for your tenants" action={<Button variant="contained" onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}>Create Plan</Button>} />
      <FormModal open={createOpen} title="Create Plan" onClose={() => setCreateOpen(false)} loading={createMutation.isPending}>
        <PlanForm />
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={() => createMutation.mutate(form)}>Create</Button></Stack>
      </FormModal>
    </Box>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Subscription Plans</Typography>
        <Button variant="contained" onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}>Create Plan</Button>
      </Stack>

      <Grid2 container spacing={3}>
        {plans.map((plan: SubscriptionPlan) => (
          <Grid2 key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ opacity: plan.active ? 1 : 0.5, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
                  <Chip label={plan.active ? 'Active' : 'Inactive'} color={plan.active ? 'success' : 'default'} size="small" />
                </Stack>
                <Typography variant="h4" color="primary" fontWeight={700} mb={1}>${plan.price.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{plan.durationDays} days</Typography>
                <List dense>
                  {plan.features.split('\n').filter(Boolean).map((f, i) => (
                    <ListItem key={i} sx={{ py: 0 }}><ListItemText primary={`• ${f}`} primaryTypographyProps={{ variant: 'body2' }} /></ListItem>
                  ))}
                </List>
                <Stack direction="row" spacing={1} mt={2} sx={{ pointerEvents: plan.active ? 'auto' : 'none' }}>
                  <Button size="small" onClick={() => { setEditItem(plan); setForm({ name: plan.name, price: plan.price, features: plan.features, durationDays: plan.durationDays, active: plan.active }); }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => setDeleteItem(plan)}>Delete</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <FormModal open={createOpen} title="Create Plan" onClose={() => setCreateOpen(false)} loading={createMutation.isPending}>
        <PlanForm />
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={() => createMutation.mutate(form)}>Create</Button></Stack>
      </FormModal>

      <FormModal open={!!editItem} title="Edit Plan" onClose={() => setEditItem(null)} loading={updateMutation.isPending}>
        <PlanForm />
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}><Button onClick={() => setEditItem(null)}>Cancel</Button><Button variant="contained" onClick={() => editItem && updateMutation.mutate({ id: editItem.id, req: form })}>Save</Button></Stack>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} title="Delete Plan" message={`Delete plan "${deleteItem?.name}"?`} confirmColor="error"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} onCancel={() => setDeleteItem(null)} loading={deleteMutation.isPending} />
    </Box>
  );
}
