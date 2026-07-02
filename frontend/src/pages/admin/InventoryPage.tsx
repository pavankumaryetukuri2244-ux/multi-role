import { Box, Typography, Stack, Chip } from '@mui/material';
import { DataTable } from '@/components/common';
import type { Column } from '@/components/common';

interface InventoryItem { id: number; name: string; sku: string; stock: number; reorderLevel: number; location: string; }

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Product Alpha', sku: 'SKU-001', stock: 150, reorderLevel: 20, location: 'Warehouse A' },
  { id: 2, name: 'Product Beta', sku: 'SKU-002', stock: 8, reorderLevel: 25, location: 'Warehouse B' },
  { id: 3, name: 'Product Gamma', sku: 'SKU-003', stock: 320, reorderLevel: 50, location: 'Warehouse A' },
  { id: 4, name: 'Product Delta', sku: 'SKU-004', stock: 12, reorderLevel: 30, location: 'Warehouse C' },
  { id: 5, name: 'Product Epsilon', sku: 'SKU-005', stock: 0, reorderLevel: 10, location: 'Warehouse B' },
];

const columns: Column<InventoryItem>[] = [
  { id: 'name', label: 'Product Name', sortable: true },
  { id: 'sku', label: 'SKU' },
  {
    id: 'stock', label: 'Stock Level',
    render: (_: unknown, row: InventoryItem) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography>{row.stock}</Typography>
        {row.stock <= row.reorderLevel && <Chip label="Low Stock" color="warning" size="small" />}
        {row.stock === 0 && <Chip label="Out of Stock" color="error" size="small" />}
      </Stack>
    ),
  },
  { id: 'reorderLevel', label: 'Reorder Level' },
  { id: 'location', label: 'Location' },
];

export default function AdminInventoryPage() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h4" fontWeight={700}>Inventory</Typography>
        <Chip label="Demo Data" color="warning" size="small" variant="outlined" />
        <Chip label={`${MOCK_INVENTORY.filter(i => i.stock <= i.reorderLevel).length} Low Stock`} color="error" size="small" />
      </Stack>
      <DataTable columns={columns} rows={MOCK_INVENTORY} keyField="id" />
    </Box>
  );
}
