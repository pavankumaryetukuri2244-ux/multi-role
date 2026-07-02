import { Box, Typography, Grid2, Card, CardContent, List, ListItem, ListItemText, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { formatRelativeTime } from '@/utils/formatters';

const RECS = [
  { id: 1, title: 'Featured Item A', category: 'Electronics', price: '$49.99' },
  { id: 2, title: 'Featured Item B', category: 'Clothing', price: '$29.99' },
  { id: 3, title: 'Featured Item C', category: 'Food', price: '$12.99' },
];
const ACTIVITY = [
  { id: 1, action: 'Order #ORD-042 delivered', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, action: 'Added 2 items to wishlist', time: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, action: 'Earned 150 loyalty points', time: new Date(Date.now() - 86400000).toISOString() },
];

export default function PortalHomePage() {
  const { firstName } = useSelector((state: RootState) => state.auth);
  const { companyName, bannerUrl } = useSelector((state: RootState) => state.tenant);

  return (
    <Box>
      {/* Hero banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{
          height: 200, borderRadius: 3, mb: 4,
          background: bannerUrl ? `url(${bannerUrl}) center/cover` : 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          display: 'flex', alignItems: 'center', px: 4,
        }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#fff' }}>
              Welcome back, {firstName ?? 'User'}!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>{companyName ?? 'Your Portal'}</Typography>
          </Box>
        </Box>
      </motion.div>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Recommendations</Typography>
          <Grid2 container spacing={2}>
            {RECS.map(r => (
              <Grid2 key={r.id} size={{ xs: 12, sm: 4 }}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>{r.title}</Typography>
                    <Chip label={r.category} size="small" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="primary" fontWeight={700}>{r.price}</Typography>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Recent Activity</Typography>
          <Card>
            <List dense>
              {ACTIVITY.map(a => (
                <ListItem key={a.id} divider>
                  <ListItemText primary={a.action} secondary={formatRelativeTime(a.time)} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
