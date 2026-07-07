import { createTheme } from '@mui/material/styles';
import { darkTokens } from './themeTokens';
import { typography } from './typography';

export const darkTheme = createTheme({
  palette: { mode: 'dark', ...darkTokens },
  typography,
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 2px rgba(15,17,17,0.5)' },
        containedPrimary: { color: '#0F1111' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #37475A',
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
