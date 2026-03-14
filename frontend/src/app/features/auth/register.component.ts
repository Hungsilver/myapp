import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: #080810;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .auth-page::before {
      content: '';
      position: absolute;
      top: -200px;
      right: -200px;
      width: 600px;
      height: 600px;
      background: radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .auth-card {
      position: relative;
      width: 100%;
      max-width: 480px;
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
    .alert.success {
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.25);
      color: #4ade80;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group.no-margin { margin-bottom: 0; }
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
      font-size: 14px;
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
    .hint {
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      margin-top: 5px;
    }
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

    @media (max-width: 480px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="back-link">← Quay về trang chủ</a>
        <div class="logo">✦</div>
        <h1>Đăng ký</h1>
        <p class="subtitle">Tạo tài khoản mới miễn phí</p>

        @if (errorMsg()) {
          <div class="alert error">❌ {{ errorMsg() }}</div>
        }
        @if (successMsg()) {
          <div class="alert success">✅ {{ successMsg() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group no-margin">
              <label>Tên đăng nhập *</label>
              <input type="text" [(ngModel)]="form.username" name="username"
                placeholder="username" required />
            </div>
            <div class="form-group no-margin">
              <label>Họ và tên *</label>
              <input type="text" [(ngModel)]="form.fullname" name="fullname"
                placeholder="Nguyễn Văn A" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="form.email" name="email"
              placeholder="your@email.com" required autocomplete="email" />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input type="tel" [(ngModel)]="form.phoneNumber" name="phoneNumber"
              placeholder="0912345678" />
          </div>
          <div class="form-group">
            <label>Mật khẩu *</label>
            <input type="password" [(ngModel)]="form.password" name="password"
              placeholder="Tối thiểu 6 ký tự" required minlength="6" autocomplete="new-password" />
            <p class="hint">Ít nhất 6 ký tự</p>
          </div>
          <button type="submit" class="btn-submit" [disabled]="loading()">
            {{ loading() ? '⏳ Đang đăng ký...' : '🚀 Tạo tài khoản' }}
          </button>
        </form>

        <div class="footer-text">
          Đã có tài khoản? <a routerLink="/login">Đăng nhập</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = {
    username: '',
    fullname: '',
    email: '',
    password: '',
    phoneNumber: '',
  };
  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.form.username || !this.form.fullname || !this.form.email || !this.form.password) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.auth.register({
      username: this.form.username,
      fullname: this.form.fullname,
      email: this.form.email,
      password: this.form.password,
      phoneNumber: this.form.phoneNumber || undefined,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.isSuccess) {
          this.successMsg.set('Đăng ký thành công! Đang chuyển hướng...');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.errorMsg.set(res.error || 'Đăng ký thất bại');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.error || err.error?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.');
      }
    });
  }
}
