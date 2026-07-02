import { useState } from 'react';
import { Box, Typography, Stack, Chip, Drawer, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable, StatusBadge } from '@/components/common';
import type { Column } from '@/components/common';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface Order { id: number; orderNumber: string; customer: string; total: number; status: string; date: string; items: number; }

const MOCK_ORDERS: Order[] = [
  { id: 1, orderNumber: 'ORD-001', customer: 'Alice Johnson', total: 149.99, status: 'completed', date: new Date(Date.now()-86400000).toISOString(), items: 3 },
  { id: 2, orderNumber: 'ORD-002', customer: 'Bob Smith', total: 89.50, status: 'pending', date: new Date(Date.now()-3600000).toISOString(), items: 2 },
  { id: 3, orderNumber: 'ORD-003', customer: 'Carol White', total: 220.00, status: 'active', date: new Date(Date.now()-7200000).toISOString(), items: 5 },
  { id: 4, orderNumber: 'ORD-004', customer: 'Dave Brown', total: 55.75, status: 'inactive', date: new Date(Date.now()-172800000).toISOString(), items: 1 },
  { id: 5, orderNumber: 'ORD-005', customer: 'Eve Davis', total: 399.99, status: 'completed', date: new Date(Date.now()-259200000).toISOString(), items: 7 },
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  const filtered = MOCK_ORDERS.filter(o =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Order>[] = [
    { id: 'orderNumber', label: 'Order #', sortable: true },
    { id: 'customer', label: 'Customer', sortable: true },
    { id: 'total', label: 'Total', render: (_: unknown, row: Order) => formatCurrency(row.total), align: 'right' },
    { id: 'status', label: 'Status', render: (_: unknown, row: Order) => <StatusBadge status={row.status} /> },
    { id: 'date', label: 'Date', render: (_: unknown, row: Order) => formatDate(row.date) },
    { id: 'actions', label: '', render: (_: unknown, row: Order) => <Chip label="View" size="small" onClick={() => setDrawerOrder(row)} clickable /> },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={700}>Orders</Typography>
          <Chip label="Demo Data" color="warning" size="small" variant="outlined" />
        </Stack>
        <TextField size="small" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
      </Stack>
      <DataTable columns={columns} rows={filtered} keyField="id" />
      <Drawer anchor="right" open={!!drawerOrder} onClose={() => setDrawerOrder(null)}>
        <Box sx={{ width: 360, p: 3 }}>
          <Typography variant="h6" mb={2}>{drawerOrder?.orderNumber}</Typography>
          <Typography><strong>Customer:</strong> {drawerOrder?.customer}</Typography>
          <Typography><strong>Total:</strong> {drawerOrder ? formatCurrency(drawerOrder.total) : ''}</Typography>
          <Typography><strong>Items:</strong> {drawerOrder?.items}</Typography>
          <Typography><strong>Status:</strong> {drawerOrder?.status}</Typography>
          <Typography><strong>Date:</strong> {drawerOrder ? formatDate(drawerOrder.date) : ''}</Typography>
        </Box>
      </Drawer>
    </Box>
  );
}
