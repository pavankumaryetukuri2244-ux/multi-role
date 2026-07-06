<<<<<<< Updated upstream
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, TextField, Chip, CircularProgress, Alert, Snackbar } from '@mui/material';
import { DataTable, FormModal, ConfirmDialog } from '@/components/common';
import type { Column } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/services/product.service';
import type { Product } from '@/services/types/product.types';

const INITIAL_FORM = { name: '', price: 0, description: '', stock: 0 };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
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
      setToast({ open: true, message: 'Product created successfully!', severity: 'success' });
      setCreateOpen(false);
      setForm(INITIAL_FORM);
      loadProducts();
    } catch (err) {
      console.error(err);
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
      setToast({ open: true, message: 'Product updated successfully!', severity: 'success' });
      setEditItem(null);
      setForm(INITIAL_FORM);
      loadProducts();
    } catch (err) {
      console.error(err);
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
      setToast({ open: true, message: 'Product deleted successfully!', severity: 'success' });
      setDeleteItem(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Failed to delete product.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Product>[] = [
    { id: 'id', label: 'ID', render: (_: unknown, row: Product) => `#${row.id}`, sortable: true },
    { id: 'name', label: 'Product Name', sortable: true },
    { id: 'description', label: 'Description', render: (_: unknown, row: Product) => row.description || '-' },
    { id: 'price', label: 'Price', render: (_: unknown, row: Product) => formatCurrency(row.price), align: 'right' },
    { id: 'stock', label: 'Stock', align: 'right', render: (_: unknown, row: Product) => <Chip label={row.stock} color={row.stock === 0 ? 'error' : row.stock < 10 ? 'warning' : 'success'} size="small" /> },
    {
      id: 'actions', label: 'Actions',
      render: (_: unknown, row: Product) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => {
            setEditItem(row);
            setForm({ name: row.name, price: row.price, description: row.description || '', stock: row.stock });
          }}>Edit</Button>
          <Button size="small" color="error" onClick={() => setDeleteItem(row)}>Delete</Button>
        </Stack>
      ),
    },
  ];
=======
import { useState } from 'react';
import {
  Box, Button, Typography, Stack, TextField,
  Chip, InputAdornment, Grid2,
  Card, CardContent, CardActions,
  Divider, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { FormModal, ConfirmDialog, EmptyState } from '@/components/common';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  offer: number;
  imageUrl: string;
  category: string;
  stock: number;
}

type FormState = Omit<Product, 'id'>;
type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  name: '', description: '', price: 0,
  offer: 0, imageUrl: '', category: '', stock: 0,
};

function finalPrice(price: number, offer: number) {
  return offer > 0 ? price - (price * offer) / 100 : price;
}

// ─── Form fields (plain function, NOT a React component) ──────────────────────

