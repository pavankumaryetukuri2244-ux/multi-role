import { Box, Typography, Stack, Chip, Button, Card, CardContent, Grid2 } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const MONTHLY: any[] = [];
const BY_CATEGORY: any[] = [];
const COLORS = ['#6366F1', '#EC4899', '#22C55E', '#F59E0B'];

export default function AdminReportsPage() {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={700}>Reports</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small">Export CSV</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small">Export PDF</Button>
        </Stack>
      </Stack>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Monthly Revenue & Orders</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="revenue" fill="#6366F1" name="Revenue ($)" />
                <Bar dataKey="orders" fill="#EC4899" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card><CardContent>
            <Typography variant="h6" mb={2}>Sales by Category</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={BY_CATEGORY} dataKey="value" nameKey="name" outerRadius={100} label>
                  {BY_CATEGORY.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
