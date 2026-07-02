import { useTheme } from '@mui/material/styles';
import { useMediaQuery as useMuiMediaQuery } from '@mui/material';

export function useIsMobile(): boolean {
  const theme = useTheme();
  return useMuiMediaQuery(theme.breakpoints.down('sm'));
}

export function useIsTablet(): boolean {
  const theme = useTheme();
  return useMuiMediaQuery(theme.breakpoints.down('md'));
}

export function useIsDesktop(): boolean {
  const theme = useTheme();
  return useMuiMediaQuery(theme.breakpoints.up('lg'));
}
