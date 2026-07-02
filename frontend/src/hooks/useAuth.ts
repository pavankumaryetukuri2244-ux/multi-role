import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);
  return {
    isAuthenticated: auth.isAuthenticated,
    role: auth.role,
    userId: auth.userId,
    email: auth.email,
    firstName: auth.firstName,
    lastName: auth.lastName,
    isLoading: auth.isLoading,
    error: auth.error,
    token: auth.token,
    fullName:
      auth.firstName && auth.lastName
        ? `${auth.firstName} ${auth.lastName}`
        : (auth.email ?? 'User'),
    initials:
      auth.firstName && auth.lastName
        ? `${auth.firstName[0]}${auth.lastName[0]}`.toUpperCase()
        : (auth.email?.[0] ?? 'U').toUpperCase(),
  };
}
