import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ROLE_DASHBOARD_MAP } from '@/constants/roles';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const dashboard = isAuthenticated && role ? ROLE_DASHBOARD_MAP[role] : '/login';
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', p: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h1" fontWeight={900} sx={{ fontSize: '8rem', color: 'primary.main', lineHeight: 1 }}>404</Typography>
        <Typography variant="h4" fontWeight={700} mb={1}>Page Not Found</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>The page you're looking for doesn't exist or has been moved.</Typography>
        <Button variant="contained" size="large" onClick={() => navigate(dashboard)}>Return to Dashboard</Button>
      </motion.div>
    </Box>
  );
}
