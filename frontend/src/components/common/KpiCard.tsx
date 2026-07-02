import React, { useEffect, useState } from 'react';
import { Box, Chip, Skeleton, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface KpiCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  color?: string;
  prefix?: string;
  suffix?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  loading = false,
  color = '#6366F1',
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading) return;
    const steps = 20;
    const interval = 50; // ms
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      current = step >= steps ? value : Math.round(increment * step);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Skeleton variant="circular" width={44} height={44} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={18} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={36} />
      </Box>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2 }}
      style={{ borderRadius: 12 }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
        }}
      >
        {icon && (
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.25,
              borderRadius: '50%',
              bgcolor: `${color}20`,
              color,
              mb: 2,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>

        <Typography variant="h4" fontWeight={700} sx={{ mb: trend !== undefined ? 1.5 : 0 }}>
          {prefix}
          {displayValue.toLocaleString()}
          {suffix}
        </Typography>

        {trend !== undefined && (
          <Chip
            size="small"
            icon={
              trend >= 0 ? (
                <ArrowUpwardIcon fontSize="small" />
              ) : (
                <ArrowDownwardIcon fontSize="small" />
              )
            }
            label={`${Math.abs(trend)}%${trendLabel ? ` ${trendLabel}` : ''}`}
            sx={{
              bgcolor: trend >= 0 ? '#dcfce7' : '#fee2e2',
              color: trend >= 0 ? '#166534' : '#991b1b',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        )}
      </Box>
    </motion.div>
  );
};

export default KpiCard;
