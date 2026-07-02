import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Builds a tenant-specific MUI theme by overriding the primary palette color.
 * Property 6: buildTenantTheme(baseTheme, hexColor).palette.primary.main === hexColor
 */
export function buildTenantTheme(baseTheme: Theme, primaryColor: string): Theme {
  return createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: {
        main: primaryColor,
        light: primaryColor,
        dark: primaryColor,
        contrastText: '#FFFFFF',
      },
    },
  });
}
