import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

export default function ServerErrorPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', p: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h1" fontWeight={900} sx={{ fontSize: '8rem', color: 'warning.main', lineHeight: 1 }}>500</Typography>
        <Typography variant="h4" fontWeight={700} mb={1}>Something went wrong</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>An unexpected error occurred. Our team has been notified.</Typography>
        <Button variant="contained" size="large" onClick={() => window.location.reload()}>Reload Page</Button>
      </motion.div>
    </Box>
  );
}
