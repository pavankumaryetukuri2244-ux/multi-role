import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', p: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h1" fontWeight={900} sx={{ fontSize: '8rem', color: 'error.main', lineHeight: 1 }}>403</Typography>
        <Typography variant="h4" fontWeight={700} mb={1}>Access Forbidden</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>You don't have permission to access this page.</Typography>
        <Button variant="outlined" size="large" onClick={() => navigate(-1)}>Go Back</Button>
      </motion.div>
    </Box>
  );
}
