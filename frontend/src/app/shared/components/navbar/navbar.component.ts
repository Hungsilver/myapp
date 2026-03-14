import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../application/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  styles: [`
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(10, 10, 20, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 24px;
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .logo-text span {
      background: linear-gradient(90deg, #667eea, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nav-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-links a:hover,
    .nav-links a.active {
      color: white;
      background: rgba(255,255,255,0.1);
    }
    .nav-links a.active {
      color: #a78bfa;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-login {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn-login:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .btn-register {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(102,126,234,0.3);
    }
    .btn-register:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(102,126,234,0.4);
    }
    .user-menu {
      position: relative;
    }
    .user-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 7px 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
    }
    .user-btn:hover {
      background: rgba(255,255,255,0.12);
    }
    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      overflow: hidden;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .user-name {
      font-size: 13px;
      font-weight: 500;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chevron {
      font-size: 10px;
      opacity: 0.6;
      transition: transform 0.2s;
    }
    .chevron.open {
      transform: rotate(180deg);
    }
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 200px;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .dropdown-header {
      padding: 10px 12px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 6px;
    }
    .dropdown-header .name {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }
    .dropdown-header .email {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      margin-top: 2px;
    }
    .dropdown a, .dropdown button {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
    }
    .dropdown a:hover, .dropdown button:hover {
      background: rgba(255,255,255,0.07);
      color: white;
    }
    .dropdown .logout {
      color: #f87171;
      margin-top: 4px;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 8px;
    }
    .dropdown .logout:hover {
      background: rgba(248,113,113,0.1);
      color: #f87171;
    }
  `],
  template: `
    <nav>
      <div class="nav-inner">
        <a routerLink="/" class="nav-logo">
          <div class="logo-icon">✦</div>
          <div class="logo-text">AI<span>Hub</span></div>
        </a>

        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">🏠 Trang chủ</a></li>
          <li><a routerLink="/quiz" routerLinkActive="active">🎮 Quiz Hub</a></li>
        </ul>

        <div class="nav-actions">
          @if (!auth.isLoggedIn()) {
            <a routerLink="/login" class="btn-login">Đăng nhập</a>
            <a routerLink="/register" class="btn-register">Đăng ký</a>
          } @else {
            <div class="user-menu">
              <button class="user-btn" (click)="toggleDropdown()">
                <div class="avatar">
                  @if (auth.currentUser()?.avartarUrl) {
                    <img [src]="auth.currentUser()?.avartarUrl" alt="avatar" />
                  } @else {
                    {{ getInitial() }}
                  }
                </div>
                <span class="user-name">{{ auth.currentUser()?.fullname || auth.currentUser()?.username }}</span>
                <span class="chevron" [class.open]="dropdownOpen()">▾</span>
              </button>
              @if (dropdownOpen()) {
                <div class="dropdown" (clickoutside)="closeDropdown()">
                  <div class="dropdown-header">
                    <div class="name">{{ auth.currentUser()?.fullname || auth.currentUser()?.username }}</div>
                    <div class="email">{{ auth.currentUser()?.email }}</div>
                  </div>
                  <a routerLink="/profile" (click)="closeDropdown()">👤 Hồ sơ cá nhân</a>
                  <a routerLink="/quiz/bank" (click)="closeDropdown()">📚 Ngân hàng câu hỏi</a>
                  <button class="logout" (click)="logout()">🚪 Đăng xuất</button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  dropdownOpen = signal(false);

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.dropdownOpen.set(false);
  }

  getInitial(): string {
    const user = this.auth.currentUser();
    const name = user?.fullname || user?.username || user?.email || '?';
    return name.charAt(0).toUpperCase();
  }

  logout() {
    this.closeDropdown();
    this.auth.logout();
  }
}
