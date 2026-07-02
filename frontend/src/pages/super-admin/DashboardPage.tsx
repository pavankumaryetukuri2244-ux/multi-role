import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid2, Typography, Card, CardContent, Alert, List,
  ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getAnalytics } from '@/services/superAdmin.service';
import { KpiCard, SkeletonLoader } from '@/components/common';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { formatRelativeTime } from '@/utils/formatters';

const COLORS = ['#6366F1', '#EC4899', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'];

const MOCK_EVENTS = [
  { id: 1, message: 'Admin john@example.com created', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, message: 'Tenant restaurant.platform.com approved', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, message: 'Subscription plan changed to Pro', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 4, message: 'New admin registration pending review', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 5, message: 'Category "Restaurant" created', createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: 6, message: 'Admin jane@example.com activated', createdAt: new Date(Date.now() - 21600000).toISOString() },
  { id: 7, message: 'Tenant clothes.platform.com onboarded', createdAt: new Date(Date.now() - 25200000).toISOString() },
  { id: 8, message: 'Platform settings updated', createdAt: new Date(Date.now() - 28800000).toISOString() },
  { id: 9, message: 'New subscription plan "Enterprise" added', createdAt: new Date(Date.now() - 32400000).toISOString() },
  { id: 10, message: 'User limit reached for tenant sweets.platform.com', createdAt: new Date(Date.now() - 36000000).toISOString() },
];

export default function SuperAdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.superAdminAnalytics, queryFn: getAnalytics });
  const { isHealthy } = usePlatformHealth();

  const kpiCards = [
    { title: 'Total Tenants', value: data?.totalTenants ?? 0, icon: <BusinessIcon />, color: '#6366F1' },
    { title: 'Total Admins', value: data?.totalAdmins ?? 0, icon: <PeopleIcon />, color: '#EC4899' },
    { title: 'Total Users', value: data?.totalUsers ?? 0, icon: <PersonIcon />, color: '#22C55E' },
    { title: 'Monthly Revenue', value: data?.monthlyRevenue ?? 0, icon: <AttachMoneyIcon />, color: '#F59E0B', prefix: '$' },
    { title: 'Active Subscriptions', value: data?.activeSubscriptions ?? 0, icon: <SubscriptionsIcon />, color: '#3B82F6' },
    { title: 'New Registrations', value: data?.newRegistrationsThisMonth ?? 0, icon: <TrendingUpIcon />, color: '#8B5CF6' },
  ];

  return (
    <Box>
      {!isHealthy && (
        <Alert severity="error" sx={{ mb: 2 }}>Platform is experiencing issues. Some services may be unavailable.</Alert>
      )}
      <Typography variant="h4" fontWeight={700} mb={3}>Dashboard</Typography>

      {/* KPI Cards */}
      <Grid2 container spacing={3} mb={4}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <SkeletonLoader variant="card" />
              </Grid2>
            ))
          : kpiCards.map((card) => (
              <Grid2 key={card.title} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <KpiCard {...card} loading={isLoading} />
              </Grid2>
            ))}
      </Grid2>

      {/* Charts */}
      <Grid2 container spacing={3} mb={4}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Revenue Analytics</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.revenueOverTime ?? []}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis />
                  <Tooltip /><Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Tenant Growth</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.tenantGrowthPerMonth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis />
                  <Tooltip /><Bar dataKey="value" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Category Distribution</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data?.categoryDistribution ?? []} dataKey="value" nameKey="name" outerRadius={100} label>
                    {(data?.categoryDistribution ?? []).map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>User Growth</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data?.userGrowthOverTime ?? []}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis />
                  <Tooltip /><Area type="monotone" dataKey="value" stroke="#22C55E" fill="#22C55E33" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
      </Grid2>

      {/* Activity Feed + Status Monitor */}
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Activity Feed</Typography>
            <List dense>
              {MOCK_EVENTS.map((event) => (
                <ListItem key={event.id} divider>
                  <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}><TrendingUpIcon sx={{ fontSize: 16 }} /></Avatar></ListItemAvatar>
                  <ListItemText primary={event.message} secondary={formatRelativeTime(event.createdAt)} />
                </ListItem>
              ))}
            </List>
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Platform Status</Typography>
            {isHealthy
              ? <Chip icon={<CheckCircleIcon />} label="All Systems Operational" color="success" variant="outlined" />
              : <Chip icon={<ErrorIcon />} label="Systems Degraded" color="error" variant="outlined" />}
          </CardContent></Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
