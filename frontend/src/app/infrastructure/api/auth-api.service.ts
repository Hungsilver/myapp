import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../domain/models/api-response.model';
import {
  LoginRequest, RegisterRequest, GoogleLoginRequest,
  RefreshTokenRequest, UpdateProfileRequest,
  AuthResponse, User
} from '../../domain/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/register`, request);
  }

  loginWithGoogle(request: GoogleLoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login-google`, request);
  }

  refreshToken(request: RefreshTokenRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh-token`, request);
  }

  revokeToken(request: RefreshTokenRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/revoke-token`, request);
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/update-profile`, request);
  }
}
