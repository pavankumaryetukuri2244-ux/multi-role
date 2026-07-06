import { useMemo } from 'react';

import { Box, Typography, Chip, Skeleton, Stack } from '@mui/material';
import { DataTable, EmptyState } from '@/components/common';
import type { Column } from '@/components/common';

import { formatDate } from '@/utils/formatters';

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  description: string;
}

const ACTION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  APPROVE: 'warning',
};

export default function AuditLogsPage() {
  const isLoading = false;

  // We currently do not have a real Audit Log API. 
  // Returning an empty array until the backend endpoint is implemented.
  const auditEvents = useMemo<AuditEvent[]>(() => {
    return [];
  }, []);

  const columns: Column<AuditEvent>[] = [
    { id: 'timestamp', label: 'Timestamp', render: (_: unknown, row: AuditEvent) => formatDate(row.timestamp), minWidth: 140 },
    {
      id: 'action', label: 'Action', minWidth: 100,
      render: (_: unknown, row: AuditEvent) => (
        <Chip
          label={row.action}
          color={ACTION_COLORS[row.action] ?? 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    { id: 'entity', label: 'Entity', minWidth: 120 },
    { id: 'description', label: 'Description' },
  ];

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} mb={3}>Audit Logs</Typography>
        <Stack spacing={1}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={48} variant="rectangular" sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Audit Logs</Typography>
      <DataTable
        columns={columns}
        rows={auditEvents}
        keyField="id"
        emptyStateNode={
          <EmptyState
            title="No activity yet"
            description="Audit logs will appear here as you create admins, categories, and subscription plans."
          />
        }
      />
    </Box>
  );
}
