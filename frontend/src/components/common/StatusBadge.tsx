import React from 'react';
import { Chip } from '@mui/material';

export interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

type StatusColor = 'success' | 'error' | 'warning' | 'default';

function resolveColor(status: string): StatusColor {
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
      return 'success';
    case 'inactive':
    case 'disabled':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
}

const COLOR_MAP: Record<StatusColor, { bg: string; color: string }> = {
  success: { bg: '#dcfce7', color: '#166534' },
  error:   { bg: '#fee2e2', color: '#991b1b' },
  warning: { bg: '#fef9c3', color: '#854d0e' },
  default: { bg: '#f1f5f9', color: '#475569' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const colorKey = resolveColor(status);
  const { bg, color } = COLOR_MAP[colorKey];

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        backgroundColor: bg,
        color,
        fontWeight: 600,
        borderRadius: 1,
        textTransform: 'capitalize',
      }}
    />
  );
};

export default StatusBadge;
