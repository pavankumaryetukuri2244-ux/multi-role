import apiClient from './apiClient';
import type { LoginRequest, LoginResponse, RegisterAdminRequest } from './types/auth.types';
import type { UserResponse } from './types/super-admin.types';

// Re-export types so consumers can import from this module directly.
export type { LoginRequest, LoginResponse, RegisterAdminRequest };

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * POST /auth/login — standard user/super-admin login.
 */
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', req);
  return response.data;
}

/**
 * POST /auth/admin-login — admin-specific login endpoint.
 */
export async function adminLogin(req: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/admin-login', req);
  return response.data;
}

/**
 * POST /auth/register-admin — admin self-registration.
 */
export async function registerAdmin(req: RegisterAdminRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/auth/register-admin', req);
  return response.data;
}
