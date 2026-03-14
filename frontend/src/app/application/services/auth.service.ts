import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthApiService } from '../../infrastructure/api/auth-api.service';
import { ApiResponse } from '../../domain/models/api-response.model';
import {
  LoginRequest, RegisterRequest, GoogleLoginRequest,
  UpdateProfileRequest, AuthResponse, User
} from '../../domain/models/user.model';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(this._loadUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.isAdmin === true);

  constructor(private authApi: AuthApiService, private router: Router) {}

  private _loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private _saveSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.authApi.login(request).pipe(
      tap(res => {
        if (res.isSuccess && res.data) {
          this._saveSession(res.data);
          this._fetchAndCacheUser();
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<User>> {
    return this.authApi.register(request);
  }

  loginWithGoogle(idToken: string): Observable<ApiResponse<AuthResponse>> {
    return this.authApi.loginWithGoogle({ idToken }).pipe(
      tap(res => {
        if (res.isSuccess && res.data) {
          this._saveSession(res.data);
          this._fetchAndCacheUser();
        }
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const token = this.getRefreshToken() ?? '';
    return this.authApi.refreshToken({ refreshToken: token }).pipe(
      tap(res => {
        if (res.isSuccess && res.data) {
          this._saveSession(res.data);
        }
      })
    );
  }

  private _fetchAndCacheUser(): void {
    this.authApi.getCurrentUser().subscribe(res => {
      if (res.isSuccess && res.data) {
        this._currentUser.set(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      }
    });
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.authApi.updateProfile(request).pipe(
      tap(res => {
        if (res.isSuccess && res.data) {
          this._currentUser.set(res.data);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        }
      })
    );
  }

  logout(): void {
    const token = this.getRefreshToken();
    if (token) {
      this.authApi.revokeToken({ refreshToken: token }).subscribe();
    }
    localStorage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/']);
  }
}
