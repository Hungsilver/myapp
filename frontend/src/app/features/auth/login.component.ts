import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">🛍️</div>
          <h1>Đăng nhập</h1>
          <p>Chào mừng bạn trở lại!</p>
        </div>

        <div class="alert error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email"
              placeholder="your@email.com" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" [(ngModel)]="password" name="password"
              placeholder="••••••••" required />
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <div class="auth-footer">
          Chưa có tài khoản? <a routerLink="/register">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.errorMsg = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Đăng nhập thất bại';
        this.loading = false;
      }
    });
  }
}
