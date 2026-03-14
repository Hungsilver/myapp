import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductApiService } from '../../infrastructure/api/product-api.service';
import { ApiResponse } from '../../domain/models/api-response.model';
import {
  Product, ProductFilterRequest,
  CreateProductRequest, UpdateProductRequest
} from '../../domain/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private productApi: ProductApiService) {}

  getProducts(filter: ProductFilterRequest): Observable<ApiResponse<Product[]>> {
    return this.productApi.getProducts(filter);
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.productApi.getProductById(id);
  }

  getCategories(): Observable<ApiResponse<string[]>> {
    return this.productApi.getCategories();
  }

  createProduct(request: CreateProductRequest): Observable<ApiResponse<Product>> {
    return this.productApi.createProduct(request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<ApiResponse<Product>> {
    return this.productApi.updateProduct(id, request);
  }

  deleteProduct(id: string): Observable<ApiResponse<any>> {
    return this.productApi.deleteProduct(id);
  }
}
