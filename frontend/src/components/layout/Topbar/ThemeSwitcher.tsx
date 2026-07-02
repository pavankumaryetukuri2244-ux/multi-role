import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { toggleTheme } from '@/store/slices/uiSlice';

/**
 * ThemeSwitcher — toggles between light and dark mode.
 *
 * - Shows DarkModeIcon when currently in light mode (clicking → goes dark)
 * - Shows LightModeIcon when currently in dark mode (clicking → goes light)
 */
const ThemeSwitcher: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const themeMode = useSelector((state: RootState) => state.ui.themeMode);

  const isDark = themeMode === 'dark';

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label} arrow>
      <IconButton
        onClick={() => dispatch(toggleTheme())}
        aria-label={label}
        size="medium"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'action.hover',
          },
          transition: 'color 0.2s, background-color 0.2s',
        }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;
