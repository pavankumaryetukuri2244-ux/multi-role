import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface UiState {
  themeMode: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  toastQueue: ToastMessage[];
}

// ─── Initial State ────────────────────────────────────────────────────────────

function readInitialTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable (e.g. SSR / test environments)
  }
  return 'light';
}

const initialState: UiState = {
  themeMode: readInitialTheme(),
  sidebarCollapsed: false,
  notifications: [],
  unreadNotificationCount: 0,
  toastQueue: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * toggleTheme — switches between light and dark mode,
     * persisted to localStorage key 'theme-mode'.
     */
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme-mode', state.themeMode);
      } catch {
        // Ignore write errors
      }
    },

    /**
     * toggleSidebar — flips the sidebar collapsed state.
     */
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    /**
     * setSidebarCollapsed — explicitly set the sidebar collapsed state.
     */
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },

    /**
     * pushToast — adds a toast to the queue with a crypto.randomUUID() id.
     * Accepts a toast without an id; the id is generated here.
     */
    pushToast(
      state,
      action: PayloadAction<Omit<ToastMessage, 'id'> & { id?: string }>
    ) {
      const id = action.payload.id ?? crypto.randomUUID();
      state.toastQueue.push({
        id,
        severity: action.payload.severity,
        message: action.payload.message,
      });
    },

    /**
     * removeToast — removes a toast from the queue by id.
     */
    removeToast(state, action: PayloadAction<string>) {
      state.toastQueue = state.toastQueue.filter((t) => t.id !== action.payload);
    },

    /**
     * setNotifications — replaces the full notifications array
     * (called after polling /notifications endpoint).
     */
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadNotificationCount = action.payload.filter((n) => !n.read).length;
    },

    /**
     * markNotificationRead — marks a single notification as read by id
     * and decrements unreadNotificationCount.
     */
    markNotificationRead(state, action: PayloadAction<number>) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1);
      }
    },

    /**
     * incrementUnreadCount — increments unread notification count by 1
     * (used when a new notification arrives via polling diff).
     */
    incrementUnreadCount(state) {
      state.unreadNotificationCount += 1;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  setSidebarCollapsed,
  pushToast,
  removeToast,
  setNotifications,
  markNotificationRead,
  incrementUnreadCount,
} = uiSlice.actions;

export default uiSlice.reducer;
