import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { createAppTheme } from '@/theme';
import { buildTenantTheme } from './buildTenantTheme';
import { useBranding } from './useBranding';

interface BrandingProviderProps {
  children: React.ReactNode;
}

/**
 * BrandingProvider wraps the USER portal tree.
 * Fetches tenant config and applies a runtime MUI theme override
 * scoped only to the portal — ADMIN/SUPER_ADMIN always use platform defaults.
 * Falls back silently to platform defaults on error (Req 17.6).
 */
export function BrandingProvider({ children }: BrandingProviderProps) {
  const { isLoading } = useBranding();
  const themeMode = useSelector((state: RootState) => state.ui.themeMode);
  const primaryColor = useSelector((state: RootState) => state.tenant.primaryColor);

  const baseTheme = createAppTheme(themeMode);
  const activeTheme = primaryColor && !isLoading
    ? buildTenantTheme(baseTheme, primaryColor)
    : baseTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      {children}
    </ThemeProvider>
  );
}

export default BrandingProvider;
