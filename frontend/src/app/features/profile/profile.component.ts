import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';
import { UpdateProfileRequest } from '../../domain/models/user.model';

@Component({
  selector: 'app-profile',
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
    .container {
      max-width: 720px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 32px;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 16px;
    }
    .breadcrumb a {
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      transition: color 0.2s;
    }
    .breadcrumb a:hover { color: rgba(255,255,255,0.7); }
    .breadcrumb span { color: rgba(255,255,255,0.2); }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .subtitle {
      color: rgba(255,255,255,0.4);
      font-size: 14px;
      margin-top: 6px;
    }

    /* AVATAR SECTION */
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-info h3 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .avatar-info p {
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      margin: 0 0 12px;
    }
    .role-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .role-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.5px;
    }
    .role-badge.admin {
      background: rgba(239,68,68,0.2);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.3);
    }
    .role-badge.user {
      background: rgba(102,126,234,0.2);
      color: #818cf8;
      border: 1px solid rgba(102,126,234,0.3);
    }

    /* FORM CARD */
    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 20px;
      color: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group.full { grid-column: span 2; }
    label {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input, select {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 11px 14px;
      color: white;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      border-color: rgba(102,126,234,0.5);
      background: rgba(255,255,255,0.07);
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    input:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    input::placeholder { color: rgba(255,255,255,0.25); }
    select option { background: #1a1a2e; }

    /* ACTIONS */
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-save {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-save:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-cancel {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-cancel:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    /* ALERT */
    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alert.success {
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.2);
      color: #4ade80;
    }
    .alert.error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      color: #f87171;
    }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full { grid-column: span 1; }
      .avatar-section { flex-direction: column; text-align: center; }
      .role-badges { justify-content: center; }
    }
  `],
  template: `
    <div class="page">
      <div class="container">
        <div class="page-header">
          <div class="breadcrumb">
            <a routerLink="/">Trang chủ</a>
            <span>›</span>
            <span>Hồ sơ cá nhân</span>
          </div>
          <h1>👤 Hồ sơ cá nhân</h1>
          <p class="subtitle">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <!-- Avatar section -->
        <div class="avatar-section">
          <div class="avatar-large">
            @if (auth.currentUser()?.avartarUrl) {
              <img [src]="auth.currentUser()?.avartarUrl" alt="avatar" />
            } @else {
              {{ getInitial() }}
            }
          </div>
          <div class="avatar-info">
            <h3>{{ auth.currentUser()?.fullname || auth.currentUser()?.username }}</h3>
            <p>{{ auth.currentUser()?.email }}</p>
            <div class="role-badges">
              @if (auth.currentUser()?.isAdmin) {
                <span class="role-badge admin">👑 Admin</span>
              }
              @if (auth.currentUser()?.isUser) {
                <span class="role-badge user">👤 User</span>
              }
            </div>
          </div>
        </div>

        <!-- Alert -->
        @if (successMsg()) {
          <div class="alert success">✅ {{ successMsg() }}</div>
        }
        @if (errorMsg()) {
          <div class="alert error">❌ {{ errorMsg() }}</div>
        }

        <!-- Edit form -->
        <div class="card">
          <div class="card-title">✏️ Chỉnh sửa thông tin</div>
          <div class="form-grid">
            <div class="form-group">
              <label>Email</label>
              <input type="email" [value]="auth.currentUser()?.email || ''" disabled />
            </div>
            <div class="form-group">
              <label>Tên đăng nhập</label>
              <input type="text" [(ngModel)]="form.username" placeholder="username" />
            </div>
            <div class="form-group">
              <label>Họ và tên</label>
              <input type="text" [(ngModel)]="form.fullname" placeholder="Nguyễn Văn A" />
            </div>
            <div class="form-group">
              <label>Số điện thoại</label>
              <input type="tel" [(ngModel)]="form.phoneNumber" placeholder="0912345678" />
            </div>
            <div class="form-group full">
              <label>Địa chỉ</label>
              <input type="text" [(ngModel)]="form.address" placeholder="123 Đường ABC, Quận 1, TP.HCM" />
            </div>
            <div class="form-group full">
              <label>URL Ảnh đại diện</label>
              <input type="url" [(ngModel)]="form.avatarUrl" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label>Giới tính</label>
              <select [(ngModel)]="form.gender">
                <option [ngValue]="undefined">-- Chọn giới tính --</option>
                <option [ngValue]="1">Nam</option>
                <option [ngValue]="2">Nữ</option>
                <option [ngValue]="3">Khác</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input type="date" [(ngModel)]="form.birthDate" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-save" (click)="save()" [disabled]="saving()">
              {{ saving() ? '⏳ Đang lưu...' : '💾 Lưu thay đổi' }}
            </button>
            <button class="btn-cancel" (click)="reset()">Đặt lại</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  auth = inject(AuthService);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  form: UpdateProfileRequest = this._buildForm();

  private _buildForm(): UpdateProfileRequest {
    const u = this.auth.currentUser();
    return {
      username: u?.username ?? '',
      fullname: u?.fullname ?? '',
      phoneNumber: u?.phoneNumber ?? '',
      address: u?.address ?? '',
      avatarUrl: u?.avartarUrl ?? '',
      gender: u?.gender,
      birthDate: u?.birthDate ? u.birthDate.split('T')[0] : undefined,
    };
  }

  getInitial(): string {
    const u = this.auth.currentUser();
    const name = u?.fullname || u?.username || u?.email || '?';
    return name.charAt(0).toUpperCase();
  }

  save(): void {
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.auth.updateProfile(this.form).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.successMsg.set('Cập nhật thông tin thành công!');
        } else {
          this.errorMsg.set(res.error || 'Cập nhật thất bại');
        }
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    });
  }

  reset(): void {
    this.form = this._buildForm();
    this.successMsg.set('');
    this.errorMsg.set('');
  }
}
