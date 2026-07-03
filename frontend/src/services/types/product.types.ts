export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  product: Product;
  quantity: number;
  totalPrice: number;
  orderDate: string;
}

export interface OrderRequest {
  productId: number;
  quantity: number;
}
