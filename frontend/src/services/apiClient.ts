/**
 * Axios API client with request/response interceptors.
 *
 * Dynamic imports for `store` and `logoutAction` are used inside the interceptor
 * callbacks (not at module top-level) to avoid circular dependency issues while
 * those modules are being built out.
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — inject JWT ────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  // Dynamic import: avoids circular dependency with store/authSlice
  const storeModule = await import('@/store/index');
  const token: string | null = storeModule.default.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — 401 handler ──────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      // Dynamic imports: avoids circular dependency with store/authSlice
      const [storeModule, authSliceModule] = await Promise.all([
        import('@/store/index'),
        import('@/store/slices/authSlice'),
      ]);

      storeModule.default.dispatch(authSliceModule.logoutAction());
      localStorage.removeItem('token');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
