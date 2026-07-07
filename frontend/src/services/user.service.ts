import apiClient from '@/services/apiClient';
import type { UpdateProfileRequest, ChangePasswordRequest } from './types/user.types';
import type { TenantResponse, UserResponse } from './types/super-admin.types';

// Re-export types so consumers can import from this module directly.
export type { UpdateProfileRequest, ChangePasswordRequest };

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /user/profile — fetch the current user's profile.
 */
export async function getProfile(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>('/user/profile');
  return response.data;
}

/**
 * PUT /user/profile — update the current user's profile.
 */
export async function updateProfile(req: UpdateProfileRequest): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>('/user/profile', req);
  return response.data;
}

/**
 * PUT /user/password — change the current user's password.
 */
export async function changePassword(req: ChangePasswordRequest): Promise<void> {
  await apiClient.put('/user/password', req);
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

/**
 * GET /user/tenant — fetch the tenant info for the current user's portal.
 */
export async function getTenantInfo(): Promise<TenantResponse> {
  const response = await apiClient.get<TenantResponse>('/user/tenant');
  return response.data;
}
