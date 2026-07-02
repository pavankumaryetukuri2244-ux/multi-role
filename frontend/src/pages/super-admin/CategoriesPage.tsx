import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography, TextField, Stack } from '@mui/material';
import { useDispatch } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/superAdmin.service';
import type { Category, CategoryRequest } from '@/services/types';
import { DataTable, FormModal, ConfirmDialog, EmptyState } from '@/components/common';
import type { Column } from '@/components/common';
import { pushToast } from '@/store/slices/uiSlice';
import type { AppDispatch } from '@/store';

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const { data: categories = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.categories, queryFn: getCategories });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });

  const createMutation = useMutation({
    mutationFn: (req: CategoryRequest) => createCategory(req),
    onSuccess: () => { dispatch(pushToast({ severity: 'success', message: 'Category created' })); invalidate(); setCreateOpen(false); },
    onError: (e: unknown) => dispatch(pushToast({ severity: 'error', message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create category' })),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: CategoryRequest }) => updateCategory(id, req),
    onSuccess: () => { dispatch(pushToast({ severity: 'success', message: 'Category updated' })); invalidate(); setEditItem(null); },
    onError: (e: unknown) => dispatch(pushToast({ severity: 'error', message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update category' })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => { dispatch(pushToast({ severity: 'success', message: 'Category deleted' })); invalidate(); setDeleteItem(null); },
    onError: (e: unknown) => dispatch(pushToast({ severity: 'error', message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete category' })),
  });

  const columns: Column<Category>[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'description', label: 'Description' },
    { id: 'tenantCount', label: 'Tenants Count', align: 'right' },
    {
      id: 'actions', label: 'Actions',
      render: (_: unknown, row: Category) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => { setEditItem(row); setFormName(row.name); setFormDesc(row.description); }}>Edit</Button>
          <Button size="small" color="error" onClick={() => setDeleteItem(row)}>Delete</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Categories</Typography>
        <Button variant="contained" onClick={() => { setFormName(''); setFormDesc(''); setCreateOpen(true); }}>Create Category</Button>
      </Stack>

      <DataTable
        columns={columns} rows={categories} keyField="id" loading={isLoading}
        emptyStateNode={<EmptyState title="No categories yet" description="Create your first category to organize tenants" action={<Button variant="contained" onClick={() => setCreateOpen(true)}>Create Category</Button>} />}
      />

      <FormModal open={createOpen} title="Create Category" onClose={() => setCreateOpen(false)} loading={createMutation.isPending}>
        <TextField fullWidth label="Name" value={formName} onChange={e => setFormName(e.target.value)} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Description" value={formDesc} onChange={e => setFormDesc(e.target.value)} multiline rows={3} />
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate({ name: formName, description: formDesc })} disabled={!formName.trim()}>Create</Button>
        </Stack>
      </FormModal>

      <FormModal open={!!editItem} title="Edit Category" onClose={() => setEditItem(null)} loading={updateMutation.isPending}>
        <TextField fullWidth label="Name" value={formName} onChange={e => setFormName(e.target.value)} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Description" value={formDesc} onChange={e => setFormDesc(e.target.value)} multiline rows={3} />
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => editItem && updateMutation.mutate({ id: editItem.id, req: { name: formName, description: formDesc } })} disabled={!formName.trim()}>Save</Button>
        </Stack>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} title="Delete Category" message={`Are you sure you want to delete "${deleteItem?.name}"?`} confirmColor="error"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} onCancel={() => setDeleteItem(null)} loading={deleteMutation.isPending} />
    </Box>
  );
}
