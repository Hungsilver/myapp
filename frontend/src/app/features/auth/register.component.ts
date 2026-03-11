import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">🛍️</div>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản mới</p>
        </div>

        <div class="alert error" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="alert success" *ngIf="successMsg">{{ successMsg }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Họ và tên</label>
            <input type="text" [(ngModel)]="fullName" name="fullName"
              placeholder="Nguyễn Văn A" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email"
              placeholder="your@email.com" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" [(ngModel)]="password" name="password"
              placeholder="Tối thiểu 6 ký tự" required minlength="6" />
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>
        </form>

        <div class="auth-footer">
          Đã có tài khoản? <a routerLink="/login">Đăng nhập</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.errorMsg = '';
    this.auth.register(this.fullName, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Đăng ký thất bại';
        this.loading = false;
      }
    });
  }
}
