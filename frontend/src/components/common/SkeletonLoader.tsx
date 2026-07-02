import React from 'react';
import { Box, Card, CardContent, Skeleton, TableCell, TableRow } from '@mui/material';

// ─── Props ─────────────────────────────────────────────────────────────────────

export type SkeletonVariant =
  | 'text'
  | 'rectangular'
  | 'circular'
  | 'card'
  | 'table-row';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  /** Number of skeletons to render */
  count?: number;
  width?: number | string;
  height?: number | string;
}

// ─── Single-item renderers ─────────────────────────────────────────────────────

const CardSkeleton: React.FC = () => (
  <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Icon + title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="40%" height={24} />
      </Box>
      {/* Body lines */}
      <Skeleton variant="text" width="90%" height={16} />
      <Skeleton variant="text" width="75%" height={16} />
      <Skeleton variant="text" width="55%" height={16} />
    </CardContent>
  </Card>
);

const TableRowSkeleton: React.FC<{ width?: number | string; height?: number | string }> = ({
  height = 52,
}) => (
  <TableRow>
    {[...Array(5)].map((_, i) => (
      <TableCell key={i}>
        <Skeleton variant="text" height={height} />
      </TableCell>
    ))}
  </TableRow>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * SkeletonLoader — flexible loading placeholder supporting multiple layout variants.
 *
 * Requirements: 6.4, 8.4
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  width,
  height,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((i) => (
          <CardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  if (variant === 'table-row') {
    return (
      <>
        {items.map((i) => (
          <TableRowSkeleton key={i} width={width} height={height} />
        ))}
      </>
    );
  }

  // Standard MUI Skeleton variants: text | rectangular | circular
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((i) => (
        <Skeleton
          key={i}
          variant={variant as 'text' | 'rectangular' | 'circular'}
          width={width}
          height={height}
        />
      ))}
    </Box>
  );
};

export default SkeletonLoader;
