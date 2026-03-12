import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../shared/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header -->
      <nav class="navbar">
        <div class="nav-brand">English</div>
        <div class="nav-actions">
          <span *ngIf="auth.isLoggedIn()" class="user-info">
            👋 {{ auth.currentUser()?.fullName }}
          </span>
          <button *ngIf="auth.isLoggedIn()" class="btn-outline" (click)="auth.logout()">Đăng xuất</button>
          <a *ngIf="!auth.isLoggedIn()" routerLink="/login" class="btn-outline">Đăng nhập</a>
        </div>
      </nav>

      <!-- Search & Filter -->
      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" placeholder="🔍 Tìm kiếm sản phẩm..."
          (input)="onSearch()" class="search-input" />
        <select [(ngModel)]="selectedCategory" (change)="onFilter()" class="filter-select">
          <option value="">Tất cả danh mục</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">Đang tải...</div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="!loading">
        <div class="product-card" *ngFor="let p of products">
          <img [src]="p.imageUrl" [alt]="p.name" class="product-img" />
          <div class="product-body">
            <span class="category-badge">{{ p.category }}</span>
            <h3>{{ p.name }}</h3>
            <p>{{ p.description }}</p>
            <div class="product-footer">
              <span class="price">{{ p.price | number }}đ</span>
              <span class="stock" [class.low]="p.stock < 5">
                Còn {{ p.stock }} sản phẩm
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && products.length === 0" class="empty-state">
        😕 Không tìm thấy sản phẩm nào
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">◀</button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">▶</button>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  pageSize = 8;
  total = 0;
  private searchTimeout: any;

  get totalPages() { return Math.ceil(this.total / this.pageSize); }

  constructor(public auth: AuthService, private productService: ProductService) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll(this.currentPage, this.pageSize, this.searchTerm, this.selectedCategory)
      .subscribe({
        next: (res) => {
          this.products = res.data.items;
          this.total = res.data.total;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(res => this.categories = res.data);
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 400);
  }

  onFilter() {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }
}
