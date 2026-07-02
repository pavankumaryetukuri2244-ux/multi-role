import { createTheme } from '@mui/material/styles';
import { darkTokens } from './themeTokens';
import { typography } from './typography';
import { glassDark } from './glassmorphism';

export const darkTheme = createTheme({
  palette: { mode: 'dark', ...darkTokens },
  typography,
  shape: { borderRadius: 12 },
  ...glassDark,
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.16)',
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
