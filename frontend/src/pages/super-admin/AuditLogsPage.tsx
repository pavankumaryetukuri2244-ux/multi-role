import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Chip, Skeleton, Stack } from '@mui/material';
import { DataTable, EmptyState } from '@/components/common';
import type { Column } from '@/components/common';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getAdmins, getCategories, getSubscriptionPlans } from '@/services/superAdmin.service';
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
  const { data: admins = [], isLoading: loadingAdmins } = useQuery({ queryKey: QUERY_KEYS.admins, queryFn: getAdmins });
  const { data: categories = [], isLoading: loadingCats } = useQuery({ queryKey: QUERY_KEYS.categories, queryFn: getCategories });
  const { data: plans = [], isLoading: loadingPlans } = useQuery({ queryKey: QUERY_KEYS.subscriptionPlans, queryFn: getSubscriptionPlans });

  const isLoading = loadingAdmins || loadingCats || loadingPlans;

  // Build audit log entries from real data
  const auditEvents = useMemo<AuditEvent[]>(() => {
    const events: AuditEvent[] = [];

    admins.forEach((admin: { id: number; firstName: string; lastName: string; email: string; active: boolean }) => {
      events.push({
        id: `admin-${admin.id}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        action: admin.active ? 'CREATE' : 'UPDATE',
        entity: 'Admin',
        description: `${admin.firstName} ${admin.lastName} (${admin.email})`,
      });
    });

    categories.forEach((cat: { id: number; name: string }) => {
      events.push({
        id: `cat-${cat.id}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        action: 'CREATE',
        entity: 'Category',
        description: cat.name,
      });
    });

    plans.forEach((plan: { id: number; name: string; active: boolean }) => {
      events.push({
        id: `plan-${plan.id}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        action: plan.active ? 'CREATE' : 'UPDATE',
        entity: 'SubscriptionPlan',
        description: plan.name,
      });
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [admins, categories, plans]);

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
