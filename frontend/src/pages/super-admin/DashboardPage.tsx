import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Stack, Button, Card, CardContent, 
  Grid2, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import type { RootState } from '@/store';
import { ROUTES } from '@/constants/routes';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getAdmins, getCategories, getAnalytics } from '@/services/superAdmin.service';
import { SkeletonLoader } from '@/components/common';

const R = ROUTES.SUPER_ADMIN;

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { firstName, lastName } = useSelector((state: RootState) => state.auth);
  const displayName = firstName ? `${firstName}${lastName ? ' ' + lastName : ''}` : 'Super Admin';

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: admins = [], isLoading: loadingAdmins } = useQuery({
    queryKey: QUERY_KEYS.admins,
    queryFn: getAdmins,
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories,
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: QUERY_KEYS.superAdminAnalytics,
    queryFn: getAnalytics,
  });

  // ── Derived Data ─────────────────────────────────────────────────────────────
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.active).length;
  const inactiveAdmins = admins.filter(a => !a.active).length;
  const totalCategories = categories.length;

  // Last 5 recently added admins (assuming ID order corresponds to creation)
  const recentAdmins = [...admins].sort((a, b) => b.id - a.id).slice(0, 5);

  const metrics = [
    { label: 'Total Admins', value: totalAdmins, color: '#6366F1' },
    { label: 'Active Admins', value: activeAdmins, color: '#10B981' },
    { label: 'Inactive Admins', value: inactiveAdmins, color: '#EF4444' },
    { label: 'Total Categories', value: totalCategories, color: '#F59E0B' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none', pb: 4 }}>
      {/* Welcome header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5} sx={{ color: '#111827' }}>
            Welcome, {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's what's happening across your platform today.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(R.ADMINS)}
          sx={{ borderRadius: 2, fontWeight: 600, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}
        >
          Add Admin
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid2 container spacing={3} mb={4}>
        {metrics.map(stat => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  {stat.label}
                </Typography>
                {loadingAdmins || loadingCategories ? (
                  <SkeletonLoader variant="text" width={40} height={40} />
                ) : (
                  <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <Grid2 container spacing={3}>
        {/* Main Content: Chart & Recent Admins */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Analytics Chart */}
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={3}>Platform Revenue</Typography>
                {loadingAnalytics ? (
                  <SkeletonLoader variant="rectangular" height={280} />
                ) : (
                  <Box sx={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <LineChart data={analytics?.revenueOverTime ?? []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        />
                        <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Recent Admins Table */}
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Recent Admins</Typography>
                  <Button size="small" sx={{ color: '#6366F1', fontWeight: 600 }} onClick={() => navigate(R.ADMINS)}>
                    View All
                  </Button>
                </Stack>
                {loadingAdmins ? (
                  <SkeletonLoader variant="rectangular" height={200} />
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentAdmins.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                              No admins found
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentAdmins.map((admin) => (
                            <TableRow key={admin.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" fontWeight={500}>{admin.firstName} {admin.lastName}</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{admin.email}</TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Chip
                                  label={admin.active ? 'Active' : 'Inactive'}
                                  size="small"
                                  sx={{
                                    bgcolor: admin.active ? '#D1FAE5' : '#FEE2E2',
                                    color: admin.active ? '#065F46' : '#991B1B',
                                    fontWeight: 600,
                                    borderRadius: 1.5
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid2>

        {/* Sidebar: Quick Actions */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate(R.ADMINS)}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#6366F1', bgcolor: '#EEF2FF', color: '#6366F1' } }}
                >
                  Create New Admin
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<CategoryIcon />}
                  onClick={() => navigate(R.CATEGORIES)}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#6366F1', bgcolor: '#EEF2FF', color: '#6366F1' } }}
                >
                  Manage Categories
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<SubscriptionsIcon />}
                  onClick={() => navigate(R.SUBSCRIPTION_PLANS)}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#6366F1', bgcolor: '#EEF2FF', color: '#6366F1' } }}
                >
                  View Subscription Plans
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ListAltIcon />}
                  onClick={() => navigate(R.AUDIT_LOGS)}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#6366F1', bgcolor: '#EEF2FF', color: '#6366F1' } }}
                >
                  Review Audit Logs
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
