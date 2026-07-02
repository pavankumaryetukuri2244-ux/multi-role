import { useState } from 'react';
import { Box, Button, Typography, Stack, TextField, Chip } from '@mui/material';
import { DataTable, FormModal, ConfirmDialog } from '@/components/common';
import type { Column } from '@/components/common';

interface Product { id: number; name: string; price: number; category: string; stock: number; }

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Product Alpha', price: 29.99, category: 'Electronics', stock: 150 },
  { id: 2, name: 'Product Beta', price: 49.99, category: 'Clothing', stock: 80 },
  { id: 3, name: 'Product Gamma', price: 19.99, category: 'Food', stock: 320 },
  { id: 4, name: 'Product Delta', price: 99.99, category: 'Electronics', stock: 45 },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, category: '', stock: 0 });

  const columns: Column<Product>[] = [
    { id: 'name', label: 'Product Name', sortable: true },
    { id: 'price', label: 'Price', render: (_: unknown, row: Product) => `$${row.price.toFixed(2)}`, align: 'right' },
    { id: 'category', label: 'Category' },
    { id: 'stock', label: 'Stock', align: 'right', render: (_: unknown, row: Product) => <Chip label={row.stock} color={row.stock < 50 ? 'warning' : 'success'} size="small" /> },
    {
      id: 'actions', label: 'Actions',
      render: (_: unknown, row: Product) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => { setEditItem(row); setForm({ name: row.name, price: row.price, category: row.category, stock: row.stock }); }}>Edit</Button>
          <Button size="small" color="error" onClick={() => setDeleteItem(row)}>Delete</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={700}>Products</Typography>
          <Chip label="Demo Data" color="warning" size="small" variant="outlined" />
        </Stack>
        <Button variant="contained" onClick={() => { setForm({ name:'',price:0,category:'',stock:0 }); setCreateOpen(true); }}>Add Product</Button>
      </Stack>
      <DataTable columns={columns} rows={products} keyField="id" />

      <FormModal open={createOpen} title="Add Product" onClose={() => setCreateOpen(false)}>
        <TextField fullWidth label="Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} sx={{mb:2}} />
        <TextField fullWidth label="Price" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} sx={{mb:2}} />
        <TextField fullWidth label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} sx={{mb:2}} />
        <TextField fullWidth label="Stock" type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:parseInt(e.target.value)||0}))} sx={{mb:2}} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setProducts(p => [...p, { ...form, id: Date.now() }]); setCreateOpen(false); }}>Add</Button>
        </Stack>
      </FormModal>

      <FormModal open={!!editItem} title="Edit Product" onClose={() => setEditItem(null)}>
        <TextField fullWidth label="Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} sx={{mb:2}} />
        <TextField fullWidth label="Price" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)||0}))} sx={{mb:2}} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setProducts(p => p.map(x => x.id === editItem?.id ? { ...x, ...form } : x)); setEditItem(null); }}>Save</Button>
        </Stack>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} title="Delete Product" message={`Delete "${deleteItem?.name}"?`} confirmColor="error"
        onConfirm={() => { setProducts(p => p.filter(x => x.id !== deleteItem?.id)); setDeleteItem(null); }} onCancel={() => setDeleteItem(null)} />
    </Box>
  );
}
