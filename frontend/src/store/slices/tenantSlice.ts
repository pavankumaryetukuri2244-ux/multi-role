import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantState {
  tenantId: number | null;
  companyName: string | null;
  subdomain: string | null;
  customDomain: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  subscriptionPlan: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface TenantBrandingPayload {
  tenantId: number | null;
  companyName: string | null;
  subdomain: string | null;
  customDomain: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  subscriptionPlan: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: TenantState = {
  tenantId: null,
  companyName: null,
  subdomain: null,
  customDomain: null,
  primaryColor: null,
  logoUrl: null,
  bannerUrl: null,
  subscriptionPlan: null,
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    /**
     * setTenantBranding — populated by BrandingProvider for USER portal.
     * Stores tenant configuration that drives the MUI theme override.
     */
    setTenantBranding(state, action: PayloadAction<TenantBrandingPayload>) {
      const {
        tenantId,
        companyName,
        subdomain,
        customDomain,
        primaryColor,
        logoUrl,
        bannerUrl,
        subscriptionPlan,
      } = action.payload;
      state.tenantId = tenantId;
      state.companyName = companyName;
      state.subdomain = subdomain;
      state.customDomain = customDomain;
      state.primaryColor = primaryColor;
      state.logoUrl = logoUrl;
      state.bannerUrl = bannerUrl;
      state.subscriptionPlan = subscriptionPlan;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * clearTenantBranding — clears all tenant state (called on logout).
     */
    clearTenantBranding(state) {
      state.tenantId = null;
      state.companyName = null;
      state.subdomain = null;
      state.customDomain = null;
      state.primaryColor = null;
      state.logoUrl = null;
      state.bannerUrl = null;
      state.subscriptionPlan = null;
      state.isLoading = false;
      state.error = null;
    },

    setTenantLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setTenantError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setTenantBranding, clearTenantBranding, setTenantLoading, setTenantError } =
  tenantSlice.actions;

export default tenantSlice.reducer;
