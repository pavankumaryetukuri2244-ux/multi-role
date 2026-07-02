import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { QUERY_KEYS } from '@/constants/queryKeys';
import apiClient from '@/services/apiClient';
import {
  setNotifications,
  incrementUnreadCount,
  pushToast,
  type Notification,
} from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

// ─── Inline notifications service call ───────────────────────────────────────

async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<Notification[]>('/notifications');
  return response.data;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const dispatch = useDispatch();
  const unreadCount = useSelector(
    (state: RootState) => state.ui.unreadNotificationCount
  );
  const notifications = useSelector(
    (state: RootState) => state.ui.notifications
  );

  // Track previous unread count to detect new arrivals
  const prevUnreadRef = useRef<number>(unreadCount);

  const { isLoading } = useQuery<Notification[]>({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      const data = await fetchNotifications();

      const newUnreadCount = data.filter((n) => !n.read).length;
      const prevUnread = prevUnreadRef.current;

      if (newUnreadCount > prevUnread) {
        // Dispatch one increment per new unread notification
        const diff = newUnreadCount - prevUnread;
        for (let i = 0; i < diff; i++) {
          dispatch(incrementUnreadCount());
        }

        // Push a toast for the first new unread notification
        const firstNew = data.find((n) => !n.read);
        if (firstNew) {
          dispatch(
            pushToast({
              severity: 'info',
              message: firstNew.message,
            })
          );
        }
      }

      prevUnreadRef.current = newUnreadCount;
      dispatch(setNotifications(data));
      return data;
    },
    refetchInterval: 60_000,
  });

  return {
    notifications,
    unreadCount,
    isLoading,
  };
}
