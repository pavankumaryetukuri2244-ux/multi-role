import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

import store from '@/store';
import type { RootState, AppDispatch } from '@/store';
import { queryClient } from '@/app/queryClient';
import { createAppTheme } from '@/theme';
import { setCredentialsFromStorage } from '@/store/slices/authSlice';
import { removeToast } from '@/store/slices/uiSlice';
import type { ToastMessage } from '@/store/slices/uiSlice';
import Router from '@/app/Router';

// ─── Theme wrapper ────────────────────────────────────────────────────────────

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSelector((state: RootState) => state.ui.themeMode);
  const theme = createAppTheme(themeMode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// ─── Toast renderer ───────────────────────────────────────────────────────────

function ToastRenderer() {
  const toastQueue = useSelector((state: RootState) => state.ui.toastQueue);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      {toastQueue.map((toast: ToastMessage) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.severity === 'error' ? null : 4000}
          onClose={() => dispatch(removeToast(toast.id))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={toast.severity}
            onClose={() => dispatch(removeToast(toast.id))}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}

// ─── Inner content (needs Redux in scope) ────────────────────────────────────

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  // Rehydrate auth state from localStorage on first render
  useEffect(() => {
    dispatch(setCredentialsFromStorage());
  }, [dispatch]);

  return (
    <AppThemeProvider>
      <BrowserRouter>
        <Router />
        <ToastRenderer />
      </BrowserRouter>
    </AppThemeProvider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
