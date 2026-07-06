import { Box, Typography, Stack, Chip } from '@mui/material';
import { DataTable } from '@/components/common';
import type { Column } from '@/components/common';

interface InventoryItem { id: number; name: string; sku: string; stock: number; reorderLevel: number; location: string; }

const MOCK_INVENTORY: InventoryItem[] = [];

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
        <Chip label={`${MOCK_INVENTORY.filter(i => i.stock <= i.reorderLevel).length} Low Stock`} color="error" size="small" />
      </Stack>
      <DataTable columns={columns} rows={MOCK_INVENTORY} keyField="id" />
    </Box>
  );
}
