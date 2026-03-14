export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avartarUrl?: string;
  gender?: number;
  birthDate?: string;
  listRole?: string;
  isAdmin?: boolean;
  isUser?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  fullname: string;
  phoneNumber?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
}

export interface UpdateProfileRequest {
  username?: string;
  fullname?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  gender?: number;
  birthDate?: string;
}
