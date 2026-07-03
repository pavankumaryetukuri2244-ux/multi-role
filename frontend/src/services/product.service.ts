import apiClient from './apiClient';
import type { Product, Order, OrderRequest } from './types/product.types';
import type { ApiResponse } from './types/super-admin.types';

// ─── User Portal Products & Orders ───────────────────────────────────────────

/**
 * GET /user/products — Get all products in user's tenant.
 */
export async function getUserProducts(): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<Product[]>>('/user/products');
  return response.data.data;
}

/**
 * POST /user/orders — Place a purchase order (buy a product).
 */
export async function placeUserOrder(req: OrderRequest): Promise<Order> {
  const response = await apiClient.post<ApiResponse<Order>>('/user/orders', req);
  return response.data.data;
}

/**
 * GET /user/orders — Get user's own orders history.
 */
export async function getUserOrders(): Promise<Order[]> {
  const response = await apiClient.get<ApiResponse<Order[]>>('/user/orders');
  return response.data.data;
}

// ─── Admin Product Management ────────────────────────────────────────────────

/**
 * GET /admin/products — Get all products in admin's tenant.
 */
export async function getAdminProducts(): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<Product[]>>('/admin/products');
  return response.data.data;
}

/**
 * POST /admin/products — Create product in admin's tenant.
 */
export async function createAdminProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>('/admin/products', product);
  return response.data.data;
}

/**
 * PUT /admin/products/:id — Update product in admin's tenant.
 */
export async function updateAdminProduct(id: number, product: Partial<Product>): Promise<Product> {
  const response = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, product);
  return response.data.data;
}

/**
 * DELETE /admin/products/:id — Delete product from admin's tenant.
 */
export async function deleteAdminProduct(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/admin/products/${id}`);
}

/**
 * GET /admin/orders — Get all orders placed in admin's tenant.
 */
export async function getAdminOrders(): Promise<Order[]> {
  const response = await apiClient.get<ApiResponse<Order[]>>('/admin/orders');
  return response.data.data;
}
