import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: #080810;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .auth-page::before {
      content: '';
      position: absolute;
      top: -300px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 700px;
      background: radial-gradient(ellipse, rgba(102,126,234,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .auth-card {
      position: relative;
      width: 100%;
      max-width: 420px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px;
      color: white;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      font-size: 13px;
      margin-bottom: 28px;
      transition: color 0.2s;
    }
    .back-link:hover { color: rgba(255,255,255,0.7); }
    .logo {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: rgba(255,255,255,0.4);
      font-size: 14px;
      margin-bottom: 28px;
    }
    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .alert.error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      color: #f87171;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 7px;
    }
    input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 12px 14px;
      color: white;
      font-size: 15px;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s;
    }
    input:focus {
      border-color: rgba(102,126,234,0.5);
      background: rgba(255,255,255,0.07);
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    input::placeholder { color: rgba(255,255,255,0.25); }
    .btn-submit {
      width: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
      transition: all 0.2s;
      letter-spacing: 0.3px;
    }
    .btn-submit:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(102,126,234,0.35);
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .footer-text {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: rgba(255,255,255,0.4);
    }
    .footer-text a {
      color: #a78bfa;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-text a:hover { text-decoration: underline; }
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
      color: rgba(255,255,255,0.2);
      font-size: 12px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.08);
    }
  `],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="back-link">← Quay về trang chủ</a>
        <div class="logo">✦</div>
        <h1>Đăng nhập</h1>
        <p class="subtitle">Chào mừng bạn trở lại!</p>

        @if (errorMsg()) {
          <div class="alert error">❌ {{ errorMsg() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email"
              placeholder="your@email.com" required autocomplete="email" />
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" [(ngModel)]="password" name="password"
              placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <button type="submit" class="btn-submit" [disabled]="loading()">
            {{ loading() ? '⏳ Đang đăng nhập...' : '🔑 Đăng nhập' }}
          </button>
        </form>

        <div class="footer-text">
          Chưa có tài khoản? <a routerLink="/register">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.isSuccess) {
          this.router.navigate(['/']);
        } else {
          this.errorMsg.set(res.error || 'Đăng nhập thất bại');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.error || err.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    });
  }
}
