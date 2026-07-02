import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getTenantInfo } from '@/services/user.service';
import { setTenantBranding, clearTenantBranding } from '@/store/slices/tenantSlice';
import type { AppDispatch } from '@/store';

export function useBranding() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.userTenant,
    queryFn: getTenantInfo,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      dispatch(setTenantBranding({
        tenantId: data.id,
        companyName: data.companyName,
        subdomain: data.subdomain,
        customDomain: data.customDomain,
        primaryColor: data.primaryColor ?? null,
        logoUrl: data.logoUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
        subscriptionPlan: data.subscriptionPlan,
      }));
    }
    if (isError) {
      dispatch(clearTenantBranding());
    }
  }, [data, isError, dispatch]);

  return { isLoading, tenant: data };
}
