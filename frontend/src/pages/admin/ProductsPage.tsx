import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { ConfirmDialog, DataTable, FormModal } from '@/components/common';
import type { Column } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { createAdminProduct, deleteAdminProduct, getAdminProducts, updateAdminProduct } from '@/services/product.service';
import type { Product } from '@/services/types/product.types';

type ProductForm = Pick<Product, 'name' | 'description' | 'price' | 'stock'>;

const INITIAL_FORM: ProductForm = { name: '', description: '', price: 0, stock: 0 };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load products', err);
      setError('Could not load products. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setCreateOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditItem(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
    });
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      setActionLoading(true);
      await createAdminProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setToast({ open: true, message: 'Product created successfully.', severity: 'success' });
      setCreateOpen(false);
      setForm(INITIAL_FORM);
      await loadProducts();
    } catch (err) {
      console.error('Failed to create product', err);
      setToast({ open: true, message: 'Failed to create product.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem || !form.name.trim()) return;
    try {
      setActionLoading(true);
      await updateAdminProduct(editItem.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setToast({ open: true, message: 'Product updated successfully.', severity: 'success' });
      setEditItem(null);
      setForm(INITIAL_FORM);
      await loadProducts();
    } catch (err) {
      console.error('Failed to update product', err);
      setToast({ open: true, message: 'Failed to update product.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setActionLoading(true);
      await deleteAdminProduct(deleteItem.id);
      setToast({ open: true, message: 'Product deleted successfully.', severity: 'success' });
      setDeleteItem(null);
      await loadProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      setToast({ open: true, message: 'Failed to delete product.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Product>[] = [
    { id: 'id', label: 'ID', render: (_: unknown, row) => `#${row.id}`, sortable: true },
    { id: 'name', label: 'Product Name', sortable: true },
    { id: 'description', label: 'Description', render: (_: unknown, row) => row.description || '-' },
    { id: 'price', label: 'Price', render: (_: unknown, row) => formatCurrency(row.price), align: 'right' },
    {
      id: 'stock',
      label: 'Stock',
      align: 'right',
      render: (_: unknown, row) => (
        <Chip label={row.stock} color={row.stock === 0 ? 'error' : row.stock < 10 ? 'warning' : 'success'} size="small" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_: unknown, row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => setDeleteItem(row)}>Delete</Button>
        </Stack>
      ),
    },
  ];

  const formFields = (
    <>
      <TextField fullWidth label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} sx={{ mb: 2 }} required />
      <TextField fullWidth label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} sx={{ mb: 2 }} multiline rows={2} />
      <TextField fullWidth label="Price" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} sx={{ mb: 2 }} required slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
      <TextField fullWidth label="Stock" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value, 10) || 0 }))} sx={{ mb: 2 }} required slotProps={{ htmlInput: { min: 0 } }} />
    </>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Products</Typography>
        <Button variant="contained" onClick={openCreate}>Add Product</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={products} keyField="id" />
      )}

      <FormModal open={createOpen} title="Add Product" onClose={() => !actionLoading && setCreateOpen(false)} loading={actionLoading}>
        {formFields}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCreateOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={16} /> : 'Add'}
          </Button>
        </Stack>
      </FormModal>

      <FormModal open={!!editItem} title="Edit Product" onClose={() => !actionLoading && setEditItem(null)} loading={actionLoading}>
        {formFields}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setEditItem(null)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={16} /> : 'Save'}
          </Button>
        </Stack>
      </FormModal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Product"
        message={`Delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast(p => ({ ...p, open: false }))} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
