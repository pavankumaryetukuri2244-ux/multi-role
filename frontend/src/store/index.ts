import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tenantReducer from './slices/tenantSlice';
import uiReducer from './slices/uiSlice';

// ─── Store ────────────────────────────────────────────────────────────────────

const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    ui: uiReducer,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

/** The shape of the entire Redux state tree. */
export type RootState = ReturnType<typeof store.getState>;

/** The dispatch type with full support for async thunks. */
export type AppDispatch = typeof store.dispatch;

export default store;
