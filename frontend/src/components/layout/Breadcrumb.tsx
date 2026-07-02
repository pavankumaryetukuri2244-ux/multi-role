import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a URL segment into a human-readable label.
 * Replaces hyphens with spaces and capitalises each word.
 * e.g. "subscription-plans" → "Subscription Plans"
 */
function segmentToLabel(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Breadcrumb — auto-derives crumbs from the current pathname.
 *
 * Rules:
 *  - Hidden when there is only 1 segment (root / dashboard-only path).
 *  - The last segment is plain text (not a link).
 *  - All preceding segments are MUI Link components backed by react-router NavLink.
 *
 * Requirement: 5.5
 */
const Breadcrumb: React.FC = () => {
  const { pathname } = useLocation();

  // Split the pathname into non-empty segments
  const segments = pathname.split('/').filter(Boolean);

  // Hide if there's only one segment (or none) — e.g. "/" or "/dashboard"
  if (segments.length <= 1) return null;

  // Build crumb descriptors: each includes a label and the cumulative href
  const crumbs = segments.map((segment, index) => ({
    label: segmentToLabel(segment),
    href: '/' + segments.slice(0, index + 1).join('/'),
  }));

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      {crumbs.slice(0, -1).map((crumb) => (
        <Link
          key={crumb.href}
          component={RouterLink}
          to={crumb.href}
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {crumb.label}
        </Link>
      ))}

      {/* Last crumb — not a link */}
      <Typography color="text.primary">
        {crumbs[crumbs.length - 1].label}
      </Typography>
    </MuiBreadcrumbs>
  );
};

export default Breadcrumb;
