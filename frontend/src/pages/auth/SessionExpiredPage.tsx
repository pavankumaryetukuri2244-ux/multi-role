/**
 * SessionExpiredPage
 *
 * Full-page centered layout shown when a user's session/JWT has expired.
 * Framer Motion slide-up animation on mount. Returns the user to /login.
 *
 * Validates: Requirements 3.7, 3.8
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// ─── Animation variants ───────────────────────────────────────────────────────
const slideUpVariants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export default function SessionExpiredPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <motion.div
        variants={slideUpVariants}
        initial="initial"
        animate="animate"
        style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}
      >
        {/* Warning icon */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'warning.main',
            mb: 3,
          }}
        >
          <WarningAmberIcon sx={{ color: 'white', fontSize: 44 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 1.5 }}
        >
          Session Expired
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.7 }}
        >
          Your session has expired. Please log in again to continue.
        </Typography>

        {/* CTA */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
          sx={{ px: 4, py: 1.5, fontWeight: 600, borderRadius: 2 }}
        >
          Return to Login
        </Button>
      </motion.div>
    </Box>
  );
}