function renderForm(
  form: FormState,
  errors: FormErrors,
  onChange: (key: keyof FormState, value: string | number) => void,
) {
  const dp = form.offer > 0 && form.price > 0 ? finalPrice(form.price, form.offer) : null;

  return (
    <Stack spacing={2.5}>
      {/* Section: Basic Info */}
      <Box>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
          Basic Information
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth label="Product Name" required
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            error={Boolean(errors.name)} helperText={errors.name ?? 'Enter a clear product name (e.g. Men\'s Running Shoes)'}
          />
          <TextField
            fullWidth label="Description" multiline rows={2}
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
            placeholder="Describe key features, material, size, etc."
          />
          <TextField
            fullWidth label="Category" required
            value={form.category}
            onChange={e => onChange('category', e.target.value)}
            error={Boolean(errors.category)} helperText={errors.category ?? 'e.g. Footwear, Electronics, Clothing'}
          />
        </Stack>
      </Box>

      <Divider />

      {/* Section: Image */}
      <Box>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
          Product Image
        </Typography>
        <TextField
          fullWidth label="Image URL"
          value={form.imageUrl}
          onChange={e => onChange('imageUrl', e.target.value)}
          placeholder="https://example.com/product.jpg"
          helperText="Paste a direct image link. Leave blank to use a placeholder."
          InputProps={{
            startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small" color="action" /></InputAdornment>,
          }}
        />
        {form.imageUrl && (
          <Box sx={{ mt: 1.5, width: '100%', height: 120, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <img
              src={form.imageUrl}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Section: Pricing & Stock */}
      <Box>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
          Pricing & Stock
        </Typography>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Price (₹)" type="number" required
              value={form.price || ''}
              onChange={e => onChange('price', parseFloat(e.target.value) || 0)}
              error={Boolean(errors.price)} helperText={errors.price ?? 'MRP / selling price'}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              inputProps={{ min: 0, step: '1' }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Discount" type="number"
              value={form.offer || ''}
              onChange={e => onChange('offer', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              helperText={errors.offer ?? '0 = no discount'}
              error={Boolean(errors.offer)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Stock Qty" type="number"
              value={form.stock}
              onChange={e => onChange('stock', Math.max(0, parseInt(e.target.value) || 0))}
              helperText="Units available"
              inputProps={{ min: 0 }}
            />
          </Grid2>
        </Grid2>

        {/* Live price preview */}
        {dp !== null && (
          <Stack direction="row" spacing={1.5} alignItems="center" mt={1.5}
            sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 1.5, px: 2, py: 1 }}>
            <LocalOfferIcon fontSize="small" sx={{ color: '#16a34a' }} />
            <Typography variant="body2" color="text.secondary">Customer pays:</Typography>
            <Typography variant="body2" fontWeight={700} color="#16a34a">₹{dp.toFixed(2)}</Typography>
            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>₹{form.price.toFixed(2)}</Typography>
            <Chip label={`${form.offer}% OFF`} color="error" size="small" sx={{ fontWeight: 700 }} />
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dp = finalPrice(product.price, product.offer);
  const hasDiscount = product.offer > 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  return (
    <Card elevation={0} sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.10)' },
    }}>
      {/* Image — 16:9 rectangle */}
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#f3f4f6', overflow: 'hidden' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon sx={{ fontSize: 36, color: '#d1d5db' }} />
          </Box>
        )}
        {/* Discount badge */}
        {hasDiscount && (
          <Chip
            label={`${product.offer}% OFF`}
            size="small"
            sx={{
              position: 'absolute', top: 8, left: 8,
              bgcolor: '#ef4444', color: '#fff',
              fontWeight: 700, fontSize: '0.7rem',
              borderRadius: 1,
            }}
          />
        )}
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <Box sx={{
            position: 'absolute', inset: 0,
            bgcolor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', letterSpacing: 1, textTransform: 'uppercase' }}>
              Out of Stock
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ px: 2, pt: 1.5, pb: 1, flex: 1 }}>
        {/* Category */}
        <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
          {product.category}
        </Typography>

        {/* Name */}
        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.25, mb: 0.5, lineHeight: 1.3, fontSize: '0.95rem' }} noWrap>
          {product.name}
        </Typography>

        {/* Description */}
        {product.description && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.description}
          </Typography>
        )}

        {/* Price row */}
        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
          <Typography variant="h6" fontWeight={700} color={hasDiscount ? '#16a34a' : 'text.primary'} sx={{ fontSize: '1rem' }}>
            ₹{dp.toFixed(2)}
          </Typography>
          {hasDiscount && (
            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
              ₹{product.price.toFixed(2)}
            </Typography>
          )}
        </Stack>

        {/* Stock */}
        <Typography variant="caption" mt={0.25} sx={{ display: 'block' }}
          color={isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'success.main'}>
          {isOutOfStock ? '✕ Out of stock' : isLowStock ? `⚠ Only ${product.stock} left` : `✓ ${product.stock} in stock`}
        </Typography>
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 2, py: 0.75, justifyContent: 'flex-end' }}>
        <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={onEdit}
          sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}>Edit</Button>
        <Button size="small" startIcon={<DeleteIcon fontSize="small" />} color="error" onClick={onDelete}
          sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}>Delete</Button>
      </CardActions>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});

  const onChange = (key: keyof FormState, value: string | number) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (form.price <= 0) e.price = 'Price must be greater than 0';
    if (form.offer < 0 || form.offer > 100) e.offer = 'Must be 0–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setForm(EMPTY); setErrors({}); setCreateOpen(true); };

  const handleCreate = () => {
    if (!validate()) return;
    setProducts(p => [...p, { ...form, id: Date.now() }]);
    setCreateOpen(false);
  };

  const handleCreateAndAnother = () => {
    if (!validate()) return;
    setProducts(p => [...p, { ...form, id: Date.now() }]);
    setForm(EMPTY);
    setErrors({});
  };

  const openEdit = (product: Product) => {
    const { id: _id, ...rest } = product;
    setEditItem(product);
    setForm(rest);
    setErrors({});
  };

  const handleEdit = () => {
    if (!validate()) return;
    setProducts(p => p.map(x => x.id === editItem!.id ? { ...x, ...form } : x));
    setEditItem(null);
  };
