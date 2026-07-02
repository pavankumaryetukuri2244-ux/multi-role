import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | null;
  userId: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  /** Backend requires a non-blank `name` field in LoginRequest */
  name?: string;
}

interface AuthCredentials {
  token: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  userId: number | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

// ─── JWT Role Decoder ─────────────────────────────────────────────────────────

/**
 * Decodes the role from the JWT payload (middle base64 segment).
 * Returns null if decoding fails.
 */
function decodeRoleFromToken(token: string): 'SUPER_ADMIN' | 'ADMIN' | 'USER' | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Pad base64 string to a multiple of 4
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    const role = payload['role'] ?? payload['roles'] ?? payload['authorities'];
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER') {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  role: null,
  userId: null,
  email: null,
  firstName: null,
  lastName: null,
  isLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * loginThunk — calls auth.service.login, stores JWT in localStorage,
 * decodes role from JWT payload, and returns credentials.
 * Auth service is imported lazily to avoid circular dependency with apiClient.
 */
export const loginThunk = createAsyncThunk<AuthCredentials, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Lazy import to avoid circular dep: store → apiClient → store
      const { login } = await import('@/services/auth.service');
      // Only send email and password — `name` is optional in LoginRequest
      const response = await login({
        name: '',
        email: credentials.email,
        password: credentials.password,
      });

      const decodedRole = decodeRoleFromToken(response.token);
      const role =
        decodedRole ??
        ((['SUPER_ADMIN', 'ADMIN', 'USER'].includes(response.role)
          ? (response.role as 'SUPER_ADMIN' | 'ADMIN' | 'USER')
          : null) as 'SUPER_ADMIN' | 'ADMIN' | 'USER');

      localStorage.setItem('token', response.token);

      return {
        token: response.token,
        role,
        userId: response.userId ?? null,
        email: response.email,
        firstName: response.firstName ?? null,
        lastName: response.lastName ?? null,
      };
    } catch (err: unknown) {
      // Extract the most useful error message from the Axios error response
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } | string };
        message?: string;
      };
      let message = 'Login failed. Please check your credentials.';
      if (axiosErr.response?.data) {
        const data = axiosErr.response.data;
        if (typeof data === 'string') {
          message = data;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        }
      } else if (axiosErr.message) {
        message = axiosErr.message;
      }
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * setCredentialsFromStorage — reads token from localStorage on app load
     * and populates auth state by decoding the JWT payload.
     */
    setCredentialsFromStorage(state) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const role = decodeRoleFromToken(token);
      if (!role) {
        // Token present but undecodable — clear it
        localStorage.removeItem('token');
        return;
      }

      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      // userId/email/firstName/lastName are not re-decoded here;
      // the app can call a /me endpoint via React Query after rehydration.
    },

    /**
     * logoutAction — clears token from localStorage and resets auth state.
     */
    logoutAction(state) {
      localStorage.removeItem('token');
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      state.userId = null;
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.isLoading = false;
      state.error = null;
    },

    /** Manually set full credentials (e.g. after token refresh). */
    setCredentials(state, action: PayloadAction<AuthCredentials>) {
      const { token, role, userId, email, firstName, lastName } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.role = role;
      state.userId = userId;
      state.email = email;
      state.firstName = firstName;
      state.lastName = lastName;
      state.error = null;
    },

    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Login failed';
      });
  },
});

export const { setCredentialsFromStorage, logoutAction, setCredentials, clearAuthError } =
  authSlice.actions;

export default authSlice.reducer;
