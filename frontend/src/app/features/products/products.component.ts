import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../application/services/product.service';
import { AuthService } from '../../application/services/auth.service';
import { Product, CreateProductRequest } from '../../domain/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .page {
      min-height: 100vh;
      background: #080810;
      color: white;
      padding: 80px 24px 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .container { max-width: 1300px; margin: 0 auto; }

    /* PAGE HEADER */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title-wrap h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 4px;
    }
    .page-title-wrap p {
      color: rgba(255,255,255,0.4);
      font-size: 14px;
      margin: 0;
    }
    .btn-add {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 11px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    /* FILTERS */
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .search-wrap {
      flex: 1;
      min-width: 240px;
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.3);
      font-size: 14px;
    }
    .search-input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 11px 14px 11px 38px;
      color: white;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .search-input:focus {
      border-color: rgba(102,126,234,0.5);
      background: rgba(255,255,255,0.07);
    }
    .search-input::placeholder { color: rgba(255,255,255,0.25); }
    .filter-select {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 11px 14px;
      color: white;
      font-size: 14px;
      outline: none;
      min-width: 180px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-select:focus { border-color: rgba(102,126,234,0.5); }
    .filter-select option { background: #1a1a2e; }

    /* LOADING */
    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      gap: 16px;
      color: rgba(255,255,255,0.4);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* STATS BAR */
    .stats-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
    }

    /* PRODUCT GRID */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .product-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.25s;
    }
    .product-card:hover {
      border-color: rgba(255,255,255,0.15);
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.3);
    }
    .product-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: rgba(255,255,255,0.05);
    }
    .img-placeholder {
      width: 100%;
      height: 180px;
      background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
    }
    .product-body { padding: 16px; }
    .category-badge {
      display: inline-block;
      background: rgba(102,126,234,0.15);
      color: #818cf8;
      border: 1px solid rgba(102,126,234,0.25);
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .product-name {
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 6px;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .product-desc {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      margin: 0 0 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }
    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price {
      font-size: 16px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stock {
      font-size: 12px;
      color: rgba(255,255,255,0.35);
    }
    .stock.low { color: #f87171; }
    .product-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .btn-edit {
      flex: 1;
      background: rgba(102,126,234,0.15);
      color: #818cf8;
      border: 1px solid rgba(102,126,234,0.2);
      border-radius: 8px;
      padding: 7px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-edit:hover { background: rgba(102,126,234,0.25); }
    .btn-delete {
      flex: 1;
      background: rgba(239,68,68,0.1);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      padding: 7px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-delete:hover { background: rgba(239,68,68,0.2); }

    /* INACTIVE BADGE */
    .inactive-badge {
      display: inline-block;
      background: rgba(239,68,68,0.1);
      color: #f87171;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 700;
      margin-left: 6px;
    }

    /* EMPTY */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: rgba(255,255,255,0.3);
    }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 18px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }

    /* PAGINATION */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .page-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.7);
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-info {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      padding: 0 12px;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 24px;
    }
    .modal {
      background: #111122;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      padding: 32px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .modal-title {
      font-size: 20px;
      font-weight: 800;
      color: white;
    }
    .modal-close {
      background: rgba(255,255,255,0.08);
      border: none;
      color: rgba(255,255,255,0.5);
      border-radius: 8px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }
    .modal-close:hover { background: rgba(255,255,255,0.15); color: white; }
    .modal .form-group { margin-bottom: 16px; }
    .modal label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 7px;
    }
    .modal input, .modal textarea {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 11px 14px;
      color: white;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .modal input:focus, .modal textarea:focus {
      border-color: rgba(102,126,234,0.5);
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    .modal input::placeholder, .modal textarea::placeholder { color: rgba(255,255,255,0.25); }
    .modal textarea { resize: vertical; min-height: 80px; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-confirm {
      flex: 1;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-confirm:hover:not(:disabled) { opacity: 0.9; }
    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-modal-cancel {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-modal-cancel:hover { background: rgba(255,255,255,0.1); }
    .modal-alert {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .modal-alert.error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      color: #f87171;
    }
  `],
  template: `
    <div class="page">
      <div class="container">

        <!-- Page Header -->
        <div class="page-header">
          <div class="page-title-wrap">
            <h1>📦 Sản phẩm</h1>
            <p>Quản lý danh mục sản phẩm</p>
          </div>
          @if (auth.isAdmin()) {
            <button class="btn-add" (click)="openCreate()">+ Thêm sản phẩm</button>
          }
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input
              class="search-input"
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Tìm kiếm sản phẩm..."
              (input)="onSearch()"
            />
          </div>
          <select class="filter-select" [(ngModel)]="selectedCategory" (change)="onFilter()">
            <option value="">Tất cả danh mục</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="loading-wrap">
            <div class="spinner"></div>
            <span>Đang tải sản phẩm...</span>
          </div>
        } @else {
          <!-- Stats Bar -->
          <div class="stats-bar">
            <span>{{ total() }} sản phẩm</span>
            <span>Trang {{ currentPage }} / {{ totalPages }}</span>
          </div>

          <!-- Products Grid -->
          @if (products().length > 0) {
            <div class="products-grid">
              @for (p of products(); track p.id) {
                <div class="product-card">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" class="product-img"
                      onerror="this.style.display='none'" />
                  } @else {
                    <div class="img-placeholder">📦</div>
                  }
                  <div class="product-body">
                    @if (p.category) {
                      <span class="category-badge">{{ p.category }}</span>
                    }
                    <div class="product-name">
                      {{ p.name }}
                      @if (!p.isActive) {
                        <span class="inactive-badge">Ẩn</span>
                      }
                    </div>
                    <p class="product-desc">{{ p.description || 'Chưa có mô tả' }}</p>
                    <div class="product-footer">
                      <span class="price">{{ p.price | number:'1.0-0' }}đ</span>
                      <span class="stock" [class.low]="p.stock < 5">Còn {{ p.stock }}</span>
                    </div>
                    @if (auth.isAdmin()) {
                      <div class="product-actions">
                        <button class="btn-edit" (click)="openEdit(p)">✏️ Sửa</button>
                        <button class="btn-delete" (click)="deleteProduct(p.id)">🗑️ Xóa</button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          }

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="pagination">
              <button class="page-btn" [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">◀ Trước</button>
              <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
              <button class="page-btn" [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">Sau ▶</button>
            </div>
          }
        }

      </div>
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">{{ editingId() ? '✏️ Sửa sản phẩm' : '+ Thêm sản phẩm' }}</span>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          @if (modalError()) {
            <div class="modal-alert error">❌ {{ modalError() }}</div>
          }

          <div class="form-group">
            <label>Tên sản phẩm *</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Tên sản phẩm" />
          </div>
          <div class="form-group">
            <label>Mô tả</label>
            <textarea [(ngModel)]="form.description" placeholder="Mô tả sản phẩm..."></textarea>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Giá (VNĐ) *</label>
              <input type="number" [(ngModel)]="form.price" placeholder="0" min="0" />
            </div>
            <div class="form-group">
              <label>Tồn kho *</label>
              <input type="number" [(ngModel)]="form.stock" placeholder="0" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Danh mục</label>
            <input type="text" [(ngModel)]="form.category" placeholder="Electronics, Fashion..." />
          </div>
          <div class="form-group">
            <label>URL Ảnh</label>
            <input type="url" [(ngModel)]="form.imageUrl" placeholder="https://..." />
          </div>

          <div class="modal-actions">
            <button class="btn-confirm" (click)="saveProduct()" [disabled]="saving()">
              {{ saving() ? '⏳ Đang lưu...' : '💾 Lưu' }}
            </button>
            <button class="btn-modal-cancel" (click)="closeModal()">Hủy</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductsComponent implements OnInit {
  auth = inject(AuthService);
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal(false);
  total = signal(0);

  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  readonly pageSize = 9;
  private searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // Modal state
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  modalError = signal('');
  form: CreateProductRequest & { imageUrl?: string } = this._emptyForm();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.isSuccess) {
          this.products.set(res.data ?? []);
          this.total.set(res.totalRecord ?? 0);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(res => {
      if (res.isSuccess) this.categories.set(res.data ?? []);
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 400);
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  // Modal
  private _emptyForm(): CreateProductRequest & { imageUrl?: string } {
    return { name: '', description: '', price: 0, stock: 0, category: '', imageUrl: '' };
  }

  openCreate(): void {
    this.form = this._emptyForm();
    this.editingId.set(null);
    this.modalError.set('');
    this.showModal.set(true);
  }

  openEdit(p: Product): void {
    this.form = {
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stock: p.stock,
      category: p.category ?? '',
      imageUrl: p.imageUrl ?? '',
    };
    this.editingId.set(p.id);
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveProduct(): void {
    if (!this.form.name) {
      this.modalError.set('Tên sản phẩm không được để trống');
      return;
    }
    this.saving.set(true);
    this.modalError.set('');

    const id = this.editingId();
    const req$ = id
      ? this.productService.updateProduct(id, this.form)
      : this.productService.createProduct(this.form);

    req$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.closeModal();
          this.loadProducts();
          this.loadCategories();
        } else {
          this.modalError.set(res.error || 'Lưu thất bại');
        }
      },
      error: () => {
        this.saving.set(false);
        this.modalError.set('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    this.productService.deleteProduct(id).subscribe(res => {
      if (res.isSuccess) this.loadProducts();
    });
  }
}
