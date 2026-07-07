// Admin service type definitions

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  active: boolean;
  phone?: string;
}
