import { createTheme } from '@mui/material/styles';
import { lightTokens } from './themeTokens';
import { typography } from './typography';
import { glassLight } from './glassmorphism';

export const lightTheme = createTheme({
  palette: { mode: 'light', ...lightTokens },
  typography,
  shape: { borderRadius: 12 },
  ...glassLight,
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 8 },
        },
      },
    },
  },
});
