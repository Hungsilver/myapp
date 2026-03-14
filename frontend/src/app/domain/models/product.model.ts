export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface ProductFilterRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
}
