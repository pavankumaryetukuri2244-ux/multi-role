import { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, Stack, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable } from '@/components/common';
import type { Column } from '@/components/common';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { getUserOrders } from '@/services/product.service';
import type { Order } from '@/services/types/product.types';

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await getUserOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError('Failed to load your order history.');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filtered = orders.filter(o => 
    o.product.name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toString().includes(search)
  );

  const columns: Column<Order>[] = [
    { id: 'id', label: 'Order ID', render: (_: unknown, row: Order) => `#ORD-${row.id}`, sortable: true },
    { id: 'productName', label: 'Product', render: (_: unknown, row: Order) => row.product.name, sortable: true },
    { id: 'price', label: 'Unit Price', render: (_: unknown, row: Order) => formatCurrency(row.product.price) },
    { id: 'quantity', label: 'Quantity', render: (_: unknown, row: Order) => row.quantity, align: 'right' },
    { id: 'totalPrice', label: 'Total', render: (_: unknown, row: Order) => formatCurrency(row.totalPrice), align: 'right' },
    { id: 'orderDate', label: 'Purchase Date', render: (_: unknown, row: Order) => formatDate(row.orderDate), sortable: true },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>My Orders</Typography>
        <TextField size="small" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={filtered} keyField="id" />
      )}
    </Box>
  );
}
