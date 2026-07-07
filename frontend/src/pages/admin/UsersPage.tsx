import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography, TextField, Stack } from '@mui/material';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/admin.service';
import type { UserResponse } from '@/services/types';
import { DataTable, FormModal, ConfirmDialog, StatusBadge, EmptyState } from '@/components/common';
import type { Column } from '@/components/common';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';
import { formatDate } from '@/utils/formatters';

export default function AdminUsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<UserResponse | null>(null);
  const [deleteItem, setDeleteItem] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });

  const { data: users = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.adminUsers, queryFn: getUsers });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers });
  const toast = (severity: 'success'|'error', msg: string) => dispatch(pushToast({ severity, message: msg }));
  const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed';

  const createMutation = useMutation({ mutationFn: createUser, onSuccess: () => { toast('success','User created'); invalidate(); setCreateOpen(false); }, onError: (e) => toast('error', errMsg(e)) });
  const updateMutation = useMutation({ mutationFn: ({ id, req }: { id: number; req: { firstName: string; lastName: string; active: boolean; phone?: string } }) => updateUser(id, req), onSuccess: () => { toast('success','User updated'); invalidate(); setEditItem(null); }, onError: (e) => toast('error', errMsg(e)) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteUser(id), onSuccess: () => { toast('success','User deleted'); invalidate(); setDeleteItem(null); }, onError: (e) => toast('error', errMsg(e)) });

  const columns: Column<UserResponse>[] = [
    { id: 'firstName', label: 'Name', render: (_: unknown, row: UserResponse) => `${row.firstName} ${row.lastName}` },
    { id: 'email', label: 'Email' },
    { id: 'active', label: 'Status', render: (_: unknown, row: UserResponse) => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
    { id: 'createdAt', label: 'Created', render: (_: unknown, row: UserResponse) => row.createdAt ? formatDate(row.createdAt) : '—' },
    {
      id: 'actions', label: 'Actions',
      render: (_: unknown, row: UserResponse) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => { setEditItem(row); setForm({ firstName: row.firstName, lastName: row.lastName, email: row.email, password: '', phone: row.phone ?? '' }); }}>Edit</Button>
          <Button size="small" color="error" onClick={() => setDeleteItem(row)}>Delete</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Users</Typography>
        <Button variant="contained" onClick={() => { setForm({ firstName:'',lastName:'',email:'',password:'',phone:'' }); setCreateOpen(true); }}>Create User</Button>
      </Stack>
      <DataTable columns={columns} rows={users} keyField="id" loading={isLoading}
        emptyStateNode={<EmptyState title="No users yet" description="Create your first user account" action={<Button variant="contained" onClick={() => setCreateOpen(true)}>Create User</Button>} />} />

      <FormModal open={createOpen} title="Create User" onClose={() => setCreateOpen(false)} loading={createMutation.isPending}>
        {(['firstName','lastName','email','phone','password'] as const).map(field => (
          <TextField key={field} fullWidth label={field.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}
            type={field==='password'?'password':'text'} value={form[field]}
            onChange={e => setForm(p=>({...p,[field]:e.target.value}))} sx={{ mb: 2 }} />
        ))}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate(form)}>Create</Button>
        </Stack>
      </FormModal>

      <FormModal open={!!editItem} title="Edit User" onClose={() => setEditItem(null)} loading={updateMutation.isPending}>
        <TextField fullWidth label="First Name" value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} sx={{ mb:2 }} />
        <TextField fullWidth label="Last Name" value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} sx={{ mb:2 }} />
        <TextField fullWidth label="Phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} sx={{ mb:2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => editItem && updateMutation.mutate({ id: editItem.id, req: { firstName: form.firstName, lastName: form.lastName, active: editItem.active, phone: form.phone } })}>Save</Button>
        </Stack>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} title="Delete User" message={`Delete user "${deleteItem?.firstName} ${deleteItem?.lastName}"?`}
        confirmColor="error" onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} onCancel={() => setDeleteItem(null)} loading={deleteMutation.isPending} />
    </Box>
  );
}
