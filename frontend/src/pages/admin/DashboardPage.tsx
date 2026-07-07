import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { RootState } from '@/store';
import { ROUTES } from '@/constants/routes';

const R = ROUTES.ADMIN;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { firstName, lastName, email } = useSelector((state: RootState) => state.auth);
  const displayName = firstName
    ? `${firstName}${lastName ? ' ' + lastName : ''}`
    : (email?.split('@')[0] ?? 'Admin');

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Welcome, {displayName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate(R.USERS)}
          sx={{ borderRadius: 2, fontWeight: 600, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}
        >
          + Add User
        </Button>
      </Stack>
    </Box>
  );
}
