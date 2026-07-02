import type { } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    glass: { light: string; medium: string; dark: string; };
    gradients: { primary: string; success: string; surface: string; };
  }
  interface ThemeOptions {
    glass?: { light?: string; medium?: string; dark?: string; };
    gradients?: { primary?: string; success?: string; surface?: string; };
  }
}

export const glassLight = {
  glass: {
    light:  'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.15)',
    dark:   'rgba(0,0,0,0.1)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
    success: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    surface: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(236,72,153,0.05) 100%)',
  },
};

export const glassDark = {
  glass: {
    light:  'rgba(255,255,255,0.05)',
    medium: 'rgba(255,255,255,0.1)',
    dark:   'rgba(0,0,0,0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #818CF8 0%, #F472B6 100%)',
    success: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
    surface: 'linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(244,114,182,0.08) 100%)',
  },
};
