import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            gap: 2,
            p: 4,
            textAlign: 'center',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main' }} />

          <Typography variant="h6" fontWeight={600}>
            Something went wrong
          </Typography>

          {this.state.error?.message && (
            <Box
              component="code"
              sx={{
                display: 'block',
                bgcolor: 'grey.100',
                color: 'error.main',
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: '0.8rem',
                maxWidth: 560,
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
            >
              {this.state.error.message}
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
