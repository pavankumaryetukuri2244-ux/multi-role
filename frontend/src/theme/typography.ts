import type { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = {
  fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  h1: { fontSize: '2.5rem',  fontWeight: 700, lineHeight: 1.2  },
  h2: { fontSize: '2rem',    fontWeight: 700, lineHeight: 1.25 },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3  },
  h4: { fontSize: '1.5rem',  fontWeight: 600, lineHeight: 1.35 },
  h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4  },
  h6: { fontSize: '1rem',    fontWeight: 600, lineHeight: 1.5  },
  body1:   { fontSize: '1rem',     lineHeight: 1.6 },
  body2:   { fontSize: '0.875rem', lineHeight: 1.6 },
  caption: { fontSize: '0.75rem',  lineHeight: 1.5 },
  button:  { textTransform: 'none', fontWeight: 600 },
};
