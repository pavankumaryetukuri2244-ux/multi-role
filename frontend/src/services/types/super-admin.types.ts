export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  tenantCount?: number;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  companyName?: string;
  subdomain?: string;
  categories?: Category[];
  createdAt?: string;
}

export interface TenantResponse {
  id: number;
  companyName: string;
  subdomain: string;
  customDomain: string | null;
  active: boolean;
  subscriptionPlan: string | null;
  adminName: string;
  categories?: string[];
  healthScore?: number;
  primaryColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface PiePoint {
  name: string;
  value: number;
}

export interface AnalyticsResponse {
  totalTenants: number;
  activeTenants: number;
  totalAdmins: number;
  totalUsers: number;
  totalCategories: number;
  totalSubscriptionPlans: number;
  // Chart data — optional, may not be present in basic analytics
  monthlyRevenue?: number;
  activeSubscriptions?: number;
  newRegistrationsThisMonth?: number;
  revenueOverTime?: TimeSeriesPoint[];
  tenantGrowthPerMonth?: TimeSeriesPoint[];
  categoryDistribution?: PiePoint[];
  userGrowthOverTime?: TimeSeriesPoint[];
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  features: string;
  durationDays: number;
  active: boolean;
}

export interface PlatformSetting {
  id?: number;
  settingKey: string;
  settingValue: string;
  description: string;
}

export interface CreateAdminWithTenantRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
  subdomain?: string;
  tenantId?: number;
}

export interface UpdateAdminRequest {
  firstName: string;
  lastName: string;
  active: boolean;
}

export interface AssignCategoriesRequest {
  categoryIds: number[];
}

export interface SubscriptionPlanRequest {
  name: string;
  price: number;
  features: string;
  durationDays: number;
  active: boolean;
}

export interface PlatformSettingRequest {
  settingKey: string;
  settingValue: string;
  description: string;
}

export interface CustomDomainRequest {
  customDomain: string;
}
