import { useState } from 'react';
import { Box, IconButton, Tooltip, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ROUTES } from '@/constants/routes';

export default function FloatingQuickActions() {
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.auth.role);
  const [open, setOpen] = useState(false);

  if (role === 'USER') return null;

  const superAdminActions = [
    { name: 'Create Admin', icon: <PeopleIcon />, path: ROUTES.SUPER_ADMIN_ADMINS },
    { name: 'Create Category', icon: <CategoryIcon />, path: ROUTES.SUPER_ADMIN_CATEGORIES },
    { name: 'View Analytics', icon: <AnalyticsIcon />, path: ROUTES.SUPER_ADMIN_ANALYTICS },
  ];

  const adminActions = [
    { name: 'Create User', icon: <PeopleIcon />, path: ROUTES.ADMIN_USERS },
    { name: 'New Order', icon: <ShoppingCartIcon />, path: ROUTES.ADMIN_ORDERS },
    { name: 'View Reports', icon: <AssessmentIcon />, path: ROUTES.ADMIN_REPORTS },
  ];

  const actions = role === 'SUPER_ADMIN' ? superAdminActions : adminActions;

  return (
    <Box sx={{ position: 'fixed', bottom: 96, right: 24, zIndex: 1200 }}>
      <SpeedDial
        ariaLabel="Quick Actions"
        icon={<SpeedDialIcon openIcon={<AddIcon />} />}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        direction="up"
        sx={{
          '& .MuiSpeedDial-fab': {
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
          }
        }}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => { navigate(action.path); setOpen(false); }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
