import { useState } from 'react';
import { Box, IconButton, Typography, Chip, Stack, Paper, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useLocation } from 'react-router-dom';

const SUGGESTIONS: Record<string, string[]> = {
  '/super-admin': ['Analyze tenant health', 'View revenue trends', 'Check pending approvals', 'Monitor platform status'],
  '/admin': ['Boost sales this week', 'Review low-stock items', 'Check new customer signups', 'View top products'],
  '/portal': ['Track my orders', 'Redeem loyalty points', 'Browse recommendations', 'Check wallet balance'],
};

export default function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const role = useSelector((state: RootState) => state.auth.role);

  const prefix = role === 'SUPER_ADMIN' ? '/super-admin' : role === 'ADMIN' ? '/admin' : '/portal';
  const chips = SUGGESTIONS[prefix] ?? SUGGESTIONS['/portal'];

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Paper elevation={8} sx={{ width: 320, mb: 2, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={700}>AI Assistant</Typography>
                </Stack>
                <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}><CloseIcon fontSize="small" /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Based on your current page, here are some suggestions:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {chips.map(chip => (
                    <Chip key={chip} label={chip} size="small" clickable variant="outlined" color="primary" onClick={() => {}} />
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                  AI insights powered by your platform data
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Tooltip title="AI Assistant">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <IconButton
            onClick={() => setOpen(p => !p)}
            sx={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)' },
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </motion.div>
      </Tooltip>
    </Box>
  );
}
