import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../domain/models/api-response.model';
import {
  Product, ProductFilterRequest,
  CreateProductRequest, UpdateProductRequest
} from '../../domain/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filter: ProductFilterRequest): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams()
      .set('page', (filter.page ?? 1).toString())
      .set('pageSize', (filter.pageSize ?? 10).toString());
    if (filter.search) params = params.set('search', filter.search);
    if (filter.category) params = params.set('category', filter.category);
    return this.http.get<ApiResponse<Product[]>>(this.baseUrl, { params });
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/categories`);
  }

  createProduct(request: CreateProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.baseUrl, request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, request);
  }

  deleteProduct(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
