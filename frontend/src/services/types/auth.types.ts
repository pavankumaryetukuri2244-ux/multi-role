// Authentication service type definitions

export interface LoginRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
  message?: string;
  // Optional fields — may not be present in all backend responses
  userId?: number;
  firstName?: string;
  lastName?: string;
}

export interface RegisterAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  subdomain: string;
}

export interface UserRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tenantId: number;
}
