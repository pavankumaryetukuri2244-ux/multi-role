import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Chip, Drawer, TextField, InputAdornment, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable } from '@/components/common';
import type { Column } from '@/components/common';
import { formatDate, formatCurrency } from '@/utils/formatters';
<<<<<<< Updated upstream
import { getAdminOrders } from '@/services/product.service';
import type { Order } from '@/services/types/product.types';
=======

interface Order { id: number; orderNumber: string; customer: string; total: number; status: string; date: string; items: number; }

const MOCK_ORDERS: Order[] = [];
>>>>>>> Stashed changes

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError('Could not load orders. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter(o => {
    const custName = o.user ? `${o.user.firstName} ${o.user.lastName}`.toLowerCase() : '';
    const prodName = o.product ? o.product.name.toLowerCase() : '';
    const email = o.user ? o.user.email.toLowerCase() : '';
    return custName.includes(search.toLowerCase()) || 
           prodName.includes(search.toLowerCase()) || 
           email.includes(search.toLowerCase()) || 
           o.id.toString().includes(search);
  });

  const columns: Column<Order>[] = [
    { id: 'id', label: 'Order #', render: (_: unknown, row: Order) => `#ORD-${row.id}`, sortable: true },
    { id: 'customer', label: 'Customer', render: (_: unknown, row: Order) => row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Guest', sortable: true },
    { id: 'product', label: 'Product Purchased', render: (_: unknown, row: Order) => row.product?.name || 'Unknown Product', sortable: true },
    { id: 'quantity', label: 'Quantity', render: (_: unknown, row: Order) => row.quantity, align: 'right' },
    { id: 'totalPrice', label: 'Total Price', render: (_: unknown, row: Order) => formatCurrency(row.totalPrice), align: 'right', sortable: true },
    { id: 'orderDate', label: 'Date Placed', render: (_: unknown, row: Order) => formatDate(row.orderDate), sortable: true },
    { id: 'actions', label: '', render: (_: unknown, row: Order) => <Chip label="Details" size="small" onClick={() => setDrawerOrder(row)} clickable /> },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
<<<<<<< Updated upstream
        <Typography variant="h4" fontWeight={700}>Orders</Typography>
=======
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={700}>Orders</Typography>
        </Stack>
>>>>>>> Stashed changes
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

      <Drawer anchor="right" open={!!drawerOrder} onClose={() => setDrawerOrder(null)}>
        {drawerOrder && (
          <Box sx={{ width: 360, p: 4 }}>
            <Typography variant="h5" fontWeight={700} mb={3}>Order Details</Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ORDER NUMBER</Typography>
            <Typography variant="body1" fontWeight={600} mb={3}>#ORD-{drawerOrder.id}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>CUSTOMER INFO</Typography>
            <Typography variant="body1" mb={0.5}>{drawerOrder.user ? `${drawerOrder.user.firstName} ${drawerOrder.user.lastName}` : 'N/A'}</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>{drawerOrder.user?.email}</Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ITEM DETAILS</Typography>
            <Typography variant="body1" mb={0.5}>{drawerOrder.product?.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Quantity: {drawerOrder.quantity} x {formatCurrency(drawerOrder.product?.price || 0)}</Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>TOTAL AMOUNT</Typography>
            <Typography variant="h5" color="primary" fontWeight={700} mb={3}>{formatCurrency(drawerOrder.totalPrice)}</Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>DATE PLACED</Typography>
            <Typography variant="body1">{formatDate(drawerOrder.orderDate)}</Typography>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
