import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Card, CardContent, Grid2, TextField, Stack } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getAnalytics } from '@/services/superAdmin.service';
import { SkeletonLoader } from '@/components/common';

const COLORS = ['#6366F1', '#EC4899', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'];

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.superAdminAnalytics, queryFn: getAnalytics });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Analytics</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        <TextField label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
        <TextField label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
      </Stack>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Revenue over Time</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.revenueOverTime ?? []}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>New Tenants per Month</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.tenantGrowthPerMonth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip />
                  <Bar dataKey="value" fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Subscriptions by Plan</Typography>
            {isLoading ? <SkeletonLoader variant="rectangular" height={280} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data?.categoryDistribution ?? []} dataKey="value" nameKey="name" outerRadius={100} label>
                    {(data?.categoryDistribution ?? []).map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent></Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
