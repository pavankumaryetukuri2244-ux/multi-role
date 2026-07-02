import { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Chip, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable, StatusBadge } from '@/components/common';
import type { Column } from '@/components/common';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface UserOrder { id: number; orderNumber: string; total: number; status: string; date: string; items: number; }
const MOCK: UserOrder[] = [
  { id: 1, orderNumber: 'ORD-101', total: 89.99, status: 'completed', date: new Date(Date.now()-86400000*2).toISOString(), items: 2 },
  { id: 2, orderNumber: 'ORD-102', total: 124.50, status: 'active', date: new Date(Date.now()-86400000).toISOString(), items: 3 },
  { id: 3, orderNumber: 'ORD-103', total: 45.00, status: 'pending', date: new Date().toISOString(), items: 1 },
];

export default function PortalOrdersPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK.filter(o => o.orderNumber.toLowerCase().includes(search.toLowerCase()));
  const columns: Column<UserOrder>[] = [
    { id: 'orderNumber', label: 'Order #' },
    { id: 'total', label: 'Total', render: (_: unknown, r: UserOrder) => formatCurrency(r.total) },
    { id: 'status', label: 'Status', render: (_: unknown, r: UserOrder) => <StatusBadge status={r.status} /> },
    { id: 'date', label: 'Date', render: (_: unknown, r: UserOrder) => formatDate(r.date) },
    { id: 'items', label: 'Items', align: 'right' },
  ];
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>My Orders</Typography>
        <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
      </Stack>
      <DataTable columns={columns} rows={filtered} keyField="id" />
    </Box>
  );
}
