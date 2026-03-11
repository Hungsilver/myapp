import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, Product } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 10, search?: string, category?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<PagedResult<Product>>>(this.apiUrl, { params });
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getCategories() {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/categories`);
  }

  create(product: Partial<Product>) {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product);
  }

  update(id: number, product: Partial<Product>) {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