>>>>>>> Stashed changes

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
<<<<<<< Updated upstream
        <Typography variant="h4" fontWeight={700}>Products</Typography>
        <Button variant="contained" onClick={() => { setForm(INITIAL_FORM); setCreateOpen(true); }}>Add Product</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={products} keyField="id" />
      )}

      {/* Add Product Modal */}
      <FormModal open={createOpen} title="Add Product" onClose={() => !actionLoading && setCreateOpen(false)}>
        <TextField fullWidth label="Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} sx={{mb:2}} required />
        <TextField fullWidth label="Description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} sx={{mb:2}} multiline rows={2} />
        <TextField fullWidth label="Price" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} sx={{mb:2}} required slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
        <TextField fullWidth label="Stock" type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:parseInt(e.target.value)||0}))} sx={{mb:2}} required slotProps={{ htmlInput: { min: 0 } }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCreateOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={16} /> : 'Add'}
=======
        <Box>
          <Typography variant="h5" fontWeight={700}>Products</Typography>
          <Typography variant="body2" color="text.secondary">
            {products.length} product{products.length !== 1 ? 's' : ''} in your catalogue
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ borderRadius: 2, fontWeight: 600, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', px: 2.5 }}
        >
          Add Product
        </Button>
      </Stack>

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add products to your store with images, pricing, and discount offers."
          action={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add First Product</Button>}
        />
      ) : (
        <Grid2 container spacing={2.5}>
          {products.map(product => (
            <Grid2 key={product.id} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
              <ProductCard
                product={product}
                onEdit={() => openEdit(product)}
                onDelete={() => setDeleteItem(product)}
              />
            </Grid2>
          ))}

          {/* Add more tile */}
          <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
            <Paper
              variant="outlined"
              onClick={openCreate}
              sx={{
                height: '100%', minHeight: 220, borderRadius: 2,
                borderStyle: 'dashed', borderColor: 'divider',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': { borderColor: '#6366F1', bgcolor: '#f5f3ff' },
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AddIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Add Product</Typography>
              </Stack>
            </Paper>
          </Grid2>
        </Grid2>
      )}

      {/* Create Modal */}
      <FormModal open={createOpen} title="Add New Product" onClose={() => setCreateOpen(false)}>
        {renderForm(form, errors, onChange)}
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="outlined" onClick={handleCreateAndAnother}
            sx={{ textTransform: 'none', borderColor: '#6366F1', color: '#6366F1' }}>
            Save &amp; Add Another
          </Button>
          <Button variant="contained" onClick={handleCreate}
            sx={{ textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
            Save Product
>>>>>>> Stashed changes
          </Button>
        </Stack>
      </FormModal>

<<<<<<< Updated upstream
      {/* Edit Product Modal */}
      <FormModal open={!!editItem} title="Edit Product" onClose={() => !actionLoading && setEditItem(null)}>
        <TextField fullWidth label="Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} sx={{mb:2}} required />
        <TextField fullWidth label="Description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} sx={{mb:2}} multiline rows={2} />
        <TextField fullWidth label="Price" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} sx={{mb:2}} required slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
        <TextField fullWidth label="Stock" type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:parseInt(e.target.value)||0}))} sx={{mb:2}} required slotProps={{ htmlInput: { min: 0 } }} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setEditItem(null)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={16} /> : 'Save'}
=======
      {/* Edit Modal */}
      <FormModal open={!!editItem} title="Edit Product" onClose={() => setEditItem(null)}>
        {renderForm(form, errors, onChange)}
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
          <Button onClick={() => setEditItem(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}
            sx={{ textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
            Save Changes
>>>>>>> Stashed changes
          </Button>
        </Stack>
      </FormModal>

<<<<<<< Updated upstream
      {/* Delete Confirm Modal */}
      <ConfirmDialog open={!!deleteItem} title="Delete Product" message={`Delete "${deleteItem?.name}"? This action cannot be undone.`} confirmColor="error"
        onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} />

      {/* Toast Notification */}
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
=======
      {/* Delete */}
      <ConfirmDialog
        open={!!deleteItem} title="Remove Product"
        message={`Remove "${deleteItem?.name}" from your catalogue?`}
        confirmColor="error"
        onConfirm={() => { setProducts(p => p.filter(x => x.id !== deleteItem!.id)); setDeleteItem(null); }}
        onCancel={() => setDeleteItem(null)}
      />
>>>>>>> Stashed changes
    </Box>
  );
}
