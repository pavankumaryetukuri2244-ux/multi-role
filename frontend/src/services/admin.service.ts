import apiClient from '@/services/apiClient';
import type { CreateUserRequest, UpdateUserRequest } from './types/admin.types';
import type { TenantResponse, UserResponse } from './types/super-admin.types';

// Re-export types so consumers can import from this module directly.
export type { CreateUserRequest, UpdateUserRequest };

// ─── Tenant ───────────────────────────────────────────────────────────────────

/**
 * GET /admin/tenant — fetch the current admin's tenant info.
 */
export async function getTenantInfo(): Promise<TenantResponse> {
  const response = await apiClient.get<TenantResponse>('/admin/tenant');
  return response.data;
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * GET /admin/users — list all users in the admin's tenant.
 */
export async function getUsers(): Promise<UserResponse[]> {
  const response = await apiClient.get<UserResponse[]>('/admin/users');
  return response.data;
}

/**
 * POST /admin/users — create a new user in the admin's tenant.
 */
export async function createUser(req: CreateUserRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/admin/users', req);
  return response.data;
}

/**
 * PUT /admin/users/{id} — update an existing user.
 */
export async function updateUser(id: number, req: UpdateUserRequest): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>(`/admin/users/${id}`, req);
  return response.data;
}

/**
 * DELETE /admin/users/{id} — permanently delete a user.
 */
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
