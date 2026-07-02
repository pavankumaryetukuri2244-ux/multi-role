import apiClient from '@/services/apiClient';
import type {
  AnalyticsResponse,
  AssignCategoriesRequest,
  Category,
  CategoryRequest,
  CreateAdminWithTenantRequest,
  CustomDomainRequest,
  PlatformSetting,
  PlatformSettingRequest,
  SubscriptionPlan,
  SubscriptionPlanRequest,
  TenantResponse,
  UpdateAdminRequest,
  UserResponse,
} from './types/super-admin.types';

// Backend wraps every response in { success: boolean, message: string, data: T }
interface ApiResponse<T> { success: boolean; message: string; data: T; }

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const res = await apiClient.get<ApiResponse<AnalyticsResponse>>('/super-admin/analytics');
  return res.data.data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>('/super-admin/categories');
  return res.data.data;
}

export async function createCategory(req: CategoryRequest): Promise<Category> {
  const res = await apiClient.post<ApiResponse<Category>>('/super-admin/categories', req);
  return res.data.data;
}

export async function updateCategory(id: number, req: CategoryRequest): Promise<Category> {
  const res = await apiClient.put<ApiResponse<Category>>(`/super-admin/categories/${id}`, req);
  return res.data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/super-admin/categories/${id}`);
}

// ─── Admins ───────────────────────────────────────────────────────────────────

export async function getAdmins(): Promise<UserResponse[]> {
  const res = await apiClient.get<ApiResponse<UserResponse[]>>('/super-admin/admins');
  return res.data.data;
}

export async function createAdmin(req: CreateAdminWithTenantRequest): Promise<UserResponse> {
  const res = await apiClient.post<ApiResponse<UserResponse>>('/super-admin/admins', req);
  return res.data.data;
}

export async function updateAdmin(id: number, req: UpdateAdminRequest): Promise<UserResponse> {
  const res = await apiClient.put<ApiResponse<UserResponse>>(`/super-admin/admins/${id}`, req);
  return res.data.data;
}

export async function toggleAdminStatus(id: number, active: boolean): Promise<UserResponse> {
  const res = await apiClient.put<ApiResponse<UserResponse>>(
    `/super-admin/admins/${id}/status?active=${active}`
  );
  return res.data.data;
}

export async function approveAdmin(id: number): Promise<UserResponse> {
  const res = await apiClient.put<ApiResponse<UserResponse>>(`/super-admin/admins/${id}/approve`);
  return res.data.data;
}

export async function assignCategories(id: number, req: AssignCategoriesRequest): Promise<UserResponse> {
  const res = await apiClient.put<ApiResponse<UserResponse>>(`/super-admin/admins/${id}/categories`, req);
  return res.data.data;
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

export async function getTenants(): Promise<TenantResponse[]> {
  const res = await apiClient.get<ApiResponse<TenantResponse[]>>('/super-admin/tenants');
  return res.data.data;
}

export async function createTenant(req: { name: string; subdomain: string; customDomain?: string }): Promise<TenantResponse> {
  const res = await apiClient.post<ApiResponse<TenantResponse>>('/super-admin/tenants', req);
  return res.data.data;
}

export async function updateSubdomain(id: number, subdomain: string): Promise<TenantResponse> {
  // Backend uses @RequestParam, not @RequestBody
  const res = await apiClient.put<ApiResponse<TenantResponse>>(
    `/super-admin/tenants/${id}/subdomain?subdomain=${encodeURIComponent(subdomain)}`
  );
  return res.data.data;
}

export async function updateCustomDomain(id: number, req: CustomDomainRequest): Promise<TenantResponse> {
  const res = await apiClient.put<ApiResponse<TenantResponse>>(
    `/super-admin/tenants/${id}/custom-domain`, req
  );
  return res.data.data;
}

export async function toggleTenantStatus(id: number, active: boolean): Promise<TenantResponse> {
  const res = await apiClient.put<ApiResponse<TenantResponse>>(
    `/super-admin/tenants/${id}/status?active=${active}`
  );
  return res.data.data;
}

export async function assignCategoriesToTenant(id: number, req: AssignCategoriesRequest): Promise<TenantResponse> {
  const res = await apiClient.put<ApiResponse<TenantResponse>>(`/super-admin/tenants/${id}/categories`, req);
  return res.data.data;
}

export async function deleteTenant(id: number): Promise<void> {
  await apiClient.delete(`/super-admin/tenants/${id}`);
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/super-admin/subscription-plans');
  return res.data.data;
}

export async function createSubscriptionPlan(req: SubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const res = await apiClient.post<ApiResponse<SubscriptionPlan>>('/super-admin/subscription-plans', req);
  return res.data.data;
}

export async function updateSubscriptionPlan(id: number, req: SubscriptionPlanRequest): Promise<SubscriptionPlan> {
  const res = await apiClient.put<ApiResponse<SubscriptionPlan>>(`/super-admin/subscription-plans/${id}`, req);
  return res.data.data;
}

export async function deleteSubscriptionPlan(id: number): Promise<void> {
  await apiClient.delete(`/super-admin/subscription-plans/${id}`);
}

// ─── Platform Settings ────────────────────────────────────────────────────────

export async function getSettings(): Promise<PlatformSetting[]> {
  const res = await apiClient.get<ApiResponse<PlatformSetting[]>>('/super-admin/settings');
  return res.data.data;
}

export async function updateSetting(req: PlatformSettingRequest): Promise<PlatformSetting> {
  const res = await apiClient.put<ApiResponse<PlatformSetting>>('/super-admin/settings', req);
  return res.data.data;
}
