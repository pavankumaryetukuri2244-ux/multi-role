import React from 'react';
import { Box, Typography } from '@mui/material';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
  compact?: boolean;
}

const DefaultIllustration: React.FC = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="80" height="80" rx="40" fill="#F1F5F9" />
    <path
      d="M24 30h32v28a2 2 0 0 1-2 2H26a2 2 0 0 1-2-2V30z"
      stroke="#94A3B8"
      strokeWidth="2"
      fill="#E2E8F0"
    />
    <path
      d="M20 30h40l-4-10H24L20 30z"
      stroke="#94A3B8"
      strokeWidth="2"
      fill="#CBD5E1"
    />
    <path
      d="M34 44h12"
      stroke="#94A3B8"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  illustration,
  compact = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: compact ? 4 : 8,
        px: 3,
        gap: compact ? 1.5 : 2,
      }}
    >
      {illustration ?? <DefaultIllustration />}

      <Typography variant="h6" fontWeight={600} color="text.primary">
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}

      {action && <Box sx={{ mt: compact ? 1 : 2 }}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
