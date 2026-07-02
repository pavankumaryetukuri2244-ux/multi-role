import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import apiClient from '@/services/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlatformHealth() {
  const { data, isLoading } = useQuery<HealthResponse>({
    queryKey: QUERY_KEYS.platformHealth,
    queryFn: async () => {
      const response = await apiClient.get<HealthResponse>('/actuator/health');
      return response.data;
    },
    refetchInterval: 30_000,
  });

  return {
    isHealthy: data?.status === 'UP',
    status: data?.status ?? '',
    isLoading,
  };
}
