import { createTheme } from '@mui/material/styles';
import { lightTokens } from './themeTokens';
import { typography } from './typography';
import { glassLight } from './glassmorphism';

export const lightTheme = createTheme({
  palette: { mode: 'light', ...lightTokens },
  typography,
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 2px rgba(15,17,17,0.15)' },
        containedPrimary: { color: '#0F1111' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #D5D9D9',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 4 },
        },
      },
    },
  },
});
