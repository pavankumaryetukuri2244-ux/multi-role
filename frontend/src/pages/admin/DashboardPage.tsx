import { useQuery } from '@tanstack/react-query';
import { Box, Grid2, Typography, Card, CardContent } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getTenantInfo } from '@/services/admin.service';
import { KpiCard, SkeletonLoader } from '@/components/common';

const MOCK_SALES = [
  { label: 'Jan', value: 4200 }, { label: 'Feb', value: 5800 }, { label: 'Mar', value: 4900 },
  { label: 'Apr', value: 7200 }, { label: 'May', value: 6100 }, { label: 'Jun', value: 8300 },
];
const MOCK_CUSTOMERS = [
  { label: 'Jan', value: 120 }, { label: 'Feb', value: 145 }, { label: 'Mar', value: 132 },
  { label: 'Apr', value: 178 }, { label: 'May', value: 165 }, { label: 'Jun', value: 210 },
];
const MOCK_PRODUCTS = [
  { label: 'Product A', value: 340 }, { label: 'Product B', value: 280 },
  { label: 'Product C', value: 190 }, { label: 'Product D', value: 410 },
];

function GrowthScore({ score }: { score: number }) {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" mb={2}>Business Growth Score</Typography>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ display: 'inline-block', position: 'relative' }}
        >
          <Box sx={{
            width: 120, height: 120, borderRadius: '50%',
            background: `conic-gradient(#6366F1 ${score * 3.6}deg, #e0e0e0 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box sx={{ width: 90, height: 90, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight={700} color="primary">{score}</Typography>
            </Box>
          </Box>
        </motion.div>
        <Typography variant="body2" color="text.secondary" mt={1}>out of 100</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: tenant, isLoading } = useQuery({ queryKey: QUERY_KEYS.adminTenant, queryFn: getTenantInfo });

  const kpiCards = [
    { title: 'Sales Today', value: 2450, prefix: '$', icon: <TrendingUpIcon />, color: '#6366F1' },
    { title: 'Orders Today', value: 38, icon: <ShoppingCartIcon />, color: '#EC4899' },
    { title: 'Revenue (Month)', value: 48200, prefix: '$', icon: <AttachMoneyIcon />, color: '#22C55E' },
    { title: 'New Customers', value: 24, icon: <PeopleIcon />, color: '#F59E0B' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Dashboard</Typography>
      {tenant && <Typography variant="body2" color="text.secondary" mb={3}>{tenant.companyName} · {tenant.subdomain} · {tenant.subscriptionPlan ?? 'Free'}</Typography>}

      <Grid2 container spacing={3} mb={4}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Grid2 key={i} size={{ xs: 12, sm: 6, md: 3 }}><SkeletonLoader variant="card" /></Grid2>)
          : kpiCards.map(card => (
              <Grid2 key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiCard {...card} loading={false} />
              </Grid2>
            ))}
      </Grid2>

      <Grid2 container spacing={3} mb={4}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Sales Analytics</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MOCK_SALES}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Customer Analytics</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MOCK_CUSTOMERS}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip />
                <Bar dataKey="value" fill="#EC4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Product Performance</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MOCK_PRODUCTS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="label" type="category" width={80} /><Tooltip />
                <Bar dataKey="value" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <GrowthScore score={74} />
        </Grid2>
      </Grid2>
    </Box>
  );
}
