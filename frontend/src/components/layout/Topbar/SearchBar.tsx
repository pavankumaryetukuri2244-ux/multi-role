import React, { useEffect, useRef } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  /** Called when the search button is clicked or the keyboard shortcut fires */
  onSearchOpen: () => void;
}

// ─── Platform detection ────────────────────────────────────────────────────────

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

// ─── Framer Motion fade-in variant ────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

/**
 * SearchBar — compact search trigger button in the Topbar.
 *
 * - Displays a button with a search icon and keyboard shortcut hint
 * - Clicking fires `onSearchOpen` to open the SmartSearch fullscreen modal
 * - Also responds to the ⌘K / Ctrl+K keyboard shortcut
 * - Framer Motion fade-in animation on mount
 *
 * Requirements: 5.4, 20.1
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearchOpen }) => {
  const theme = useTheme();

  // Keep a stable ref to avoid stale closure in the event listener
  const onSearchOpenRef = useRef(onSearchOpen);
  useEffect(() => {
    onSearchOpenRef.current = onSearchOpen;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = isMac ? event.metaKey : event.ctrlKey;
      if (isModifier && event.key === 'k') {
        event.preventDefault();
        onSearchOpenRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<SearchIcon fontSize="small" />}
        onClick={onSearchOpen}
        aria-label={`Open search (${shortcutLabel})`}
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          color: 'text.secondary',
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.03)',
          px: 1.5,
          py: 0.5,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          minWidth: 140,
          justifyContent: 'space-between',
          gap: 1,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
            color: 'primary.main',
          },
          transition: 'all 0.2s',
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: 'inherit', flexGrow: 1, textAlign: 'left' }}
        >
          Search…
        </Typography>

        {/* Keyboard shortcut hint */}
        <Box
          component="kbd"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            fontSize: '0.65rem',
            fontFamily: 'inherit',
            color: 'text.disabled',
            lineHeight: 1.4,
            letterSpacing: '0.02em',
          }}
        >
          {shortcutLabel}
        </Box>
      </Button>
    </motion.div>
  );
};

export default SearchBar;
